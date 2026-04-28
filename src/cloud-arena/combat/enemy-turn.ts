import { getCardDefinitionFromLibrary, hasCardType } from "../cards/definitions.js";
import { getDerivedPermanentActionAmount } from "../core/derived-stats.js";
import { applyEnemyCardEffect } from "../core/enemy-card-effects.js";
import {
  getEnemyLeaderPermanent,
  permanentHasKeyword,
  syncEnemyLeaderPermanentFromState,
  syncEnemyStateFromLeaderPermanent,
} from "../core/permanents.js";
import { formatEnemyIntent } from "../core/enemy-intent.js";
import { emitRulesEvent } from "../core/rules-events.js";
import { settleEnemyAttackDamage } from "./settle-damage.js";
import type { BattleState, EnemyActorState, EnemyCardDefinition } from "../core/types.js";
import {
  getEnemyIntentAttackAmount,
  getEnemyIntentBlockAmount,
} from "../core/enemy-intent.js";

function resolveEnemyCard(state: BattleState, card: EnemyCardDefinition): void {
  state.log.push({
    type: "enemy_card_played",
    turnNumber: state.turnNumber,
    cardId: card.id,
  });

  for (const effect of card.effects) {
    applyEnemyCardEffect(state, card.id, effect);
  }
}

function resolveSecondaryActorCard(state: BattleState, actor: EnemyActorState): void {
  const actorPermanent = actor.permanentId
    ? state.enemyBattlefield.find((p) => p?.instanceId === actor.permanentId) ?? null
    : null;

  if (actorPermanent && actorPermanent.health <= 0) {
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
      const attackBypassesBlock = actorPermanent ? permanentHasKeyword(actorPermanent, "pierce") : false;
      settleEnemyAttackDamage(
        state,
        attackAmount,
        actor.permanentId ?? "enemy_intent",
        actor.intent.overflowPolicy,
        attackBypassesBlock,
      );
    }

    const blockAmount = getEnemyIntentBlockAmount(actor.intent);
    if (blockAmount > 0 && actorPermanent) {
      actorPermanent.block += blockAmount;
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
      const attackSourcePermanent = getEnemyLeaderPermanent(state);
      const attackSourceDefinition = state.enemy.leaderDefinitionId
        ? getCardDefinitionFromLibrary(state.cardDefinitions, state.enemy.leaderDefinitionId)
        : null;
      const attackBypassesBlock =
        (attackSourcePermanent ? permanentHasKeyword(attackSourcePermanent, "pierce") : false) ||
        !!(attackSourceDefinition && "keywords" in attackSourceDefinition && attackSourceDefinition.keywords?.includes("pierce"));
      settleEnemyAttackDamage(
        state,
        attackAmount,
        state.enemy.leaderPermanentId ?? "enemy_intent",
        state.enemy.intent.overflowPolicy,
        attackBypassesBlock,
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

  for (const actor of state.enemies.slice(1)) {
    if (!actor.stunnedThisTurn) {
      resolveSecondaryActorCard(state, actor);
    }
  }

  resolveEnemyBattlefieldCreatures(state);
  syncEnemyStateFromLeaderPermanent(state);

  const primaryActor = state.enemies[0];
  if (primaryActor) {
    primaryActor.health = state.enemy.health;
    primaryActor.maxHealth = state.enemy.maxHealth;
    primaryActor.block = state.enemy.block;
    primaryActor.basePower = state.enemy.basePower;
    primaryActor.stunnedThisTurn = state.enemy.stunnedThisTurn;
  }

  return state;
}
