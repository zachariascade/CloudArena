import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const marthaCardDefinition: CardDefinition = {
  id: "martha",
  name: "Martha, Confessor of the Resurrection",
  cardTypes: ["creature"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human"],
  abilities: [],
};
