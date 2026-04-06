import { getCardDefinitionFromLibrary } from "../cards/definitions.js";
import { getEnemyIntentAttackAmount } from "../core/enemy-intent.js";
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

  for (const permanentId of state.blockingQueue) {
    const permanent = state.battlefield.find((entry) => entry?.instanceId === permanentId);

    if (!permanent) {
      continue;
    }

    remainingDamage = Math.max(0, remainingDamage - (permanent.block + permanent.health));
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
  actionType: "attack" | "defend",
): number {
  const permanent = state.battlefield.find((entry) => entry?.instanceId === permanentId);
  const actionDefinition = permanent?.actions.find((entry) =>
    actionType === "attack"
      ? typeof entry.attackAmount === "number" && entry.attackAmount > 0
      : typeof entry.blockAmount === "number" && entry.blockAmount > 0,
  );

  if (!actionDefinition) {
    return 0;
  }

  if (typeof actionDefinition.attackAmount === "number") {
    return actionDefinition.attackAmount * Math.max(1, actionDefinition.attackTimes ?? 1);
  }

  return actionDefinition.blockAmount ?? 0;
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

function isPermanentCard(state: BattleState, cardId: CardDefinitionId): boolean {
  return getCardDefinition(state, cardId).type === "permanent";
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

  if (action.type === "use_permanent_action" && action.action === "defend") {
    return Math.min(
      remainingDamage,
      getPermanentActionAmount(state, action.permanentId, "defend"),
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

  if (action.type === "use_permanent_action" && action.action === "attack") {
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
  const openBoardSlotExists = state.battlefield.some((slot) => slot === null);
  const remainingIncomingDamage = getRemainingIncomingDamageAfterCurrentDefense(state);

  if (action.type === "end_turn") {
    return remainingIncomingDamage > 0 ? -100 : -10;
  }

  if (action.type === "use_permanent_action") {
    if (action.action === "defend") {
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
    if (action.action === "defend") {
      return preventedDamage > 0
        ? `permanent defend prevents ${preventedDamage} incoming damage`
        : incomingAttackIsDangerous
          ? "permanent defend stabilizes against dangerous pressure"
          : "permanent defend is lower value this turn";
    }

    const damage = getEffectiveEnemyDamage(
      state,
      getPermanentActionAmount(state, action.permanentId, "attack"),
    );
    return damage > 0
      ? `permanent attack deals ${damage} effective damage`
      : "permanent attack is mostly absorbed by enemy block";
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
