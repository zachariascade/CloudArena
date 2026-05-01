import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const belovedDiscipleCardDefinition: CardDefinition = {
  id: "beloved_disciple",
  name: "Beloved Disciple, Witness of Truth",
  cardTypes: ["creature"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human"],
  abilities: [],
};
