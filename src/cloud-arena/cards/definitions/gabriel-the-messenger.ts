import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const gabrielTheMessengerCardDefinition: CardDefinition = {
  id: "gabriel_the_messenger",
  name: "Gabriel the Messenger, Herald of Visions",
  cardTypes: ["creature"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  rarity: "mythic",
  onPlay: [],
  power: 0,
  health: 1,
  subtypes: ["Angel"],
  abilities: [],
};
