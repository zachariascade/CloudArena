import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const sevenYearsOfFamineCardDefinition: CardDefinition = {
  id: "seven_years_of_famine",
  name: "Seven Years of Famine",
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
        title: "The Stores Run Thin",
        effects: [],
      },
    ],
  },
  abilities: [],
};
