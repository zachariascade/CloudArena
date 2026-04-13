import {
  getCardDefinitionFromLibrary,
  isEquipmentCardDefinition,
  isPermanentCardDefinition,
} from "../cards/definitions.js";
import { chooseOptionalEffect, choosePermanents, chooseSingleObject } from "./choices.js";
import { getTotalAttackAmount, hasBlockAmount } from "./combat-values.js";
import {
  attachPermanentToTarget,
  summonPermanentFromCard,
  destroyPermanent,
  isEquipmentPermanent,
} from "./permanents.js";
import { emitRulesEvent } from "./rules-events.js";
import { selectObjects, selectPermanents, type SelectorContext } from "./selectors.js";
import { evaluateValueExpression } from "./value-expressions.js";
import type {
  BattleState,
  CardInstance,
  Effect,
  PermanentState,
  Selector,
} from "./types.js";

export type EffectResolutionContext = SelectorContext;

export function dealDamageToEnemy(
  state: BattleState,
  amount: number,
  source: "card" | "permanent_action" = "card",
  sourceId?: string,
): number {
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

  return selectPermanents(state, target, context);
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
  const amount = Math.max(0, evaluateValueExpression(state, effect.amount, context));

  if (amount <= 0) {
    return;
  }

  const targets = resolvePermanentTargets(state, effect.target, context);

  for (const permanent of targets) {
    const nextAmount = (permanent.counters?.[effect.counter] ?? 0) + amount;
    permanent.counters = {
      ...(permanent.counters ?? {}),
      [effect.counter]: nextAmount,
    };

    emitRulesEvent(state, {
      type: "counter_added",
      turnNumber: state.turnNumber,
      permanentId: permanent.instanceId,
      counter: effect.counter,
      amount,
    });
  }
}

function resolveSacrificeEffect(
  state: BattleState,
  effect: Extract<Effect, { type: "sacrifice" }>,
  context: EffectResolutionContext,
): void {
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

  for (const permanent of selectPermanents(state, effect.target, context)) {
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

    const cardInstanceId = `effect_${effect.cardId}_${state.turnNumber}_${state.rules.length + index + 1}`;
    summonPermanentFromCard(state, {
      instanceId: cardInstanceId,
      definitionId: effect.cardId,
    });
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

  const card = removeCardFromHand(state, attachmentCard.card.instanceId);
  const attachmentPermanent = summonPermanentFromCard(state, card);
  if (!isEquipmentPermanent(state, attachmentPermanent)) {
    throw new Error(`Permanent ${attachmentPermanent.instanceId} is not a valid Equipment attachment.`);
  }
  attachPermanentToTarget(state, attachmentPermanent, targetPermanent);
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
    case "sacrifice":
      resolveSacrificeEffect(state, effect, context);
      return;
    case "deal_damage":
      resolveDealDamageEffect(state, effect, context);
      return;
    case "gain_block":
      resolveGainBlockEffect(state, effect, context);
      return;
    case "summon_permanent":
      resolveSummonPermanentEffect(state, effect, context);
      return;
    case "attach_from_hand":
      resolveAttachFromHandEffect(state, effect, context);
      return;
  }
}

export function resolveEffects(
  state: BattleState,
  effects: Effect[],
  context: EffectResolutionContext = {},
): void {
  for (const effect of effects) {
    resolveEffect(state, effect, context);
  }
}

export function getEffectDamageAmount(effect: {
  attackAmount?: number;
  attackTimes?: number;
}): number {
  return getTotalAttackAmount(effect);
}

export function resolveLegacyCardEffects(
  state: BattleState,
  effects: Array<{
    attackAmount?: number;
    attackTimes?: number;
    blockAmount?: number;
    target: "player" | "enemy";
  }>,
): void {
  for (const effect of effects) {
    const damageAmount = getTotalAttackAmount(effect);

    if (effect.target === "enemy" && damageAmount > 0) {
      resolveEffect(state, {
        type: "deal_damage",
        target: "enemy",
        amount: { type: "constant", value: damageAmount },
      });
    }

    if (effect.target === "player" && hasBlockAmount(effect)) {
      resolveEffect(state, {
        type: "gain_block",
        target: "player",
        amount: { type: "constant", value: effect.blockAmount ?? 0 },
      });
    }
  }
}
