import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const theFallCardDefinition: CardDefinition = {
  id: "the_fall",
  name: "The Fall",
  cardTypes: ["sorcery"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
};
