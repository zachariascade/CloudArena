import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const treeCutDownCardDefinition: CardDefinition = {
  id: "tree_cut_down",
  name: "Tree Cut Down",
  cardTypes: ["sorcery"],
  cost: 3,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  abilities: [],
};
