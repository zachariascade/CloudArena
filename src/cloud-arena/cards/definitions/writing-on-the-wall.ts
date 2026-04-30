import type { CardDefinition } from "../../core/types.js";
import { danielBelshazzarDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const writingOnTheWallCardDefinition: CardDefinition = {
  id: "writing_on_the_wall",
  name: "Writing on the Wall",
  cardTypes: ["sorcery"],
  cost: 3,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielBelshazzarDisplay,
  onPlay: [],
  abilities: [],
};
