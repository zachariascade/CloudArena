import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const elihuCardDefinition: CardDefinition = {
  id: "elihu",
  name: "Elihu, Young Accuser",
  cardTypes: ["creature"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.job,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human", "Advisor"],
  abilities: [],
};
