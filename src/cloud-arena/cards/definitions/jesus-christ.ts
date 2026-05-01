import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const jesusChristCardDefinition: CardDefinition = {
  id: "jesus_christ",
  name: "Jesus Christ, Word Made Flesh",
  cardTypes: ["creature"],
  cost: 5,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Avatar"],
  abilities: [],
};
