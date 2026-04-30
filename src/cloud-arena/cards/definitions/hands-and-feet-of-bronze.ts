import type { CardDefinition } from "../../core/types.js";
import { danielStatueDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const handsAndFeetOfBronzeCardDefinition: CardDefinition = {
  id: "hands_and_feet_of_bronze",
  name: "Hands and Feet of Bronze",
  cardTypes: ["enchantment"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielStatueDisplay,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
