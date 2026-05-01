import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const exileFromEdenCardDefinition: CardDefinition = {
  id: "exile_from_eden",
  name: "Exile from Eden",
  cardTypes: ["sorcery"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
};
