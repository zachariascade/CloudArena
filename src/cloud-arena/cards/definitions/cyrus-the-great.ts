import type { CardDefinition } from "../../core/types.js";
import { danielCyrusDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const cyrusTheGreatCardDefinition: CardDefinition = {
  id: "cyrus_the_great",
  name: "Cyrus the Great",
  cardTypes: ["creature"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielCyrusDisplay,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
