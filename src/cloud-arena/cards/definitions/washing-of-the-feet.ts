import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const washingOfTheFeetCardDefinition: CardDefinition = {
  id: "washing_of_the_feet",
  name: "Washing of the Feet",
  cardTypes: ["instant"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
};
