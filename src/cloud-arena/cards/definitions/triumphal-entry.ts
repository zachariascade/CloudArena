import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const triumphalEntryCardDefinition: CardDefinition = {
  id: "triumphal_entry",
  name: "Triumphal Entry",
  cardTypes: ["sorcery"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
};
