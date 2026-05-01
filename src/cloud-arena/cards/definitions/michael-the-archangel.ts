import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const michaelTheArchangelCardDefinition: CardDefinition = {
  id: "michael_the_archangel",
  name: "Michael the Archangel, Prince of Heaven's Host",
  cardTypes: ["creature"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  rarity: "mythic",
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Angel", "Warrior"],
  abilities: [],
};
