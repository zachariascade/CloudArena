import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const jobCardDefinition: CardDefinition = {
  id: "job",
  name: "Job, Blameless Sufferer",
  cardTypes: ["creature"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.job,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human"],
  abilities: [],
};
