import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const terrifyingFourthBeastCardDefinition: CardDefinition = {
  id: "terrifying_fourth_beast",
  name: "Terrifying Fourth Beast, Devourer of Nations",
  cardTypes: ["creature"],
  cost: 6,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  rarity: "mythic",
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Beast"],
  abilities: [],
};
