import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const rodToSerpentCardDefinition: CardDefinition = {
  id: "rod_to_serpent",
  name: "Rod to Serpent",
  cardTypes: ["instant"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
};
