import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const miriamTheProphetessCardDefinition: CardDefinition = {
  id: "miriam_the_prophetess",
  name: "Miriam the Prophetess, Singer of Deliverance",
  cardTypes: ["creature"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Human", "Prophet", "Bard"],
  abilities: [],
};
