import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const dayOfMyBirthCardDefinition: CardDefinition = {
  id: "day_of_my_birth",
  name: "Day of My Birth",
  cardTypes: ["enchantment"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.job,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
