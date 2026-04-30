import type { CardDefinition } from "../../core/types.js";
import { danielStatueDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const dreamOfTheStatueCardDefinition: CardDefinition = {
  id: "dream_of_the_statue",
  name: "Dream of the Statue",
  cardTypes: ["enchantment"],
  subtypes: ["Saga"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielStatueDisplay,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
