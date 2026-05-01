import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const stoneTabletsCardDefinition: CardDefinition = {
  id: "the_stone_tablets",
  name: "The Stone Tablets",
  cardTypes: ["artifact"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
