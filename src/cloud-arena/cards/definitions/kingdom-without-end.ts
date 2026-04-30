import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const kingdomWithoutEndCardDefinition: CardDefinition = {
  id: "kingdom_without_end",
  name: "Kingdom Without End",
  cardTypes: ["enchantment"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
