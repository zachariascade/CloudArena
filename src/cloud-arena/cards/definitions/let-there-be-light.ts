import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const letThereBeLightCardDefinition: CardDefinition = {
  id: "let_there_be_light",
  name: "Let There Be Light",
  cardTypes: ["sorcery"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
};
