import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const littleHornCardDefinition: CardDefinition = {
  id: "little_horn",
  name: "Little Horn, Blasphemous King",
  cardTypes: ["creature"],
  cost: 2,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  rarity: "mythic",
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Demon"],
  abilities: [],
};
