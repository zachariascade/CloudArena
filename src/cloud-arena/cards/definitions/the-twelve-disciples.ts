import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const twelveDisciplesCardDefinition: CardDefinition = {
  id: "the_twelve_disciples",
  name: "The Twelve Disciples",
  cardTypes: ["creature"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human"],
  abilities: [],
};
