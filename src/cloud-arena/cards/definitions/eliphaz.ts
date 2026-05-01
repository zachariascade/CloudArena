import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const eliphazCardDefinition: CardDefinition = {
  id: "eliphaz",
  name: "Eliphaz, Voice of Experience",
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
