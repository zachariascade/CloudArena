import {
  applyTemporaryPowerDeltaToAllPermanents,
  applyTemporaryPowerDeltaToControlledPermanents,
} from "./effects.js";
import { getDerivedPermanentStat } from "./derived-stats.js";
import { getCardDefinitionFromLibrary } from "../cards/definitions.js";
import {
  permanentHasKeyword,
  getEnemyActorPermanent,
  trySummonPermanentFromCard,
} from "./permanents.js";
import { settleEnemyAttackDamage } from "../combat/settle-damage.js";
import type {
  BattleState,
  CardInstance,
  EnemyActorState,
  EnemyCardDefinition,
  EnemyCardEffect,
  EnemyEffectResolveTiming,
} from "./types.js";

export function getEnemyEffectResolveTiming(effect: EnemyCardEffect): EnemyEffectResolveTiming {
  return effect.resolveTiming ?? "end_of_player_turn";
}

function summonEnemyToken(state: BattleState, cardId: string): void {
  const card: CardInstance = {
    instanceId: `card_${state.turnNumber}_${state.nextEnemyTokenIndex}`,
    definitionId: cardId,
  };

  state.nextEnemyTokenIndex += 1;
  trySummonPermanentFromCard(state, card, "enemy", state.turnNumber);
}

export function getEnemyCardForResolveTiming(
  card: EnemyCardDefinition,
  timing: EnemyEffectResolveTiming,
): EnemyCardDefinition | null {
  const effects = card.effects.filter(
    (effect) => getEnemyEffectResolveTiming(effect) === timing,
  );

  if (effects.length === 0) {
    return null;
  }

  return {
    ...card,
    effects: effects.map((effect) => ({ ...effect })),
  };
}

export function applyEnemyCardEffect(
  state: BattleState,
  sourceCardId: string,
  effect: EnemyCardEffect,
  actor?: EnemyActorState,
): void {
  const resolvedActor = actor ?? state.enemies[0];

  if (!resolvedActor) {
    return;
  }

  const actorPermanent = getEnemyActorPermanent(state, resolvedActor);
  const actorBasePower = actorPermanent
    ? getDerivedPermanentStat(state, actorPermanent, "power")
    : resolvedActor.basePower;
  const actorHealth = actorPermanent
    ? getDerivedPermanentStat(state, actorPermanent, "health")
    : resolvedActor.health;
  const attackSourceId = resolvedActor.permanentId ?? "enemy_intent";

  if (effect.target === "player") {
    const baseAttackAmount =
      typeof effect.attackAmount === "number"
        ? effect.attackAmount
        : typeof effect.attackPowerMultiplier === "number"
          ? Math.max(0, Math.floor(actorBasePower * effect.attackPowerMultiplier))
          : 0;
    const hitCount = Math.max(1, effect.attackTimes ?? 1);

    if (baseAttackAmount > 0) {
      const attackSourceDefinition = resolvedActor.definitionId
        ? getCardDefinitionFromLibrary(state.cardDefinitions, resolvedActor.definitionId)
        : null;
      const attackBypassesBlock =
        !!effect.bypassBlock ||
        (actorPermanent ? permanentHasKeyword(actorPermanent, "pierce") : false) ||
        !!(attackSourceDefinition && "keywords" in attackSourceDefinition && attackSourceDefinition.keywords?.includes("pierce"));
      for (let hit = 0; hit < hitCount; hit++) {
        settleEnemyAttackDamage(
          state,
          baseAttackAmount,
          attackSourceId,
          effect.overflowPolicy,
          attackBypassesBlock,
        );
      }
    }
  }

  if (
    effect.target === "enemy" &&
    (effect.blockAmount !== undefined ||
      effect.blockPowerMultiplier !== undefined ||
      effect.blockHealthMultiplier !== undefined)
  ) {
    const blockAmount =
      typeof effect.blockAmount === "number"
        ? effect.blockAmount
        : typeof effect.blockPowerMultiplier === "number"
          ? Math.max(0, Math.floor(actorBasePower * effect.blockPowerMultiplier))
          : typeof effect.blockHealthMultiplier === "number"
            ? Math.max(0, Math.floor(actorHealth * effect.blockHealthMultiplier))
            : 0;

    if (actorPermanent) {
      actorPermanent.block += blockAmount;
    }
    resolvedActor.block += blockAmount;

    state.log.push({
      type: "block_gained",
      turnNumber: state.turnNumber,
      target: "enemy",
      amount: blockAmount,
    });
  }

  if (effect.target === "enemy" && typeof effect.powerDelta === "number") {
    resolvedActor.basePower += effect.powerDelta;
    if (actorPermanent) {
      actorPermanent.power += effect.powerDelta;
    }
    state.log.push({
      type: "enemy_power_gained",
      turnNumber: state.turnNumber,
      amount: effect.powerDelta,
      newBasePower: resolvedActor.basePower,
    });
  }

  if (effect.target === "enemy" && typeof effect.powerDeltaAllPermanents === "number") {
    applyTemporaryPowerDeltaToAllPermanents(
      state,
      effect.powerDeltaAllPermanents,
      "card",
      sourceCardId,
      state.turnNumber + 2,
    );
  }

  if (effect.target === "player" && typeof effect.energyDelta === "number") {
    state.player.energy = Math.max(0, state.player.energy + effect.energyDelta);
  }

  if (effect.target === "player" && typeof effect.powerDeltaTargetPermanents === "number") {
    applyTemporaryPowerDeltaToControlledPermanents(
      state,
      effect.powerDeltaTargetPermanents,
      "card",
      sourceCardId,
      state.turnNumber + 2,
      "player",
    );
  }

  if (effect.target === "enemy" && effect.spawnCardId) {
    const count = effect.spawnCount ?? 1;

    for (let index = 0; index < count; index += 1) {
      summonEnemyToken(state, effect.spawnCardId);
    }
  }
}

export function primeEnemyCardForTurn(
  state: BattleState,
  card: EnemyCardDefinition | null,
  actor?: EnemyActorState,
): EnemyCardDefinition | null {
  if (!card) {
    return null;
  }

  const immediateCard = getEnemyCardForResolveTiming(card, "immediate");

  if (immediateCard) {
    for (const effect of immediateCard.effects) {
      applyEnemyCardEffect(state, card.id, effect, actor);
    }
  }

  const nextTurnCard = getEnemyCardForResolveTiming(card, "start_of_next_turn");

  if (nextTurnCard) {
    for (const effect of nextTurnCard.effects) {
      state.scheduledEnemyCardEffects.push({
        sourceCardId: card.id,
        sourceCardName: card.name,
        effect: { ...effect },
      });
    }
  }

  return getEnemyCardForResolveTiming(card, "end_of_player_turn");
}

export function resolveScheduledEnemyCardEffects(state: BattleState): void {
  const scheduledEffects = [...state.scheduledEnemyCardEffects];
  state.scheduledEnemyCardEffects = [];

  for (const scheduled of scheduledEffects) {
    applyEnemyCardEffect(state, scheduled.sourceCardId, scheduled.effect);
  }
}
