import { getCardDefinitionFromLibrary, isPermanentCardDefinition } from "../cards/definitions.js";
import { getAbilityActionAmount, getActivatedAbilities } from "../core/activated-abilities.js";
import { getDerivedPermanentActionAmount } from "../core/derived-stats.js";
import { getEnemyIntentAttackAmount } from "../core/enemy-intent.js";
import { permanentHasKeyword } from "../core/permanents.js";
import { findPermanentById, hasOpenBattlefieldSlot } from "../core/selectors.js";
import type {
  BattleAction,
  BattleState,
  CardDefinitionId,
  SimulationDecision,
  SimulationAgent,
} from "../index.js";

type ScoredAction = {
  action: BattleAction;
  score: number;
  reason: string;
};

function getIncomingAttack(state: BattleState): number {
  return getEnemyIntentAttackAmount(state.enemy.intent);
}

function getRemainingIncomingDamageAfterCurrentDefense(state: BattleState): number {
  let remainingDamage = getIncomingAttack(state);

  remainingDamage = Math.max(0, remainingDamage - state.player.block);
  let defended = false;
  let halted = false;

  for (const permanentId of state.blockingQueue) {
    const permanent = findPermanentById(state, permanentId);

    if (!permanent) {
      continue;
    }

    if (permanent.blockingTargetPermanentId !== state.enemy.leaderPermanentId) {
      continue;
    }

    defended = true;
    halted ||= permanentHasKeyword(permanent, "halt");
    remainingDamage = Math.max(0, remainingDamage - (permanent.block + permanent.health));
  }

  if (defended && state.enemy.intent.overflowPolicy === "stop_at_blocker") {
    return 0;
  }

  if (halted && state.enemy.intent.overflowPolicy !== "trample") {
    return 0;
  }

  return remainingDamage;
}

function isIncomingAttackDangerous(state: BattleState): boolean {
  const unblockedIncomingDamage = getRemainingIncomingDamageAfterCurrentDefense(state);
  const healthLossThreshold = Math.ceil(state.player.health * 0.1);

  return unblockedIncomingDamage >= healthLossThreshold;
}

function findCardIdForAction(
  state: BattleState,
  action: BattleAction,
): CardDefinitionId | null {
  if (action.type !== "play_card") {
    return null;
  }

  const card = state.player.hand.find((entry) => entry.instanceId === action.cardInstanceId);
  return card?.definitionId ?? null;
}

function getEffectiveEnemyDamage(state: BattleState, damage: number): number {
  return Math.max(0, Math.min(damage, state.enemy.block + state.enemy.health));
}

function getEnemyHealthDamage(state: BattleState, damage: number): number {
  return Math.max(0, damage - state.enemy.block);
}

function getPermanentActionAmount(
  state: BattleState,
  permanentId: string,
  actionType: "attack" | "apply_block",
): number {
  const permanent = findPermanentById(state, permanentId);
  if (permanent && actionType === "attack") {
    return getDerivedPermanentActionAmount(state, permanent, "attack");
  }

  const actionDefinition = getActivatedAbilities(permanent?.abilities).find(
    (entry) => entry.activation.actionId === actionType,
  );

  if (!actionDefinition) {
    return 0;
  }

  return permanent ? (getAbilityActionAmount(state, permanent, actionDefinition) ?? 0) : 0;
}

function getCardDefinition(state: BattleState, cardId: CardDefinitionId) {
  return getCardDefinitionFromLibrary(state.cardDefinitions, cardId);
}

function getCardDamageAmount(state: BattleState, cardId: CardDefinitionId): number {
  const definition = getCardDefinition(state, cardId);
  const damageEffect = definition.onPlay.find(
    (effect) => typeof effect.attackAmount === "number" && effect.attackAmount > 0,
  );

  return damageEffect
    ? (damageEffect.attackAmount ?? 0) * Math.max(1, damageEffect.attackTimes ?? 1)
    : 0;
}

function getCardBlockAmount(state: BattleState, cardId: CardDefinitionId): number {
  const definition = getCardDefinition(state, cardId);
  const blockEffect = definition.onPlay.find(
    (effect) => typeof effect.blockAmount === "number" && effect.blockAmount > 0,
  );

  return blockEffect?.blockAmount ?? 0;
}

function getCardCounterSupportAmount(state: BattleState, cardId: CardDefinitionId): number {
  const definition = getCardDefinition(state, cardId);
  const spellEffects = definition.spellEffects ?? [];

  let supportAmount = 0;

  function getEffectSupportValue(effect: (typeof spellEffects)[number]): number {
    if (typeof effect !== "object" || effect === null || !("type" in effect) || effect.type !== "add_counter") {
      return 0;
    }

    if (typeof effect.powerDelta === "number" || typeof effect.healthDelta === "number") {
      return Math.abs(effect.powerDelta ?? 0) + Math.abs(effect.healthDelta ?? 0);
    }

    if ("amount" in effect && effect.counter === "+1/+1" && effect.amount?.type === "constant") {
      return effect.amount.value * 2;
    }

    return 0;
  }

  for (const effect of spellEffects) {
    const supportValue = getEffectSupportValue(effect);

    if (supportValue <= 0) {
      continue;
    }

    if (!("target" in effect) || effect.target === "self" || typeof effect.target === "string") {
      continue;
    }

    if (effect.target.zone === "battlefield" && effect.target.cardType === "permanent") {
      supportAmount += supportValue * state.battlefield.filter((slot) => slot !== null).length;
    }
  }

  return supportAmount;
}

function isPermanentCard(state: BattleState, cardId: CardDefinitionId): boolean {
  return isPermanentCardDefinition(getCardDefinition(state, cardId));
}

function getAdditionalPreventedDamage(
  state: BattleState,
  action: BattleAction,
): number {
  const remainingDamage = getRemainingIncomingDamageAfterCurrentDefense(state);

  if (remainingDamage <= 0) {
    return 0;
  }

  if (action.type === "play_card") {
    const cardId = findCardIdForAction(state, action);

    if (!cardId) {
      return 0;
    }

    const blockAmount = getCardBlockAmount(state, cardId);

    if (blockAmount > 0) {
      return Math.min(remainingDamage, blockAmount);
    }

    return 0;
  }

  if (action.type === "use_permanent_action" && action.source === "rules" && action.action === "defend") {
    return Math.min(
      remainingDamage,
      findPermanentById(state, action.permanentId)?.health ?? 0,
    );
  }

  if (action.type === "use_permanent_action" && action.source === "ability" && action.action === "apply_block") {
    return Math.min(
      remainingDamage,
      getPermanentActionAmount(state, action.permanentId, "apply_block"),
    );
  }

  return 0;
}

function isLethalAction(state: BattleState, action: BattleAction): boolean {
  if (action.type === "play_card") {
    const cardId = findCardIdForAction(state, action);

    if (!cardId) {
      return false;
    }

    const damageAmount = getCardDamageAmount(state, cardId);

    if (damageAmount > 0) {
      return getEnemyHealthDamage(state, damageAmount) >= state.enemy.health;
    }

    return false;
  }

  if (
    action.type === "use_permanent_action" &&
    ((action.source === "ability" && action.action === "attack") ||
      (action.source === "rules" && action.action === "attack"))
  ) {
    return (
      getEnemyHealthDamage(
        state,
        getPermanentActionAmount(state, action.permanentId, "attack"),
      ) >= state.enemy.health
    );
  }

  return false;
}

function scoreAction(state: BattleState, action: BattleAction): number {
  if (isLethalAction(state, action)) {
    return 1000;
  }

  const incomingAttackIsDangerous = isIncomingAttackDangerous(state);
  const openBoardSlotExists = hasOpenBattlefieldSlot(state);
  const remainingIncomingDamage = getRemainingIncomingDamageAfterCurrentDefense(state);

  if (action.type === "end_turn") {
    return remainingIncomingDamage > 0 ? -100 : -10;
  }

  if (action.type === "use_permanent_action") {
    if (action.source === "rules" && action.action === "defend") {
      const preventedDamage = getAdditionalPreventedDamage(state, action);
      return preventedDamage * 25 + (incomingAttackIsDangerous ? 80 : 10);
    }

    if (action.action === "attack") {
      const damage = getEffectiveEnemyDamage(
        state,
        getPermanentActionAmount(state, action.permanentId, "attack"),
      );

      return damage * 18 + (incomingAttackIsDangerous ? -20 : 20);
    }

    if (action.source === "ability" && action.action === "apply_block") {
      const preventedDamage = getAdditionalPreventedDamage(state, {
        ...action,
        action: "apply_block",
      });
      return preventedDamage * 25 + (incomingAttackIsDangerous ? 60 : 5);
    }
  }

  const cardId = findCardIdForAction(state, action);

  if (!cardId) {
    return 0;
  }

  const definition = getCardDefinition(state, cardId);
  let score = definition.cost * 12;
  score += state.player.energy >= definition.cost ? 10 : 0;
  score += Math.max(0, 3 - (state.player.energy - definition.cost)) * 5;

  if (isPermanentCard(state, cardId)) {
    score += openBoardSlotExists ? 120 : 0;
    score += state.turnNumber === 1 ? 30 : 0;
    score += state.battlefield.every((slot) => slot === null) ? 40 : 0;
    score += incomingAttackIsDangerous ? 40 : 10;
  }

  const cardDamageAmount = getCardDamageAmount(state, cardId);
  const cardBlockAmount = getCardBlockAmount(state, cardId);
  const cardCounterSupportAmount = getCardCounterSupportAmount(state, cardId);

  if (cardDamageAmount > 0) {
    const damage = getEffectiveEnemyDamage(state, cardDamageAmount);
    score += damage * 18;
    score += incomingAttackIsDangerous ? -10 : 10;
  }

  if (cardBlockAmount > 0) {
    const preventedDamage = getAdditionalPreventedDamage(state, action);
    score += preventedDamage * 25;
    score += incomingAttackIsDangerous ? 70 : 5;
  }

  if (cardCounterSupportAmount > 0) {
    score += cardCounterSupportAmount * 8;
  }

  return score;
}

function getReasonForAction(state: BattleState, action: BattleAction): string {
  if (isLethalAction(state, action)) {
    return "lethal damage available";
  }

  const preventedDamage = getAdditionalPreventedDamage(state, action);
  const remainingIncomingDamage = getRemainingIncomingDamageAfterCurrentDefense(state);
  const incomingAttackIsDangerous = isIncomingAttackDangerous(state);

  if (action.type === "end_turn") {
    return remainingIncomingDamage > 0
      ? "no stronger legal line before incoming damage"
      : "no meaningful action available";
  }

  if (action.type === "use_permanent_action") {
    if (action.source === "rules" && action.action === "defend") {
      return preventedDamage > 0
        ? `permanent defend prevents ${preventedDamage} incoming damage`
        : incomingAttackIsDangerous
          ? "permanent defend stabilizes against dangerous pressure"
          : "permanent defend is lower value this turn";
    }

    if (action.action === "attack") {
      const damage = getEffectiveEnemyDamage(
        state,
        getPermanentActionAmount(state, action.permanentId, "attack"),
      );
      return damage > 0
        ? `permanent attack deals ${damage} effective damage`
        : "permanent attack is mostly absorbed by enemy block";
    }

    return preventedDamage > 0
      ? `apply block prevents ${preventedDamage} incoming damage`
      : "apply block adds player protection";
  }

  const cardId = findCardIdForAction(state, action);

  if (!cardId) {
    return "highest scoring legal action";
  }

  if (isPermanentCard(state, cardId)) {
    if (state.battlefield.every((slot) => slot === null)) {
      return "establish guardian on empty board";
    }

    return "add another guardian to build board presence";
  }

  const cardDamageAmount = getCardDamageAmount(state, cardId);
  const cardBlockAmount = getCardBlockAmount(state, cardId);
  const cardCounterSupportAmount = getCardCounterSupportAmount(state, cardId);

  if (cardDamageAmount > 0 && cardBlockAmount > 0) {
    const damage = getEffectiveEnemyDamage(state, cardDamageAmount);
    return preventedDamage > 0
      ? `${getCardDefinition(state, cardId).name} deals ${damage} damage and prevents ${preventedDamage}`
      : `${getCardDefinition(state, cardId).name} deals ${damage} damage and adds block`;
  }

  if (cardDamageAmount > 0) {
    const damage = getEffectiveEnemyDamage(state, cardDamageAmount);
    return damage > 0
      ? `${getCardDefinition(state, cardId).name} deals ${damage} effective damage`
      : `${getCardDefinition(state, cardId).name} is mostly absorbed by enemy block`;
  }

  if (cardBlockAmount > 0) {
    return preventedDamage > 0
      ? `${getCardDefinition(state, cardId).name} prevents ${preventedDamage} incoming damage`
      : incomingAttackIsDangerous
        ? `${getCardDefinition(state, cardId).name} supports survival under pressure`
        : `${getCardDefinition(state, cardId).name} is low urgency this turn`;
  }

  if (cardCounterSupportAmount > 0) {
    return `${getCardDefinition(state, cardId).name} strengthens ${cardCounterSupportAmount} points of board presence`;
  }

  return "highest scoring legal action";
}

function tieBreak(left: BattleAction, right: BattleAction): number {
  const order = (action: BattleAction): number => {
    if (action.type === "play_card") {
      return 0;
    }

    if (action.type === "use_permanent_action") {
      return action.action === "defend" ? 1 : 2;
    }

    return 3;
  };

  return order(left) - order(right);
}

export function chooseHeuristicDecision(
  state: BattleState,
  legalActions: BattleAction[],
): SimulationDecision {
  const scoredActions: ScoredAction[] = legalActions.map((action) => ({
    action,
    score: scoreAction(state, action),
    reason: getReasonForAction(state, action),
  }));

  scoredActions.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return tieBreak(left.action, right.action);
  });

  const best = scoredActions[0];

  if (!best) {
    throw new Error("Heuristic agent could not choose an action.");
  }

  return {
    action: best.action,
    reason: best.reason,
  };
}

export const chooseHeuristicAction: SimulationAgent = (
  state: BattleState,
  legalActions: BattleAction[],
): BattleAction => {
  const decision = chooseHeuristicDecision(state, legalActions);
  return decision.action;
};
