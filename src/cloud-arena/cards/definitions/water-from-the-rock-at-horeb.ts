import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const waterFromTheRockAtHorebCardDefinition: CardDefinition = {
  id: "water_from_the_rock_at_horeb",
  name: "Water from the Rock at Horeb",
  cardTypes: ["instant"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
};
