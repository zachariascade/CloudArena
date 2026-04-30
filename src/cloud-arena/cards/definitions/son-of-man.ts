import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const sonOfManCardDefinition: CardDefinition = {
  id: "son_of_man",
  name: "Son of Man, Coming on the Clouds",
  cardTypes: ["creature"],
  cost: 5,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
