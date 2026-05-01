import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const nebuchadnezzarBeastOfTheFieldCardDefinition: CardDefinition = {
  id: "nebuchadnezzar_beast_of_the_field",
  name: "Nebuchadnezzar, Beast of the Field",
  cardTypes: ["creature"],
  cost: 5,
  rarity: "mythic",
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Beast"],
  abilities: [],
};
