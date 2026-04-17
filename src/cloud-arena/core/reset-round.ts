import {
  LEAN_V1_DEFAULT_TURN_ENERGY,
  LEAN_V1_HAND_SIZE,
} from "./constants.js";
import { discardHand, drawUpToHandSize } from "./draw.js";
import { getEnemyPlanLength, getEnemyPlanStepAtIndexFromState } from "./enemy-plan.js";
import { cleanupDefeatedPermanents } from "./permanents.js";
import { processTriggeredAbilities } from "./triggers.js";
import type { BattleState } from "./types.js";

export function resetRound(state: BattleState): BattleState {
  state.turnNumber += 1;
  state.phase = "player_action";
  state.player.block = 0;
  state.player.energy = LEAN_V1_DEFAULT_TURN_ENERGY;
  state.blockingQueue = [];

  state.battlefield.forEach((permanent) => {
    if (!permanent) {
      return;
    }

    permanent.block = 0;
    if (permanent.recoveryPolicy === "full_heal") {
      permanent.health = permanent.maxHealth;
    }
    permanent.hasActedThisTurn = false;
    permanent.isTapped = false;
    permanent.isDefending = false;
  });

  state.enemyBattlefield.forEach((permanent) => {
    if (!permanent) {
      return;
    }

    permanent.block = 0;
    if (permanent.recoveryPolicy === "full_heal") {
      permanent.health = permanent.maxHealth;
    }
    permanent.hasActedThisTurn = false;
    permanent.isTapped = false;
    permanent.isDefending = false;
  });

  const enemyPlanLength = getEnemyPlanLength(state.enemy);

  state.enemy.behaviorIndex = (state.enemy.behaviorIndex + 1) % enemyPlanLength;

  const nextEnemyPlan = getEnemyPlanStepAtIndexFromState(
    state.enemy,
    state.enemy.behaviorIndex,
  );

  if (!nextEnemyPlan) {
    throw new Error("Enemy plan step was missing during round reset.");
  }

  state.enemy.intent = nextEnemyPlan.intent;
  state.enemy.currentCard = nextEnemyPlan.card;

  discardHand(state);
  const drawResult = drawUpToHandSize(state, LEAN_V1_HAND_SIZE);
  cleanupDefeatedPermanents(state);
  processTriggeredAbilities(state);
  cleanupDefeatedPermanents(state);

  state.log.push({
    type: "turn_started",
    turnNumber: state.turnNumber,
    cardsDrawn: drawResult.count,
    energy: state.player.energy,
    enemyIntent: state.enemy.intent,
  });
  for (const card of drawResult.cards) {
    state.log.push({
      type: "card_drawn",
      turnNumber: state.turnNumber,
      cardId: card.definitionId,
    });
  }

  return state;
}
