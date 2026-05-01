import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const lazarusCardDefinition: CardDefinition = {
  id: "lazarus",
  name: "Lazarus, Called from the Tomb",
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
