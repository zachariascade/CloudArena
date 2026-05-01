import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const bezalelCardDefinition: CardDefinition = {
  id: "bezalel",
  name: "Bezalel, Spirit-Filled Artisan",
  cardTypes: ["creature"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human", "Artificer"],
  abilities: [],
};
