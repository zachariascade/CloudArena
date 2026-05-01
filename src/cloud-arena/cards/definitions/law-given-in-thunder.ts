import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const lawGivenInThunderCardDefinition: CardDefinition = {
  id: "law_given_in_thunder",
  name: "Law Given in Thunder",
  cardTypes: ["sorcery"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
};
