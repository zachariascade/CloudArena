import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const goldenImageCardDefinition: CardDefinition = {
  id: "golden_image",
  name: "Golden Image",
  cardTypes: ["artifact"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
