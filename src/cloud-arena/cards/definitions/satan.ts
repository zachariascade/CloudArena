import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const satanCardDefinition: CardDefinition = {
  id: "satan",
  name: "Satan, The Adversary",
  cardTypes: ["creature"],
  cost: 5,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.job,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Angel"],
  abilities: [],
};
