import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const theFloodCardDefinition: CardDefinition = {
  id: "the_flood",
  name: "The Flood",
  cardTypes: ["enchantment", "saga"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
  power: 0,
  health: 1,
  saga: {
    chapters: [
      {
        chapter: 1,
        label: "I",
        title: "The Waters Rise",
        effects: [],
      },
    ],
  },
  abilities: [],
};
