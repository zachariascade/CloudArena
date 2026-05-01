import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const newBirthFromAboveCardDefinition: CardDefinition = {
  id: "new_birth_from_above",
  name: "New Birth from Above",
  cardTypes: ["enchantment"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
