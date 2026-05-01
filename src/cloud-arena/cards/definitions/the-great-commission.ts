import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const theGreatCommissionCardDefinition: CardDefinition = {
  id: "the_great_commission",
  name: "The Great Commission",
  cardTypes: ["enchantment"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
