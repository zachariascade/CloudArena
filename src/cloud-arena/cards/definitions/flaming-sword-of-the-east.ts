import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const flamingSwordOfTheEastCardDefinition: CardDefinition = {
  id: "flaming_sword_of_the_east",
  name: "Flaming Sword of the East",
  cardTypes: ["artifact"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
