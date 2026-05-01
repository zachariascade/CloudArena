import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const leviathanCardDefinition: CardDefinition = {
  id: "leviathan",
  name: "Leviathan, Serpent of the Deep",
  cardTypes: ["creature"],
  cost: 6,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.job,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Beast"],
  abilities: [],
};
