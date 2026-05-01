import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const gethsemanePrayerCardDefinition: CardDefinition = {
  id: "gethsemane_prayer",
  name: "Gethsemane Prayer",
  cardTypes: ["instant"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
};
