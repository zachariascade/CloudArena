import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const pharaohCardDefinition: CardDefinition = {
  id: "pharaoh",
  name: "Pharaoh, God-King of Egypt",
  cardTypes: ["creature"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human", "Noble", "Tyrant"],
  abilities: [],
};
