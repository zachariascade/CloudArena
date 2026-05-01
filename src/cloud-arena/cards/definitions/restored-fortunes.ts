import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const restoredFortunesCardDefinition: CardDefinition = {
  id: "restored_fortunes",
  name: "Restored Fortunes",
  cardTypes: ["enchantment"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.job,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
