import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const caiaphasCardDefinition: CardDefinition = {
  id: "caiaphas",
  name: "Caiaphas, High Priest of the Council",
  cardTypes: ["creature"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human", "Cleric"],
  abilities: [],
};
