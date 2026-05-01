import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const belshazzarCardDefinition: CardDefinition = {
  id: "belshazzar",
  name: "Belshazzar, Last King of Babylon",
  cardTypes: ["creature"],
  cost: 5,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  rarity: "mythic",
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human", "Noble"],
  abilities: [],
};
