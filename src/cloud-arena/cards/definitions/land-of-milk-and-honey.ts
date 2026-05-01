import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const landOfMilkAndHoneyCardDefinition: CardDefinition = {
  id: "land_of_milk_and_honey",
  name: "Land of Milk and Honey",
  cardTypes: ["enchantment"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
