import { asPermanentCardDefinition, getCardDefinitionFromLibrary } from "../cards/definitions.js";
import type {
  BattleState,
  CardEffect,
  CardInstance,
} from "../core/types.js";

function removeCardFromHand(
  hand: CardInstance[],
  cardInstanceId: string,
): { nextHand: CardInstance[]; card: CardInstance } {
  const card = hand.find((entry) => entry.instanceId === cardInstanceId);

  if (!card) {
    throw new Error(`Card ${cardInstanceId} was not found in hand.`);
  }

  return {
    nextHand: hand.filter((entry) => entry.instanceId !== cardInstanceId),
    card,
  };
}

function toPermanentInstanceId(card: CardInstance): string {
  const cardNumber = card.instanceId.replace(/^card_/, "");
  return `${card.definitionId}_${cardNumber}`;
}

function summonPermanent(
  state: BattleState,
  card: CardInstance,
): void {
  const openSlot = state.battlefield.findIndex((slot) => slot === null);

  if (openSlot === -1) {
    throw new Error(`Cannot summon ${card.definitionId} without an open battlefield slot.`);
  }

  const definition = asPermanentCardDefinition(
    getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId),
  );
  const permanentId = toPermanentInstanceId(card);

  state.battlefield[openSlot] = {
    instanceId: permanentId,
    sourceCardInstanceId: card.instanceId,
    name: definition.name,
    definitionId: definition.id,
    health: definition.health,
    maxHealth: definition.health,
    block: 0,
    actions: definition.actions,
    hasActedThisTurn: false,
    isDefending: false,
    slotIndex: openSlot,
  };

  state.log.push({
    type: "permanent_summoned",
    turnNumber: state.turnNumber,
    permanentId,
    definitionId: definition.id,
    slotIndex: openSlot,
  });
}

function applyDamageToEnemy(state: BattleState, amount: number): void {
  const damageDealt = Math.max(0, Math.min(amount, state.enemy.block + state.enemy.health));
  if (state.enemy.block >= amount) {
    state.enemy.block -= amount;
  } else {
    const remainingDamage = amount - state.enemy.block;
    state.enemy.block = 0;
    state.enemy.health -= remainingDamage;
  }

  if (damageDealt > 0) {
    state.log.push({
      type: "damage_dealt",
      turnNumber: state.turnNumber,
      source: "card",
      target: "enemy",
      amount: damageDealt,
    });
  }
}

function getTotalAttackAmount(effect: CardEffect): number {
  if (typeof effect.attackAmount !== "number" || effect.attackAmount <= 0) {
    return 0;
  }

  return effect.attackAmount * Math.max(1, effect.attackTimes ?? 1);
}

export function playCard(state: BattleState, cardInstanceId: string): BattleState {
  if (state.phase !== "player_action") {
    throw new Error("Cards can only be played during the player_action phase.");
  }

  const { nextHand, card } = removeCardFromHand(state.player.hand, cardInstanceId);
  const definition = getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId);
  state.player.hand = nextHand;

  if (state.player.energy < definition.cost) {
    throw new Error(`Not enough energy to play ${definition.name}.`);
  }

  state.player.energy -= definition.cost;
  state.log.push({
    type: "card_played",
    turnNumber: state.turnNumber,
    cardId: card.definitionId,
  });

  if (definition.type === "permanent") {
    summonPermanent(state, card);
  }

  for (const effect of definition.onPlay) {
    const totalAttackAmount = getTotalAttackAmount(effect);

    if (effect.target === "enemy" && totalAttackAmount > 0) {
      applyDamageToEnemy(state, totalAttackAmount);
    }

    if (effect.target === "player" && typeof effect.blockAmount === "number" && effect.blockAmount > 0) {
      state.player.block += effect.blockAmount;
      state.log.push({
        type: "block_gained",
        turnNumber: state.turnNumber,
        target: "player",
        amount: effect.blockAmount,
      });
    }
  }

  if (definition.type !== "permanent") {
    state.player.discardPile.push(card);
  }

  return state;
}
