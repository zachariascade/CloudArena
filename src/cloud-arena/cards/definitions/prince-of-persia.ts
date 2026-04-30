import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const princeOfPersiaCardDefinition: CardDefinition = {
  id: "prince_of_persia",
  name: "Prince of Persia",
  cardTypes: ["creature"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
