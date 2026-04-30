import type { CardDefinition } from "../../core/types.js";
import { danielLastJudgmentDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const timeOfTheEndCardDefinition: CardDefinition = {
  id: "time_of_the_end",
  name: "Time of the End",
  cardTypes: ["enchantment"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: danielLastJudgmentDisplay,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
