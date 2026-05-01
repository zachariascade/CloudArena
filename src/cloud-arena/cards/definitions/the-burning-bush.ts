import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const theBurningBushCardDefinition: CardDefinition = {
  id: "the_burning_bush",
  name: "The Burning Bush",
  cardTypes: ["sorcery"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
};
