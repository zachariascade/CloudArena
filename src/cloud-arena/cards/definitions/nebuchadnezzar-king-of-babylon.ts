import type { CardDefinition } from "../../core/types.js";
import { danielStatueDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const nebuchadnezzarKingOfBabylonCardDefinition: CardDefinition = {
  id: "nebuchadnezzar_king_of_babylon",
  name: "Nebuchadnezzar, King of Babylon",
  cardTypes: ["creature"],
  cost: 5,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielStatueDisplay,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
