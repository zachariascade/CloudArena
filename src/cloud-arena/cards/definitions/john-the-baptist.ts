import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const johnTheBaptistCardDefinition: CardDefinition = {
  id: "john_the_baptist",
  name: "John the Baptist, Voice in the Wilderness",
  cardTypes: ["creature"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human", "Prophet"],
  abilities: [],
};
