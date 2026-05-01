import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const altarOfIncenseCardDefinition: CardDefinition = {
  id: "altar_of_incense",
  name: "Altar of Incense",
  cardTypes: ["artifact"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
