import { cardDefinitions } from "../../cards/definitions.js";
import { isCardSelectableByPlayers } from "../../cards/definitions.js";
import type { CardDefinitionId } from "../../core/types.js";
import type { CloudArenaDeckPreset } from "../types.js";

const masterDeckCards = Object.keys(cardDefinitions).filter(
  (cardId) => {
    const definition = cardDefinitions[cardId];
    return definition ? isCardSelectableByPlayers(definition) : false;
  },
) as CardDefinitionId[];

export const masterDeckPreset: CloudArenaDeckPreset = {
  id: "master_deck",
  label: "Master Deck",
  cards: masterDeckCards,
};
