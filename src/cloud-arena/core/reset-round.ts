import {
  LEAN_V1_DEFAULT_TURN_ENERGY,
  LEAN_V1_HAND_SIZE,
} from "./constants.js";
import { discardHand, drawUpToHandSize } from "./draw.js";
import {
  getEnemyIntentQueueLabels,
  getEnemyPlanLength,
  getEnemyPlanStepAtIndexFromState,
} from "./enemy-plan.js";
import {
  cleanupDefeatedPermanents,
  permanentHasKeyword,
  syncEnemyStateFromLeaderPermanent,
  syncEnemyLeaderPermanentFromState,
} from "./permanents.js";
import { formatEnemyIntent } from "./enemy-intent.js";
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
    if (permanent.recoveryPolicy === "full_heal" || permanentHasKeyword(permanent, "refresh")) {
      permanent.health = permanent.maxHealth;
    }
    permanent.hasActedThisTurn = false;
    permanent.isTapped = false;
    permanent.isDefending = false;
    permanent.blockingTargetPermanentId = null;
  });

  state.enemyBattlefield.forEach((permanent) => {
    if (!permanent) {
      return;
    }

    if (!permanent.isEnemyLeader) {
      permanent.block = 0;
    }
    if (permanent.recoveryPolicy === "full_heal" || permanentHasKeyword(permanent, "refresh")) {
      permanent.health = permanent.maxHealth;
    }
    permanent.hasActedThisTurn = false;
    permanent.isTapped = false;
    permanent.isDefending = false;
    permanent.blockingTargetPermanentId = null;
  });
  syncEnemyStateFromLeaderPermanent(state);

  const enemyPlanLength = getEnemyPlanLength(state.enemy);

  state.enemy.behaviorIndex = (state.enemy.behaviorIndex + 1) % enemyPlanLength;
  state.enemy.stunnedThisTurn = false;

  const nextEnemyPlan = getEnemyPlanStepAtIndexFromState(
    state.enemy,
    state.enemy.behaviorIndex,
  );

  if (!nextEnemyPlan) {
    throw new Error("Enemy plan step was missing during round reset.");
  }

  state.enemy.intent = nextEnemyPlan.intent;
  state.enemy.currentCard = nextEnemyPlan.card;
  state.enemy.intentQueueLabels = getEnemyIntentQueueLabels(state.enemy, 2);
  syncEnemyLeaderPermanentFromState(
    state,
    formatEnemyIntent(state.enemy.intent),
    state.enemy.intentQueueLabels,
  );

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
