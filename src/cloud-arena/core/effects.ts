import {
  getCardDefinitionFromLibrary,
  isEquipmentCardDefinition,
  isPermanentCardDefinition,
} from "../cards/definitions.js";
import { chooseOptionalEffect, choosePermanents, chooseSingleObject } from "./choices.js";
import { getTotalAttackAmount, hasBlockAmount } from "./combat-values.js";
import {
  attachPermanentToTarget,
  adjustPermanentHealth,
  canSummonPermanentFromCard,
  summonPermanentFromCard,
  trySummonPermanentFromCard,
  destroyPermanent,
  isEquipmentPermanent,
  syncEnemyStateFromLeaderPermanent,
  syncEnemyLeaderPermanentFromState,
} from "./permanents.js";
import { emitRulesEvent } from "./rules-events.js";
import { drawCards } from "./draw.js";
import { payAbilityCostBundle } from "./activated-abilities.js";
import {
  findPermanentById,
  selectObjects,
  selectPermanents,
  type SelectedObject,
  type SelectorContext,
} from "./selectors.js";
import { evaluateValueExpression } from "./value-expressions.js";
import type {
  BattleState,
  AbilityCost,
  CardInstance,
  Effect,
  CardEffect,
  Targeting,
  PermanentState,
  Selector,
  BattleAction,
  PendingHandCardContext,
} from "./types.js";

export type EffectResolutionContext = SelectorContext & {
  abilityTargeting?: Targeting;
  abilityCosts?: AbilityCost[];
  pendingCardPlay?: PendingHandCardContext;
  pendingCardPreview?: PendingHandCardContext;
};

function getCounterSource(
  context: EffectResolutionContext,
): { sourceKind: "card" | "permanent"; sourceId: string } {
  if (context.abilitySourcePermanentId) {
    return {
      sourceKind: "permanent",
      sourceId: context.abilitySourcePermanentId,
    };
  }

  if (context.sourceCardInstanceId) {
    return {
      sourceKind: "card",
      sourceId: context.sourceCardInstanceId,
    };
  }

  return {
    sourceKind: "card",
    sourceId: "unknown",
  };
}

function createCounterId(state: BattleState): string {
  const counterId = `counter_${state.turnNumber}_${state.nextCounterIndex}`;
  state.nextCounterIndex += 1;
  return counterId;
}

function createTargetRequestId(state: BattleState): string {
  const targetRequestId = `target_${state.turnNumber}_${state.nextTargetRequestIndex}`;
  state.nextTargetRequestIndex += 1;
  return targetRequestId;
}

function formatCounterLabel(powerDelta: number, healthDelta: number): string {
  const formatSigned = (value: number): string => `${value >= 0 ? "+" : ""}${value}`;
  return `${formatSigned(powerDelta)}/${formatSigned(healthDelta)}`;
}

function addCounterInstance(
  state: BattleState,
  permanent: PermanentState,
  counter: {
    id: string;
    counter: string;
    stat: "power" | "health";
    amount: number;
    sourceKind: "card" | "permanent";
    sourceId: string;
  },
): void {
  permanent.counters = [...(permanent.counters ?? []), counter];

  if (counter.stat === "health") {
    adjustPermanentHealth(permanent, counter.amount);
  }

  emitRulesEvent(state, {
    type: "counter_added",
    turnNumber: state.turnNumber,
    permanentId: permanent.instanceId,
    counterId: counter.id,
    counter: counter.counter,
    stat: counter.stat,
    amount: counter.amount,
    sourceKind: counter.sourceKind,
    sourceId: counter.sourceId,
  });
}

function removeCounterInstance(
  state: BattleState,
  permanent: PermanentState,
  counterIndex: number,
): void {
  const counter = permanent.counters?.[counterIndex];

  if (!counter) {
    return;
  }

  permanent.counters = (permanent.counters ?? []).filter((_, index) => index !== counterIndex);

  if (counter.stat === "health") {
    adjustPermanentHealth(permanent, -counter.amount);
  }

  emitRulesEvent(state, {
    type: "counter_removed",
    turnNumber: state.turnNumber,
    permanentId: permanent.instanceId,
    counterId: counter.id,
    counter: counter.counter,
    stat: counter.stat,
    amount: counter.amount,
    sourceKind: counter.sourceKind,
    sourceId: counter.sourceId,
  });
}

export function dealDamageToEnemy(
  state: BattleState,
  amount: number,
  source: "card" | "permanent_action" = "card",
  sourceId?: string,
): number {
  const leaderPermanentId = state.enemy.leaderPermanentId;
  const leaderPermanent = leaderPermanentId
    ? state.enemyBattlefield.find((permanent) => permanent?.instanceId === leaderPermanentId) ?? null
    : null;

  if (leaderPermanent) {
    const damageDealt = Math.max(0, Math.min(amount, leaderPermanent.block + leaderPermanent.health));

    if (leaderPermanent.block >= amount) {
      leaderPermanent.block -= amount;
    } else {
      const remainingDamage = amount - leaderPermanent.block;
      leaderPermanent.block = 0;
      leaderPermanent.health -= remainingDamage;
    }

    syncEnemyStateFromLeaderPermanent(state);

    if (damageDealt > 0) {
      state.log.push({
        type: "damage_dealt",
        turnNumber: state.turnNumber,
        source,
        sourceId,
        target: "enemy",
        amount: damageDealt,
      });
    }

    return damageDealt;
  }

  const damageDealt = Math.max(0, Math.min(amount, state.enemy.block + state.enemy.health));

  if (state.enemy.block >= amount) {
    state.enemy.block -= amount;
  } else {
    const remainingDamage = amount - state.enemy.block;
    state.enemy.block = 0;
    state.enemy.health -= remainingDamage;
  }

  if (damageDealt > 0) {
    state.log.push({
      type: "damage_dealt",
      turnNumber: state.turnNumber,
      source,
      sourceId,
      target: "enemy",
      amount: damageDealt,
    });
  }

  return damageDealt;
}

export function gainBlockToPlayer(state: BattleState, amount: number): number {
  if (amount <= 0) {
    return 0;
  }

  state.player.block += amount;
  state.log.push({
    type: "block_gained",
    turnNumber: state.turnNumber,
    target: "player",
    amount,
  });
  return amount;
}

export function gainBlockToPermanent(
  state: BattleState,
  permanent: PermanentState,
  amount: number,
): number {
  if (amount <= 0) {
    return 0;
  }

  permanent.block += amount;
  if (permanent.isEnemyLeader) {
    syncEnemyStateFromLeaderPermanent(state);
  }
  state.log.push({
    type: "block_gained",
    turnNumber: state.turnNumber,
    target: "permanent",
    targetId: permanent.instanceId,
    amount,
  });
  return amount;
}

export function dealDamageToPermanent(
  state: BattleState,
  permanent: PermanentState,
  amount: number,
  source: "card" | "permanent_action" = "card",
  sourceId?: string,
): number {
  const damageDealt = Math.max(0, Math.min(amount, permanent.block + permanent.health));

  if (permanent.block >= amount) {
    permanent.block -= amount;
  } else {
    const remainingDamage = amount - permanent.block;
    permanent.block = 0;
    permanent.health -= remainingDamage;
  }

  if (permanent.isEnemyLeader) {
    syncEnemyStateFromLeaderPermanent(state);
  }

  if (damageDealt > 0) {
    state.log.push({
      type: "damage_dealt",
      turnNumber: state.turnNumber,
      source,
      sourceId,
      target: "permanent",
      targetId: permanent.instanceId,
      amount: damageDealt,
    });
  }

  return damageDealt;
}

function resolvePermanentTargets(
  state: BattleState,
  target: "self" | Selector,
  context: EffectResolutionContext,
): PermanentState[] {
  if (target === "self") {
    return selectPermanents(state, { relation: "self" }, context);
  }

  if (context.chosenTargetPermanentId) {
    const chosenTarget = findPermanentById(state, context.chosenTargetPermanentId);

    if (!chosenTarget) {
      return [];
    }

    const legalTargets = selectPermanents(state, target, {
      ...context,
      chosenTargetPermanentId: undefined,
    });

    if (!legalTargets.some((permanent) => permanent.instanceId === chosenTarget.instanceId)) {
      throw new Error(`Permanent ${chosenTarget.instanceId} is not a valid target for this effect.`);
    }

    return [chosenTarget];
  }

  return selectPermanents(state, target, context);
}

function isTargetedEffect(effect: Effect): boolean {
  return "targeting" in effect && effect.targeting !== undefined;
}

function getTargetSelectorForEffect(effect: Effect): Selector | null {
  switch (effect.type) {
    case "sacrifice":
      return effect.selector;
    case "add_counter":
    case "remove_counter":
    case "deal_damage":
    case "gain_block":
    case "restore_health":
    case "draw_card":
    case "attach_from_battlefield":
      return typeof effect.target === "string" ? null : effect.target;
    case "return_from_graveyard":
      return effect.selector;
    case "summon_permanent":
    case "attach_from_hand":
      return null;
  }

  return null;
}

function applyTargetingToSelector(
  selector: Selector,
  targeting: Targeting | undefined,
): Selector {
  if (targeting?.allowSelfTarget === false && !selector.relation) {
    return {
      ...selector,
      relation: "another",
    };
  }

  return selector;
}

function queueTargetRequest(
  state: BattleState,
  effect: Effect,
  effects: Effect[],
  nextEffectIndex: number,
  context: EffectResolutionContext,
): void {
  const targeting = {
    ...(context.abilityTargeting ?? {}),
    ...((effect as { targeting?: Targeting }).targeting ?? {}),
  };
  const prompt = targeting?.prompt ?? "Choose a target";

  const selector = getTargetSelectorForEffect(effect);

  if (!selector) {
    throw new Error("Targeted effects must specify a selector target.");
  }

  const legalTargets = selectObjects(state, applyTargetingToSelector(selector, targeting), context);
  const targetKind = legalTargets[0]?.kind ?? (
    selector.zone === "hand" || selector.zone === "graveyard" || selector.zone === "discard"
      ? "card"
      : "permanent"
  );

  state.pendingTargetRequest = {
    id: createTargetRequestId(state),
    prompt,
    optional: targeting?.optional ?? false,
    targetKind,
    selector: applyTargetingToSelector(selector, targeting),
    effects,
    nextEffectIndex,
    context: {
      abilitySourcePermanentId: context.abilitySourcePermanentId,
      triggerSubjectPermanentId: context.triggerSubjectPermanentId,
      sourceCardInstanceId: context.sourceCardInstanceId,
      pendingCardPlay: context.pendingCardPlay,
      pendingCardPreview: context.pendingCardPreview,
    },
    abilityCosts: context.abilityCosts,
  };
}

function removeCardFromHand(state: BattleState, cardInstanceId: string): CardInstance {
  const card = state.player.hand.find((entry) => entry.instanceId === cardInstanceId);

  if (!card) {
    throw new Error(`Card ${cardInstanceId} was not found in hand.`);
  }

  state.player.hand = state.player.hand.filter((entry) => entry.instanceId !== cardInstanceId);
  return card;
}

function resolveAddCounterEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "add_counter" }>,
  context: EffectResolutionContext,
): void {
  const targets = resolvePermanentTargets(state, effect.target, context);
  const source = getCounterSource(context);

  if (typeof effect.powerDelta === "number" || typeof effect.healthDelta === "number") {
    const powerDelta = effect.powerDelta ?? 0;
    const healthDelta = effect.healthDelta ?? 0;

    if (powerDelta === 0 && healthDelta === 0) {
      return;
    }

    const counterLabel = effect.counter ?? formatCounterLabel(powerDelta, healthDelta);

    for (const permanent of targets) {
      if (powerDelta !== 0) {
        addCounterInstance(state, permanent, {
          id: createCounterId(state),
          counter: counterLabel,
          stat: "power",
          amount: powerDelta,
          sourceKind: source.sourceKind,
          sourceId: source.sourceId,
        });
      }

      if (healthDelta !== 0) {
        addCounterInstance(state, permanent, {
          id: createCounterId(state),
          counter: counterLabel,
          stat: "health",
          amount: healthDelta,
          sourceKind: source.sourceKind,
          sourceId: source.sourceId,
        });
      }
    }

    return;
  }

  const amount = Math.max(0, evaluateValueExpression(state, effect.amount ?? { type: "constant", value: 0 }, context));

  if (amount <= 0 || !effect.counter || !effect.stat) {
    return;
  }

  for (const permanent of targets) {
    addCounterInstance(state, permanent, {
      id: createCounterId(state),
      counter: effect.counter,
      stat: effect.stat,
      amount,
      sourceKind: source.sourceKind,
      sourceId: source.sourceId,
    });
  }
}

function resolveRemoveCounterEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "remove_counter" }>,
  context: EffectResolutionContext,
): void {
  const amount = Math.max(0, evaluateValueExpression(state, effect.amount, context));

  if (amount <= 0) {
    return;
  }

  const targets = resolvePermanentTargets(state, effect.target, context);

  for (const permanent of targets) {
    const matchingCounterIndexes = (permanent.counters ?? [])
      .map((counter, index) => ({ counter, index }))
      .filter(({ counter }) =>
        (effect.counterId ? counter.id === effect.counterId : counter.counter === effect.counter) &&
        (!effect.stat || counter.stat === effect.stat) &&
        (!effect.sourceKind || counter.sourceKind === effect.sourceKind) &&
        (!effect.sourceId || counter.sourceId === effect.sourceId),
      )
      .map(({ index }) => index)
      .sort((left, right) => right - left);

    let remainingToRemove = amount;

    for (const index of matchingCounterIndexes) {
      if (remainingToRemove <= 0) {
        break;
      }

      const counter = permanent.counters?.[index];
      if (!counter) {
        continue;
      }

      removeCounterInstance(state, permanent, index);
      remainingToRemove -= 1;
    }
  }
}

function resolveSacrificeEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "sacrifice" }>,
  context: EffectResolutionContext,
): void {
  if (context.chosenTargetPermanentId) {
    const legalTargets = selectPermanents(state, effect.selector, {
      ...context,
      chosenTargetPermanentId: undefined,
    });
    const chosenTarget = legalTargets.find(
      (permanent) => permanent.instanceId === context.chosenTargetPermanentId,
    );

    if (chosenTarget) {
      destroyPermanent(state, chosenTarget.instanceId);
      return;
    }
  }

  const targets = choosePermanents(state, {
    selector: effect.selector,
    amount: effect.amount,
    reason: "Resolve sacrifice effect",
    controllerId: "player",
    context,
  });

  for (const permanent of targets) {
    destroyPermanent(state, permanent.instanceId);
  }
}

function resolveDealDamageEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "deal_damage" }>,
  context: EffectResolutionContext,
): void {
  const amount = Math.max(0, evaluateValueExpression(state, effect.amount, context));

  if (amount <= 0) {
    return;
  }

  if (effect.target === "enemy") {
    dealDamageToEnemy(state, amount);
    return;
  }

  if (effect.target === "player") {
    state.player.health -= amount;
    state.log.push({
      type: "damage_dealt",
      turnNumber: state.turnNumber,
      source: "card",
      target: "player",
      amount,
    });
    return;
  }

  for (const permanent of resolvePermanentTargets(state, effect.target, context)) {
    dealDamageToPermanent(state, permanent, amount);
  }
}

function resolveGainBlockEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "gain_block" }>,
  context: EffectResolutionContext,
): void {
  const amount = Math.max(0, evaluateValueExpression(state, effect.amount, context));

  if (amount <= 0) {
    return;
  }

  if (effect.target === "player") {
    gainBlockToPlayer(state, amount);
    return;
  }

  for (const permanent of resolvePermanentTargets(state, effect.target, context)) {
    gainBlockToPermanent(state, permanent, amount);
  }
}

function resolveRestoreHealthEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "restore_health" }>,
  context: EffectResolutionContext,
): void {
  const targets = resolvePermanentTargets(state, effect.target, context);

  for (const permanent of targets) {
    permanent.health = permanent.maxHealth;

    if (permanent.isEnemyLeader) {
      syncEnemyStateFromLeaderPermanent(state);
    }
  }
}

function resolveDrawCardEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "draw_card" }>,
  context: EffectResolutionContext,
): void {
  const amount = Math.max(0, evaluateValueExpression(state, effect.amount, context));

  if (amount <= 0) {
    return;
  }

  const drawnCards = drawCards(state, amount);

  for (const card of drawnCards.cards) {
    state.log.push({
      type: "card_drawn",
      turnNumber: state.turnNumber,
      cardId: card.definitionId,
    });
  }
}

function resolveGainEnergyEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "gain_energy" }>,
  context: EffectResolutionContext,
): void {
  const amount = Math.max(0, evaluateValueExpression(state, effect.amount, context));

  if (amount <= 0) {
    return;
  }

  if (effect.target !== "player") {
    return;
  }

  state.player.energy += amount;
  state.log.push({
    type: "energy_gained",
    turnNumber: state.turnNumber,
    target: "player",
    amount,
    source: context.abilitySourcePermanentId ? "permanent_action" : context.sourceCardInstanceId ? "card" : "ability",
    sourceId: context.abilitySourcePermanentId ?? context.sourceCardInstanceId,
  });
}

function resolveSummonPermanentEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "summon_permanent" }>,
  context: EffectResolutionContext,
): void {
  const amount = Math.max(
    0,
    effect.amount ? evaluateValueExpression(state, effect.amount, context) : 1,
  );

  for (let index = 0; index < amount; index += 1) {
    const definition = getCardDefinitionFromLibrary(state.cardDefinitions, effect.cardId);
    if (!isPermanentCardDefinition(definition)) {
      throw new Error(`Effect cannot summon non-permanent card ${effect.cardId}.`);
    }

    const controllerId = effect.controllerId ?? "player";
    const cardInstanceId = `effect_${effect.cardId}_${state.turnNumber}_${state.rules.length + index + 1}`;
    trySummonPermanentFromCard(
      state,
      {
        instanceId: cardInstanceId,
        definitionId: effect.cardId,
      },
      controllerId,
    );
  }
}

function resolveAttachFromHandEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "attach_from_hand" }>,
  context: EffectResolutionContext,
): void {
  const targetPermanent = resolvePermanentTargets(state, effect.target, context)[0];

  if (!targetPermanent) {
    return;
  }

  const attachmentCandidate = chooseSingleObject(state, {
    selector: effect.selector,
    reason: "Choose a card from hand to attach",
    controllerId: "player",
    context,
    optional: effect.optional,
  });

  const attachmentCard =
    attachmentCandidate?.kind === "card" && attachmentCandidate.zone === "hand"
      ? attachmentCandidate
      : null;

  const shouldResolve = attachmentCard !== null;

  if (effect.optional && !chooseOptionalEffect(state, {
    reason: "Choose whether to attach an Equipment from hand",
    shouldResolve,
    controllerId: "player",
  })) {
    return;
  }

  if (!attachmentCard) {
    return;
  }

  const definition = getCardDefinitionFromLibrary(state.cardDefinitions, attachmentCard.card.definitionId);
  const isEquipment = isEquipmentCardDefinition(definition);

  if (!isEquipment) {
    if (effect.optional) {
      return;
    }

    throw new Error(`Card ${definition.id} cannot be attached because it is not Equipment.`);
  }

  if (!isPermanentCardDefinition(definition)) {
    throw new Error(`Card ${definition.id} cannot be attached because it is not a permanent.`);
  }

  if (!canSummonPermanentFromCard(state, attachmentCard.card)) {
    return;
  }

  const card = removeCardFromHand(state, attachmentCard.card.instanceId);
  const attachmentPermanent = trySummonPermanentFromCard(state, card);
  if (!attachmentPermanent) {
    return;
  }
  if (!isEquipmentPermanent(state, attachmentPermanent)) {
    throw new Error(`Permanent ${attachmentPermanent.instanceId} is not a valid Equipment attachment.`);
  }
  attachPermanentToTarget(state, attachmentPermanent, targetPermanent);
}

function resolveAttachFromBattlefieldEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "attach_from_battlefield" }>,
  context: EffectResolutionContext,
): void {
  const sourcePermanentId = context.abilitySourcePermanentId;

  if (!sourcePermanentId) {
    throw new Error("attach_from_battlefield effects require an ability source permanent.");
  }

  const attachmentPermanent = findPermanentById(state, sourcePermanentId);

  if (!attachmentPermanent) {
    throw new Error(`Permanent ${sourcePermanentId} was not found on the battlefield.`);
  }

  const targetPermanent = resolvePermanentTargets(state, effect.target, context)[0];

  if (!targetPermanent) {
    return;
  }

  if (!isEquipmentPermanent(state, attachmentPermanent)) {
    throw new Error(`Permanent ${attachmentPermanent.instanceId} is not a valid Equipment attachment.`);
  }

  attachPermanentToTarget(state, attachmentPermanent, targetPermanent);
}

function resolveReturnFromGraveyardEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "return_from_graveyard" }>,
  context: EffectResolutionContext,
): void {
  const targets = resolveCardTargets(state, effect.selector, context);
  const chosenCard = targets[0];

  if (!chosenCard) {
    return;
  }

  state.player.graveyard = state.player.graveyard.filter(
    (card) => card.instanceId !== chosenCard.instanceId,
  );
  state.player.hand.push(chosenCard);
  emitRulesEvent(state, {
    type: "card_drawn",
    turnNumber: state.turnNumber,
    cardInstanceId: chosenCard.instanceId,
    definitionId: chosenCard.definitionId,
    controllerId: "player",
  });
}

function resolveStunEffect(state: BattleState, effect: Extract<Effect, { type: "stun" }>): void {
  if (effect.target === "enemy") {
    state.enemy.stunnedThisTurn = true;
    syncEnemyLeaderPermanentFromState(state);
  }
}

function resolveCardTargets(
  state: BattleState,
  target: Selector,
  context: EffectResolutionContext,
): CardInstance[] {
  const selectedObjects = selectObjects(state, target, context);

  if (context.chosenTargetCardInstanceId) {
    const chosenTarget = selectedObjects.find(
      (object): object is Extract<SelectedObject, { kind: "card" }> =>
        object.kind === "card" &&
        object.card.instanceId === context.chosenTargetCardInstanceId,
    );

    if (!chosenTarget) {
      throw new Error(`Card ${context.chosenTargetCardInstanceId} is not a valid target for this effect.`);
    }

    return [chosenTarget.card];
  }

  const chosenCards: CardInstance[] = [];

  for (const object of selectedObjects) {
    if (object.kind === "card") {
      chosenCards.push(object.card);
    }
  }

  return chosenCards;
}

function resolveEffectsFromIndex(
  state: BattleState,
  effects: Effect[],
  context: EffectResolutionContext,
  startIndex = 0,
): void {
  if (state.pendingTargetRequest) {
    throw new Error("Cannot resolve effects while a target selection is pending.");
  }

  for (let index = startIndex; index < effects.length; index += 1) {
    const effect = effects[index];

    if (!effect) {
      continue;
    }

    const requiresTargetSelection =
      isTargetedEffect(effect) || context.abilityTargeting !== undefined;
    const hasChosenTarget =
      context.chosenTargetPermanentId !== undefined || context.chosenTargetCardInstanceId !== undefined;

    if (requiresTargetSelection && !hasChosenTarget) {
      const selector = getTargetSelectorForEffect(effect);

      if (selector) {
        const targeting = {
          ...(context.abilityTargeting ?? {}),
          ...((effect as { targeting?: Targeting }).targeting ?? {}),
        };
        const legalTargets = selectObjects(
          state,
          applyTargetingToSelector(selector, targeting),
          context,
        );

        if (legalTargets.length === 0) {
          if (targeting.optional) {
            continue;
          }

          return;
        }
      }

      queueTargetRequest(state, effect, effects, index, context);
      return;
    }

    resolveEffect(state, effect, context);

    if (state.pendingTargetRequest) {
      return;
    }
  }
}

export function resolveEffect(
  state: BattleState,
  effect: Effect,
  context: EffectResolutionContext = {},
): void {
  switch (effect.type) {
    case "add_counter":
      resolveAddCounterEffect(state, effect, context);
      return;
    case "remove_counter":
      resolveRemoveCounterEffect(state, effect, context);
      return;
    case "sacrifice":
      resolveSacrificeEffect(state, effect, context);
      return;
    case "deal_damage":
      resolveDealDamageEffect(state, effect, context);
      return;
    case "gain_block":
      resolveGainBlockEffect(state, effect, context);
      return;
    case "restore_health":
      resolveRestoreHealthEffect(state, effect, context);
      return;
    case "draw_card":
      resolveDrawCardEffect(state, effect, context);
      return;
    case "gain_energy":
      resolveGainEnergyEffect(state, effect, context);
      return;
    case "summon_permanent":
      resolveSummonPermanentEffect(state, effect, context);
      return;
    case "attach_from_hand":
      resolveAttachFromHandEffect(state, effect, context);
      return;
    case "attach_from_battlefield":
      resolveAttachFromBattlefieldEffect(state, effect, context);
      return;
    case "return_from_graveyard":
      resolveReturnFromGraveyardEffect(state, effect, context);
      return;
    case "stun":
      resolveStunEffect(state, effect);
      return;
  }
}

export function resolveEffects(
  state: BattleState,
  effects: Effect[],
  context: EffectResolutionContext = {},
): void {
  resolveEffectsFromIndex(state, effects, context);
}

export function resolveSpellEffects(
  state: BattleState,
  effects: Effect[],
  context: EffectResolutionContext = {},
): void {
  resolveEffectsFromIndex(state, effects, context);
}

export function resolvePendingTargetRequest(
  state: BattleState,
  action: Extract<BattleAction, { type: "choose_target" } | { type: "choose_card" }>,
): void {
  const pending = state.pendingTargetRequest;

  if (!pending) {
    throw new Error("There is no pending target request to resolve.");
  }

  if (pending.targetKind === "card") {
    if (action.type !== "choose_card") {
      throw new Error("A card must be chosen before taking another action.");
    }

    const legalTargets = selectObjects(state, pending.selector, pending.context);
    const chosenTarget = legalTargets.find(
      (object) => object.kind === "card" && object.card.instanceId === action.targetCardInstanceId,
    );

    if (!chosenTarget || chosenTarget.kind !== "card") {
      throw new Error(`Card ${action.targetCardInstanceId} is not a valid target.`);
    }

    if (pending.abilityCosts && pending.context.abilitySourcePermanentId) {
      const sourcePermanent = findPermanentById(state, pending.context.abilitySourcePermanentId);

      if (!sourcePermanent) {
        throw new Error(`Permanent ${pending.context.abilitySourcePermanentId} was not found on the battlefield.`);
      }

      payAbilityCostBundle(state, sourcePermanent, pending.abilityCosts);
    }

    state.pendingTargetRequest = null;

    resolveEffectsFromIndex(
      state,
      pending.effects,
      {
        ...pending.context,
        chosenTargetCardInstanceId: chosenTarget.card.instanceId,
      },
      pending.nextEffectIndex,
    );

    if (!state.pendingTargetRequest && pending.context.pendingCardPlay) {
      summonPermanentFromCard(
        state,
        {
          instanceId: pending.context.pendingCardPlay.cardInstanceId,
          definitionId: pending.context.pendingCardPlay.definitionId,
        },
      );
    }

    return;
  }

  if (action.type !== "choose_target") {
    throw new Error("A permanent must be chosen before taking another action.");
  }

  const chosenTarget = findPermanentById(state, action.targetPermanentId);

  if (!chosenTarget) {
    throw new Error(`Permanent ${action.targetPermanentId} was not found on the battlefield.`);
  }

  const legalTargets = selectObjects(state, pending.selector, pending.context);
  if (!legalTargets.some((object) => object.kind === "permanent" && object.permanent.instanceId === chosenTarget.instanceId)) {
    throw new Error(`Permanent ${action.targetPermanentId} is not a valid target.`);
  }

  if (pending.abilityCosts && pending.context.abilitySourcePermanentId) {
    const sourcePermanent = findPermanentById(state, pending.context.abilitySourcePermanentId);

    if (!sourcePermanent) {
      throw new Error(`Permanent ${pending.context.abilitySourcePermanentId} was not found on the battlefield.`);
    }

    payAbilityCostBundle(state, sourcePermanent, pending.abilityCosts);
  }

  state.pendingTargetRequest = null;

  resolveEffectsFromIndex(
    state,
    pending.effects,
    {
      ...pending.context,
      chosenTargetPermanentId: chosenTarget.instanceId,
    },
    pending.nextEffectIndex,
  );

  if (pending.context.defendingPermanentId) {
    const defendingPermanent = findPermanentById(state, pending.context.defendingPermanentId);

    if (!defendingPermanent) {
      throw new Error(`Permanent ${pending.context.defendingPermanentId} was not found on the battlefield.`);
    }

    defendingPermanent.blockingTargetPermanentId = chosenTarget.instanceId;
  }

  if (!state.pendingTargetRequest && pending.context.pendingCardPlay) {
    summonPermanentFromCard(
      state,
      {
        instanceId: pending.context.pendingCardPlay.cardInstanceId,
        definitionId: pending.context.pendingCardPlay.definitionId,
      },
    );
  }
}

export function getEffectDamageAmount(effect: {
  attackAmount?: number;
  attackTimes?: number;
}): number {
  return getTotalAttackAmount(effect);
}

function isSelectorTarget(target: CardEffect["target"]): target is Selector {
  return typeof target === "object";
}

function createEnemyBattlefieldAttackSelector(): Selector {
  return {
    zone: "enemy_battlefield",
    controller: "opponent",
    cardType: "permanent",
  };
}

export function resolveLegacyCardEffects(
  state: BattleState,
  effects: CardEffect[],
  context: EffectResolutionContext = {},
): void {
  for (const effect of effects) {
    const damageAmount = getTotalAttackAmount(effect);

    if (damageAmount > 0 && isSelectorTarget(effect.target)) {
      resolveEffects(state, [
        {
          type: "deal_damage",
          target: effect.target,
          amount: { type: "constant", value: damageAmount },
          targeting: effect.targeting,
        },
      ], context);
      continue;
    }

    if (damageAmount > 0 && effect.target === "enemy" && state.enemyBattlefield.some((slot) => slot !== null)) {
      resolveEffects(state, [
        {
          type: "deal_damage",
          target: createEnemyBattlefieldAttackSelector(),
          amount: { type: "constant", value: damageAmount },
          targeting: effect.targeting ?? { prompt: "Choose an enemy to attack" },
        },
      ], context);
      continue;
    }

    if (effect.target === "enemy" && damageAmount > 0) {
      resolveEffect(state, {
        type: "deal_damage",
        target: "enemy",
        amount: { type: "constant", value: damageAmount },
      }, context);
    }

    if (effect.target === "player" && hasBlockAmount(effect)) {
      resolveEffect(state, {
        type: "gain_block",
        target: "player",
        amount: { type: "constant", value: effect.blockAmount ?? 0 },
      }, context);
    }
  }
}
