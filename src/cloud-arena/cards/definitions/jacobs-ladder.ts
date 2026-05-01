import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const jacobsLadderCardDefinition: CardDefinition = {
  id: "jacobs_ladder",
  name: "Jacob's Ladder",
  cardTypes: ["sorcery"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
};
