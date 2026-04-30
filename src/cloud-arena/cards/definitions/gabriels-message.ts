import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const gabrielsMessageCardDefinition: CardDefinition = {
  id: "gabriels_message",
  name: "Gabriel's Message",
  cardTypes: ["sorcery"],
  cost: 2,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  abilities: [],
};
