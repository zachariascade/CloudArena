import type { CardDefinition } from "../../core/types.js";
import { danielTreeDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const watchersDecreeCardDefinition: CardDefinition = {
  id: "watchers_decree",
  name: "Watchers' Decree",
  cardTypes: ["enchantment"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielTreeDisplay,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
