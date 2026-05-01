import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const iAmThatIAmCardDefinition: CardDefinition = {
  id: "i_am_that_i_am",
  name: "I AM THAT I AM",
  cardTypes: ["enchantment"],
  cost: 5,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
