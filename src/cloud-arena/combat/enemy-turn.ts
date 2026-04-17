import {
  getEnemyIntentAttackAmount,
  getEnemyIntentBlockAmount,
} from "../core/enemy-intent.js";
import { getDerivedPermanentActionAmount } from "../core/derived-stats.js";
import { summonPermanentFromCard } from "../core/permanents.js";
import { emitRulesEvent } from "../core/rules-events.js";
import { settleEnemyAttackDamage } from "./settle-damage.js";
import type { BattleState, CardInstance, EnemyCardDefinition } from "../core/types.js";

function summonEnemyToken(state: BattleState, cardId: string): void {
  const card: CardInstance = {
    instanceId: `enemy_token_${state.turnNumber}_${state.nextEnemyTokenIndex}`,
    definitionId: cardId,
  };

  state.nextEnemyTokenIndex += 1;
  summonPermanentFromCard(state, card, "enemy");
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
        settleEnemyAttackDamage(state, attackAmount, effect.overflowPolicy);
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
        summonEnemyToken(state, effect.spawnCardId);
      }
    }
  }
}

function resolveEnemyTokens(state: BattleState): void {
  for (const token of state.enemyBattlefield) {
    if (!token || token.health <= 0) {
      continue;
    }

    const attackAmount = getDerivedPermanentActionAmount(state, token, "attack");

    if (attackAmount <= 0) {
      continue;
    }

    state.log.push({
      type: "permanent_acted",
      turnNumber: state.turnNumber,
      permanentId: token.instanceId,
      source: "rules",
      action: "attack",
    });

    emitRulesEvent(state, {
      type: "permanent_attacked",
      turnNumber: state.turnNumber,
      permanentId: token.instanceId,
      sourceCardInstanceId: token.sourceCardInstanceId,
      definitionId: token.definitionId,
      controllerId: token.controllerId ?? "enemy",
      slotIndex: token.slotIndex,
    });

    settleEnemyAttackDamage(state, attackAmount, "stop_at_blocker");
    token.hasActedThisTurn = true;
  }
}

export function resolveEnemyTurn(state: BattleState): BattleState {
  if (state.phase !== "enemy_resolution") {
    throw new Error("Enemy turn can only resolve during the enemy_resolution phase.");
  }

  // Lean V1 rule: enemy block lasts through the player's next turn, then clears
  // right before the enemy resolves its next intent.
  state.enemy.block = 0;

  state.log.push({
    type: "enemy_intent_resolved",
    turnNumber: state.turnNumber,
    intent: state.enemy.intent,
  });

  if (state.enemy.currentCard) {
    resolveEnemyCard(state, state.enemy.currentCard);
  } else {
    const attackAmount = getEnemyIntentAttackAmount(state.enemy.intent);

    if (attackAmount > 0) {
      settleEnemyAttackDamage(state, attackAmount, state.enemy.intent.overflowPolicy);
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

  resolveEnemyTokens(state);

  return state;
}
