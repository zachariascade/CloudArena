import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const testingOfFaithCardDefinition: CardDefinition = {
  id: "testing_of_faith",
  name: "Testing of Faith",
  cardTypes: ["enchantment"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.job,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
