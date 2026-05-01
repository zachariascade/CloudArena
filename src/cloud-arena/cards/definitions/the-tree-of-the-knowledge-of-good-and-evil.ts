import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const treeOfTheKnowledgeOfGoodAndEvilCardDefinition: CardDefinition = {
  id: "the_tree_of_the_knowledge_of_good_evil",
  name: "The Tree of the Knowledge of Good & Evil",
  cardTypes: ["artifact"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
