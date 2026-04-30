import type { CardDefinition } from "../../core/types.js";
import { danielAncientOfDaysDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const seventyWeeksCardDefinition: CardDefinition = {
  id: "seventy_weeks",
  name: "Seventy Weeks",
  cardTypes: ["enchantment"],
  subtypes: ["Saga"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielAncientOfDaysDisplay,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
