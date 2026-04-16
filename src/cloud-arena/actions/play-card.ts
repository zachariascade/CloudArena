import { getCardDefinitionFromLibrary, isPermanentCardDefinition } from "../cards/definitions.js";
import { resolveLegacyCardEffects, resolveSpellEffects } from "../core/effects.js";
import { summonPermanentFromCard } from "../core/permanents.js";
import { emitRulesEvent } from "../core/rules-events.js";
import type {
  BattleState,
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

export function playCard(state: BattleState, cardInstanceId: string): BattleState {
  if (state.phase !== "player_action") {
    throw new Error("Cards can only be played during the player_action phase.");
  }

  const card = state.player.hand.find((entry) => entry.instanceId === cardInstanceId);

  if (!card) {
    throw new Error(`Card ${cardInstanceId} was not found in hand.`);
  }

  const definition = getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId);

  if (state.player.energy < definition.cost) {
    throw new Error(`Not enough energy to play ${definition.name}.`);
  }

  if (isPermanentCardDefinition(definition) && !state.battlefield.some((slot) => slot === null)) {
    throw new Error(`Cannot play ${definition.name} because there is no open battlefield slot.`);
  }

  const { nextHand } = removeCardFromHand(state.player.hand, cardInstanceId);
  state.player.hand = nextHand;

  state.player.energy -= definition.cost;
  state.log.push({
    type: "card_played",
    turnNumber: state.turnNumber,
    cardId: card.definitionId,
  });
  emitRulesEvent(state, {
    type: "card_played",
    turnNumber: state.turnNumber,
    cardInstanceId: card.instanceId,
    definitionId: card.definitionId,
    controllerId: "player",
  });

  if (isPermanentCardDefinition(definition)) {
    summonPermanentFromCard(state, card);
  }

  resolveLegacyCardEffects(state, definition.onPlay);
  if (definition.spellEffects?.length) {
    resolveSpellEffects(state, definition.spellEffects, {
      sourceCardInstanceId: card.instanceId,
    });
  }

  if (!isPermanentCardDefinition(definition)) {
    emitRulesEvent(state, {
      type: "card_discarded",
      turnNumber: state.turnNumber,
      cardInstanceId: card.instanceId,
      definitionId: card.definitionId,
      controllerId: "player",
    });
    state.player.discardPile.push(card);
  }

  return state;
}
