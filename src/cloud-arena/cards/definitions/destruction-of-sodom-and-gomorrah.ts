import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const destructionOfSodomAndGomorrahCardDefinition: CardDefinition = {
  id: "destruction_of_sodom_and_gomorrah",
  name: "Destruction of Sodom and Gomorrah",
  cardTypes: ["sorcery"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
};
