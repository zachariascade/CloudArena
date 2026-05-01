import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const partingOfTheRedSeaCardDefinition: CardDefinition = {
  id: "parting_of_the_red_sea",
  name: "Parting of the Red Sea",
  cardTypes: ["sorcery"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
};
