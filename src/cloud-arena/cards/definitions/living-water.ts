import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const livingWaterCardDefinition: CardDefinition = {
  id: "living_water",
  name: "Living Water",
  cardTypes: ["enchantment"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
