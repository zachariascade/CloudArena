import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const maryMagdaleneCardDefinition: CardDefinition = {
  id: "mary_magdalene",
  name: "Mary Magdalene, First Witness of the Risen",
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
