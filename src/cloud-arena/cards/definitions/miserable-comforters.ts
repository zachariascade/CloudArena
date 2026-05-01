import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const miserableComfortersCardDefinition: CardDefinition = {
  id: "miserable_comforters",
  name: "Miserable Comforters",
  cardTypes: ["creature"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.job,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human", "Advisor"],
  abilities: [],
};
