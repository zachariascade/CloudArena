import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const burialClothsCardDefinition: CardDefinition = {
  id: "burial_cloths",
  name: "Burial Cloths",
  cardTypes: ["artifact"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
