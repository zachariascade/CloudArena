import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const songOfTheSeaCardDefinition: CardDefinition = {
  id: "song_of_the_sea",
  name: "Song of the Sea",
  cardTypes: ["enchantment"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
