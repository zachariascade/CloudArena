import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const dariusTheMedeCardDefinition: CardDefinition = {
  id: "darius_the_mede",
  name: "Darius the Mede, Bound by Decree",
  cardTypes: ["creature"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  rarity: "mythic",
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human", "King"],
  abilities: [],
};
