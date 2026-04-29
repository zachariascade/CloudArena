import { getCardDefinitionFromLibrary, hasCardType } from "../cards/definitions.js";
import { getDerivedPermanentActionAmount } from "../core/derived-stats.js";
import { applyEnemyCardEffect } from "../core/enemy-card-effects.js";
import {
  permanentHasKeyword,
  permanentHasSummoningSickness,
  getEnemyActorPermanent,
} from "../core/permanents.js";
import { emitRulesEvent } from "../core/rules-events.js";
import { settleEnemyAttackDamage } from "./settle-damage.js";
import type { BattleState, EnemyActorState } from "../core/types.js";
import {
  getEnemyIntentAttackAmount,
  getEnemyIntentBlockAmount,
} from "../core/enemy-intent.js";

function resolveActorIntent(state: BattleState, actor: EnemyActorState): void {
  const actorPermanent = getEnemyActorPermanent(state, actor);

  if (actorPermanent && actorPermanent.health <= 0) {
    return;
  }

  // Block clears at the start of each enemy intent resolution (it persisted
  // through the player's previous turn).
  actor.block = 0;
  if (actorPermanent) {
    actorPermanent.block = 0;
  }

  state.log.push({
    type: "enemy_intent_resolved",
    turnNumber: state.turnNumber,
    intent: actor.intent,
  });

  if (actor.stunnedThisTurn) {
    state.log.push({
      type: "enemy_stunned",
      turnNumber: state.turnNumber,
    });
    actor.currentCard = null;
    return;
  }

  if (actor.currentCard) {
    state.log.push({
      type: "enemy_card_played",
      turnNumber: state.turnNumber,
      cardId: actor.currentCard.id,
    });

    for (const effect of actor.currentCard.effects) {
      applyEnemyCardEffect(state, actor.currentCard.id, effect, actor);
    }
  } else {
    const attackAmount = getEnemyIntentAttackAmount(actor.intent);

    if (attackAmount > 0) {
      const attackSourceDefinition = actor.definitionId
        ? getCardDefinitionFromLibrary(state.cardDefinitions, actor.definitionId)
        : null;
      const attackBypassesBlock =
        (actorPermanent ? permanentHasKeyword(actorPermanent, "pierce") : false) ||
        !!(attackSourceDefinition && "keywords" in attackSourceDefinition && attackSourceDefinition.keywords?.includes("pierce"));
      settleEnemyAttackDamage(
        state,
        attackAmount,
        actor.permanentId ?? "enemy_intent",
        actor.intent.overflowPolicy,
        attackBypassesBlock,
      );
    }

    const blockAmount = getEnemyIntentBlockAmount(actor.intent);

    if (blockAmount > 0) {
      actor.block += blockAmount;
      if (actorPermanent) {
        actorPermanent.block += blockAmount;
      }
      state.log.push({
        type: "block_gained",
        turnNumber: state.turnNumber,
        target: "enemy",
        amount: blockAmount,
      });
    }
  }

  if (actorPermanent) {
    actorPermanent.hasActedThisTurn = true;
  }
}

function resolveEnemyBattlefieldCreatures(state: BattleState): void {
  const actorPermanentIds = new Set(
    state.enemies.map((actor) => actor.permanentId).filter((id): id is string => Boolean(id)),
  );

  for (const permanent of state.enemyBattlefield) {
    if (!permanent || permanent.health <= 0) {
      continue;
    }

    if (actorPermanentIds.has(permanent.instanceId)) {
      continue;
    }

    if (permanent.hasActedThisTurn) {
      continue;
    }

    const definition = getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId);

    if (!hasCardType(definition, "creature")) {
      continue;
    }

    if (permanentHasSummoningSickness(state, permanent)) {
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

    settleEnemyAttackDamage(
      state,
      attackAmount,
      permanent.instanceId,
      "stop_at_blocker",
      permanentHasKeyword(permanent, "pierce"),
    );
    permanent.hasActedThisTurn = true;
  }
}

export function resolveEnemyTurn(state: BattleState): BattleState {
  if (state.phase !== "enemy_resolution") {
    throw new Error("Enemy turn can only resolve during the enemy_resolution phase.");
  }

  for (const actor of state.enemies) {
    resolveActorIntent(state, actor);
  }

  resolveEnemyBattlefieldCreatures(state);

  for (const actor of state.enemies) {
    const actorPermanent = getEnemyActorPermanent(state, actor);
    if (actorPermanent) {
      actor.health = actorPermanent.health;
      actor.maxHealth = actorPermanent.maxHealth;
      actor.block = actorPermanent.block;
      actor.basePower = actorPermanent.power;
    }
  }

  return state;
}
