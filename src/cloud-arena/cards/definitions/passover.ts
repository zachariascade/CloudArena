import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const passoverCardDefinition: CardDefinition = {
  id: "passover",
  name: "Passover",
  cardTypes: ["enchantment"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
