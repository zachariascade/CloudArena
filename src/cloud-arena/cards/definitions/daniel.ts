import type { CardDefinition } from "../../core/types.js";
import { danielLionsDenDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const danielCardDefinition: CardDefinition = {
  id: "daniel",
  name: "Daniel",
  cardTypes: ["creature"],
  cost: 3,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielLionsDenDisplay,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
