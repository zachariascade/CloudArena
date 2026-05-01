import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const betrayalAndArrestCardDefinition: CardDefinition = {
  id: "betrayal_and_arrest",
  name: "Betrayal and Arrest",
  cardTypes: ["sorcery"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
};
