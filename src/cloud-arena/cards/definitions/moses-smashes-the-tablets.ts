import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const mosesSmashesTheTabletsCardDefinition: CardDefinition = {
  id: "moses_smashes_the_tablets",
  name: "Moses Smashes the Tablets",
  cardTypes: ["sorcery"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
};
