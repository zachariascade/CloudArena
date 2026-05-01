import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const whereverTwoOrMoreAreGatheredCardDefinition: CardDefinition = {
  id: "wherever_two_or_more_are_gathered",
  name: "Wherever Two or More are Gathered",
  cardTypes: ["instant"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
};
