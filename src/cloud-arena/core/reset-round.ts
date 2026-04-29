import {
  LEAN_V1_DEFAULT_TURN_ENERGY,
} from "./constants.js";
import { applyDrawPolicy } from "./draw.js";
import {
  primeEnemyCardForTurn,
  resolveScheduledEnemyCardEffects,
} from "./enemy-card-effects.js";
import {
  getEnemyIntentQueueLabels,
  getEnemyPlanLength,
  getEnemyPlanStepAtIndexFromState,
} from "./enemy-plan.js";
import {
  cleanupDefeatedPermanents,
  permanentHasKeyword,
  expireTemporaryKeywordModifiers,
  getEnemyActorPermanent,
} from "./permanents.js";
import { expireTemporaryCounters } from "./effects.js";
import { formatEnemyIntent } from "./enemy-intent.js";
import { processTriggeredAbilities } from "./triggers.js";
import type { BattleState } from "./types.js";

export function resetRound(state: BattleState): BattleState {
  state.turnNumber += 1;
  expireTemporaryCounters(state);
  expireTemporaryKeywordModifiers(state);
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

    // Enemy block persists through the player's next turn — it clears at the
    // start of each enemy intent resolution (see resolveActorIntent).
    if (permanent.recoveryPolicy === "full_heal" || permanentHasKeyword(permanent, "refresh")) {
      permanent.health = permanent.maxHealth;
    }
    permanent.hasActedThisTurn = false;
    permanent.isTapped = false;
    permanent.isDefending = false;
    permanent.blockingTargetPermanentId = null;
  });

  resolveScheduledEnemyCardEffects(state);

  for (const actor of state.enemies) {
    const planLength = getEnemyPlanLength(actor);
    if (planLength <= 0) {
      continue;
    }

    const actorPermanent = getEnemyActorPermanent(state, actor);
    if (actorPermanent) {
      actor.health = actorPermanent.health;
      actor.maxHealth = actorPermanent.maxHealth;
      actor.block = actorPermanent.block;
      actor.basePower = actorPermanent.power;
    }

    actor.behaviorIndex = (actor.behaviorIndex + 1) % planLength;
    actor.stunnedThisTurn = false;

    const nextPlan = getEnemyPlanStepAtIndexFromState(actor, actor.behaviorIndex);
    if (nextPlan) {
      actor.intent = nextPlan.intent;
      actor.currentCardId = nextPlan.card?.id ?? null;
      actor.currentCard = nextPlan.card;
      actor.currentCard = primeEnemyCardForTurn(state, actor.currentCard, actor);
    }

    actor.intentQueueLabels = getEnemyIntentQueueLabels(actor, 2);

    if (actorPermanent) {
      const actorIntentLabel = formatEnemyIntent(actor.intent);
      actorPermanent.intentLabel = actor.stunnedThisTurn
        ? "Stunned"
        : actorIntentLabel.length > 0
          ? actorIntentLabel
          : null;
      actorPermanent.intentQueueLabels = [...actor.intentQueueLabels];
    }
  }

  const drawResult = applyDrawPolicy(state);
  cleanupDefeatedPermanents(state);
  processTriggeredAbilities(state);
  cleanupDefeatedPermanents(state);

  state.log.push({
    type: "turn_started",
    turnNumber: state.turnNumber,
    cardsDrawn: drawResult.count,
    energy: state.player.energy,
    enemyIntent: state.enemies[0]?.intent ?? {},
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
