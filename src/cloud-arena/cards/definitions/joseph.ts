import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const josephCardDefinition: CardDefinition = {
  id: "joseph",
  name: "Joseph, Interpreter of Dreams",
  cardTypes: ["creature"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human"],
  abilities: [],
};
