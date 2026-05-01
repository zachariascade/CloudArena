import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const treeOfLifeCardDefinition: CardDefinition = {
  id: "the_tree_of_life",
  name: "The Tree of Life",
  cardTypes: ["artifact"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
