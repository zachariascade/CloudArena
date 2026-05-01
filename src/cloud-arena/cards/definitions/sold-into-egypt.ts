import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const soldIntoEgyptCardDefinition: CardDefinition = {
  id: "sold_into_egypt",
  name: "Sold into Egypt",
  cardTypes: ["sorcery"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
};
