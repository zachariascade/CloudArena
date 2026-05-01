import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const coatOfManyColorsCardDefinition: CardDefinition = {
  id: "coat_of_many_colors",
  name: "Coat of Many Colors",
  cardTypes: ["artifact"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
