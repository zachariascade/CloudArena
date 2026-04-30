import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const michaelsStandCardDefinition: CardDefinition = {
  id: "michaels_stand",
  name: "Michael's Stand",
  cardTypes: ["enchantment"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
