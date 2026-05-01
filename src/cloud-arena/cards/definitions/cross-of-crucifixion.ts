import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const crossOfCrucifixionCardDefinition: CardDefinition = {
  id: "cross_of_crucifixion",
  name: "Cross of Crucifixion",
  cardTypes: ["artifact"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
