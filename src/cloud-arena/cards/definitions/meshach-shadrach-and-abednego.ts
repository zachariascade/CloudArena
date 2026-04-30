import type { CardDefinition } from "../../core/types.js";
import { danielFieryFurnaceDisplay } from "./daniel-display.js";

export const meshachShadrachAndAbednegoCardDefinition: CardDefinition = {
  id: "meshach_shadrach_and_abednego",
  name: "Meshach, Shadrach and Abednego",
  cardTypes: ["creature"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: {
    id: "daniel",
    name: "Daniel",
  },
  display: danielFieryFurnaceDisplay,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
