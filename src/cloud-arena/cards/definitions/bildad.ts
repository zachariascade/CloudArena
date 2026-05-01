import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const bildadCardDefinition: CardDefinition = {
  id: "bildad",
  name: "Bildad, Appeal to Tradition",
  cardTypes: ["creature"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.job,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human", "Advisor"],
  abilities: [],
};
