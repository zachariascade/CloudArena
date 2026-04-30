import type { CardDefinition } from "../../core/types.js";
import { danielStatueDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const stoneCutWithoutHandsCardDefinition: CardDefinition = {
  id: "stone_cut_without_hands",
  name: "Stone Cut Without Hands",
  cardTypes: ["artifact"],
  cost: 3,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielStatueDisplay,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
