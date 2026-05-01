import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const raisingOfLazarusCardDefinition: CardDefinition = {
  id: "raising_of_lazarus",
  name: "Raising of Lazarus",
  cardTypes: ["sorcery"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
};
