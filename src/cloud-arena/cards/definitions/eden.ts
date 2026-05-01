import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const edenCardDefinition: CardDefinition = {
  id: "eden",
  name: "Eden",
  cardTypes: ["enchantment"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
