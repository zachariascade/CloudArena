import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const everlastingDominionCardDefinition: CardDefinition = {
  id: "everlasting_dominion",
  name: "Everlasting Dominion",
  cardTypes: ["enchantment"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
