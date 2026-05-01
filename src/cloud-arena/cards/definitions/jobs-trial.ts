import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const jobsTrialCardDefinition: CardDefinition = {
  id: "jobs_trial",
  name: "Job's Trial",
  cardTypes: ["saga"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.job,
  onPlay: [],
  power: 0,
  health: 1,
  saga: {
    chapters: [
      {
        chapter: 1,
        label: "I",
        title: "The Accuser Speaks",
        effects: [],
      },
    ],
  },
  abilities: [],
};
