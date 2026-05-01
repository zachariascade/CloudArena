import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const cleansingOfTheTempleCardDefinition: CardDefinition = {
  id: "cleansing_of_the_temple",
  name: "Cleansing of the Temple",
  cardTypes: ["sorcery"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
};
