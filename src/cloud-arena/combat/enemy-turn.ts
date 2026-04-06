import {
  getEnemyIntentAttackAmount,
  getEnemyIntentBlockAmount,
} from "../core/enemy-intent.js";
import { getTotalAttackAmount, hasBlockAmount } from "../core/combat-values.js";
import { settleEnemyAttackDamage } from "./settle-damage.js";
import type { BattleState, EnemyCardDefinition } from "../core/types.js";

function resolveEnemyCard(state: BattleState, card: EnemyCardDefinition): void {
  state.log.push({
    type: "enemy_card_played",
    turnNumber: state.turnNumber,
    cardId: card.id,
  });

  for (const effect of card.effects) {
    if (effect.target === "player") {
      const attackAmount = getTotalAttackAmount(effect);

      if (attackAmount > 0) {
        settleEnemyAttackDamage(state, attackAmount);
      }
    }

    if (effect.target === "enemy" && hasBlockAmount(effect)) {
      state.enemy.block += effect.blockAmount ?? 0;
      state.log.push({
        type: "block_gained",
        turnNumber: state.turnNumber,
        target: "enemy",
        amount: effect.blockAmount ?? 0,
      });
    }
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
    return state;
  }

  const attackAmount = getEnemyIntentAttackAmount(state.enemy.intent);

  if (attackAmount > 0) {
    settleEnemyAttackDamage(state, attackAmount);
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

  return state;
}
