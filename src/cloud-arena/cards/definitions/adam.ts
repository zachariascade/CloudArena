import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const adamCardDefinition: CardDefinition = {
  id: "adam",
  name: "Adam, First Man of Dust",
  cardTypes: ["creature"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human"],
  abilities: [],
};
