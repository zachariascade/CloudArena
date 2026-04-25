import {
  applyTemporaryPowerDeltaToAllPermanents,
  applyTemporaryPowerDeltaToControlledPermanents,
} from "./effects.js";
import {
  syncEnemyLeaderPermanentFromState,
  trySummonPermanentFromCard,
} from "./permanents.js";
import { formatEnemyIntent } from "./enemy-intent.js";
import { settleEnemyAttackDamage } from "../combat/settle-damage.js";
import type {
  BattleState,
  CardInstance,
  EnemyCardDefinition,
  EnemyCardEffect,
  EnemyEffectResolveTiming,
} from "./types.js";

export function getEnemyEffectResolveTiming(effect: EnemyCardEffect): EnemyEffectResolveTiming {
  return effect.resolveTiming ?? "end_of_player_turn";
}

function summonEnemyToken(state: BattleState, cardId: string, enterSick = false): void {
  const card: CardInstance = {
    instanceId: `card_${state.turnNumber}_${state.nextEnemyTokenIndex}`,
    definitionId: cardId,
  };

  state.nextEnemyTokenIndex += 1;
  const permanent = trySummonPermanentFromCard(state, card, "enemy");

  if (enterSick && permanent) {
    permanent.hasActedThisTurn = true;
  }
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
): void {
  if (effect.target === "player") {
    const baseAttackAmount =
      typeof effect.attackAmount === "number"
        ? effect.attackAmount
        : typeof effect.attackPowerMultiplier === "number"
          ? Math.max(0, Math.floor(state.enemy.basePower * effect.attackPowerMultiplier))
          : 0;
    const attackAmount = baseAttackAmount * Math.max(1, effect.attackTimes ?? 1);

    if (attackAmount > 0) {
      settleEnemyAttackDamage(
        state,
        attackAmount,
        state.enemy.leaderPermanentId ?? "enemy_intent",
        effect.overflowPolicy,
      );
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
          ? Math.max(0, Math.floor(state.enemy.basePower * effect.blockPowerMultiplier))
          : typeof effect.blockHealthMultiplier === "number"
            ? Math.max(0, Math.floor(state.enemy.health * effect.blockHealthMultiplier))
            : 0;
    state.enemy.block += blockAmount;
    state.log.push({
      type: "block_gained",
      turnNumber: state.turnNumber,
      target: "enemy",
      amount: blockAmount,
    });
  }

  if (effect.target === "enemy" && typeof effect.powerDelta === "number") {
    state.enemy.basePower += effect.powerDelta;
    state.log.push({
      type: "enemy_power_gained",
      turnNumber: state.turnNumber,
      amount: effect.powerDelta,
      newBasePower: state.enemy.basePower,
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
      summonEnemyToken(state, effect.spawnCardId, true);
    }
  }
}

export function primeEnemyCardForTurn(
  state: BattleState,
  card: EnemyCardDefinition | null,
): EnemyCardDefinition | null {
  if (!card) {
    return null;
  }

  const immediateCard = getEnemyCardForResolveTiming(card, "immediate");

  if (immediateCard) {
    for (const effect of immediateCard.effects) {
      applyEnemyCardEffect(state, card.id, effect);
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

  syncEnemyLeaderPermanentFromState(
    state,
    formatEnemyIntent(state.enemy.intent),
    state.enemy.intentQueueLabels,
  );

  return getEnemyCardForResolveTiming(card, "end_of_player_turn");
}

export function resolveScheduledEnemyCardEffects(state: BattleState): void {
  const scheduledEffects = [...state.scheduledEnemyCardEffects];
  state.scheduledEnemyCardEffects = [];

  for (const scheduled of scheduledEffects) {
    applyEnemyCardEffect(state, scheduled.sourceCardId, scheduled.effect);
  }
}
