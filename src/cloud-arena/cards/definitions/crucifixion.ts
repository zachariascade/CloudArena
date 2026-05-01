import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const crucifixionCardDefinition: CardDefinition = {
  id: "crucifixion",
  name: "Crucifixion",
  cardTypes: ["sorcery"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
};
