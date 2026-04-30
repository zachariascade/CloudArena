import type { CardDefinition } from "../../core/types.js";
import { danielBeastsDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const littleHornCardDefinition: CardDefinition = {
  id: "little_horn",
  name: "Little Horn",
  cardTypes: ["creature"],
  cost: 2,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielBeastsDisplay,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
