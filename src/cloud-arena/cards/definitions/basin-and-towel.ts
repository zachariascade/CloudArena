import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const basinAndTowelCardDefinition: CardDefinition = {
  id: "basin_and_towel",
  name: "Basin and Towel",
  cardTypes: ["artifact"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
