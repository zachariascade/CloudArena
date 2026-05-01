import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const trialBeforePilateCardDefinition: CardDefinition = {
  id: "trial_before_pilate",
  name: "Trial Before Pilate",
  cardTypes: ["sorcery"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
};
