import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const jobsLamentCardDefinition: CardDefinition = {
  id: "jobs_lament",
  name: "Job's Lament",
  cardTypes: ["sorcery"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.job,
  onPlay: [],
};
