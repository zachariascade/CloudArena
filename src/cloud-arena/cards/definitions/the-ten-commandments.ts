import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const theTenCommandmentsCardDefinition: CardDefinition = {
  id: "the_ten_commandments",
  name: "The Ten Commandments",
  cardTypes: ["enchantment"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
