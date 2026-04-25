import { cardDefinitions } from "../../cards/definitions.js";
import type { CardDefinitionId } from "../../core/types.js";
import type { CloudArenaDeckPreset } from "../types.js";

const masterDeckCards = Object.keys(cardDefinitions).filter(
  (cardId) => cardDefinitions[cardId]?.playableInPlayerDecks !== false,
) as CardDefinitionId[];

export const masterDeckPreset: CloudArenaDeckPreset = {
  id: "master_deck",
  label: "Master Deck",
  cards: masterDeckCards,
};
