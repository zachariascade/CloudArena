import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const cyrusTheGreatCardDefinition: CardDefinition = {
  id: "cyrus_the_great",
  name: "Cyrus the Great, Anointed Liberator",
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
