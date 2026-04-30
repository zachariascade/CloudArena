import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const lionsDenCardDefinition: CardDefinition = {
  id: "lions_den",
  name: "Lions' Den",
  cardTypes: ["sorcery"],
  cost: 3,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  abilities: [],
};
