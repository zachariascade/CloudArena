import type { CardDefinition } from "../../core/types.js";
import { danielFieryFurnaceDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const fieryFurnaceCardDefinition: CardDefinition = {
  id: "fiery_furnace",
  name: "Fiery Furnace",
  cardTypes: ["sorcery"],
  cost: 3,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielFieryFurnaceDisplay,
  onPlay: [],
  abilities: [],
};
