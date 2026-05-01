import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const callOfAbramCardDefinition: CardDefinition = {
  id: "call_of_abram",
  name: "Call of Abram",
  cardTypes: ["sorcery"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
};
