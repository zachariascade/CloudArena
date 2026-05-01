import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const joshuaCardDefinition: CardDefinition = {
  id: "joshua",
  name: "Joshua, Faithful Commander",
  cardTypes: ["creature"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human", "Warrior", "Commander"],
  abilities: [],
};
