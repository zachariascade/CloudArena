import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const pillarOfFireCardDefinition: CardDefinition = {
  id: "pillar_of_fire",
  name: "Pillar of Fire",
  cardTypes: ["enchantment"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
