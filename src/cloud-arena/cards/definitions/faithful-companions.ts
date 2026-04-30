import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const faithfulCompanionsCardDefinition: CardDefinition = {
  id: "faithful_companions",
  name: "Faithful Companions",
  cardTypes: ["creature"],
  cost: 2,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
