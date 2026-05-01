import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const wrestlingWithGodCardDefinition: CardDefinition = {
  id: "wrestling_with_god",
  name: "Wrestling with God",
  cardTypes: ["battle"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.genesis,
  onPlay: [],
  power: 0,
  health: 5,
  abilities: [],
};
