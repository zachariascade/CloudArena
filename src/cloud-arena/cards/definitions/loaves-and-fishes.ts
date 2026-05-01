import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const loavesAndFishesCardDefinition: CardDefinition = {
  id: "loaves_and_fishes",
  name: "Loaves and Fishes",
  cardTypes: ["artifact"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.gospels,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
