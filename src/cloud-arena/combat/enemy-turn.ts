import { getCardDefinitionFromLibrary, hasCardType } from "../cards/definitions.js";
import { getDerivedPermanentActionAmount } from "../core/derived-stats.js";
import {
  syncEnemyLeaderPermanentFromState,
  syncEnemyStateFromLeaderPermanent,
  trySummonPermanentFromCard,
} from "../core/permanents.js";
import { formatEnemyIntent } from "../core/enemy-intent.js";
import { emitRulesEvent } from "../core/rules-events.js";
import { settleEnemyAttackDamage } from "./settle-damage.js";
import type { BattleState, CardInstance, EnemyCardDefinition } from "../core/types.js";
import {
  getEnemyIntentAttackAmount,
  getEnemyIntentBlockAmount,
} from "../core/enemy-intent.js";

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

function resolveEnemyCard(state: BattleState, card: EnemyCardDefinition): void {
  state.log.push({
    type: "enemy_card_played",
    turnNumber: state.turnNumber,
    cardId: card.id,
  });

  for (const effect of card.effects) {
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

    if (effect.target === "enemy" && (effect.blockAmount !== undefined || effect.blockPowerMultiplier !== undefined)) {
      const blockAmount =
        typeof effect.blockAmount === "number"
          ? effect.blockAmount
          : typeof effect.blockPowerMultiplier === "number"
            ? Math.max(0, Math.floor(state.enemy.basePower * effect.blockPowerMultiplier))
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

    if (effect.target === "enemy" && effect.spawnCardId) {
      const count = effect.spawnCount ?? 1;

      for (let index = 0; index < count; index += 1) {
        summonEnemyToken(state, effect.spawnCardId, true);
      }
    }
  }
}

function resolveEnemyBattlefieldCreatures(state: BattleState): void {
  for (const permanent of state.enemyBattlefield) {
    if (!permanent || permanent.health <= 0 || permanent.isEnemyLeader) {
      continue;
    }

    if (permanent.hasActedThisTurn) {
      continue;
    }

    const definition = getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId);

    if (!hasCardType(definition, "creature")) {
      continue;
    }

    const attackAmount = getDerivedPermanentActionAmount(state, permanent, "attack");

    if (attackAmount <= 0) {
      continue;
    }

    state.log.push({
      type: "permanent_acted",
      turnNumber: state.turnNumber,
      permanentId: permanent.instanceId,
      source: "rules",
      action: "attack",
    });

    emitRulesEvent(state, {
      type: "permanent_attacked",
      turnNumber: state.turnNumber,
      permanentId: permanent.instanceId,
      sourceCardInstanceId: permanent.sourceCardInstanceId,
      definitionId: permanent.definitionId,
      controllerId: permanent.controllerId ?? "enemy",
      slotIndex: permanent.slotIndex,
    });

    settleEnemyAttackDamage(state, attackAmount, permanent.instanceId, "stop_at_blocker");
    permanent.hasActedThisTurn = true;
  }
}

export function resolveEnemyTurn(state: BattleState): BattleState {
  if (state.phase !== "enemy_resolution") {
    throw new Error("Enemy turn can only resolve during the enemy_resolution phase.");
  }

  // Lean V1 rule: enemy block lasts through the player's next turn, then clears
  // right before the enemy resolves its next intent.
  state.enemy.block = 0;
  syncEnemyLeaderPermanentFromState(
    state,
    formatEnemyIntent(state.enemy.intent),
    state.enemy.intentQueueLabels,
  );

  state.log.push({
    type: "enemy_intent_resolved",
    turnNumber: state.turnNumber,
    intent: state.enemy.intent,
  });

  if (state.enemy.stunnedThisTurn) {
    state.log.push({
      type: "enemy_stunned",
      turnNumber: state.turnNumber,
    });
    state.enemy.currentCard = null;
    return state;
  }

  if (state.enemy.currentCard) {
    resolveEnemyCard(state, state.enemy.currentCard);
  } else {
    const attackAmount = getEnemyIntentAttackAmount(state.enemy.intent);

    if (attackAmount > 0) {
      settleEnemyAttackDamage(
        state,
        attackAmount,
        state.enemy.leaderPermanentId ?? "enemy_intent",
        state.enemy.intent.overflowPolicy,
      );
    }

    const blockAmount = getEnemyIntentBlockAmount(state.enemy.intent);

    if (blockAmount > 0) {
      state.enemy.block += blockAmount;
      state.log.push({
        type: "block_gained",
        turnNumber: state.turnNumber,
        target: "enemy",
        amount: blockAmount,
      });
    }
  }

  syncEnemyLeaderPermanentFromState(
    state,
    formatEnemyIntent(state.enemy.intent),
    state.enemy.intentQueueLabels,
  );

  resolveEnemyBattlefieldCreatures(state);
  syncEnemyStateFromLeaderPermanent(state);

  return state;
}
