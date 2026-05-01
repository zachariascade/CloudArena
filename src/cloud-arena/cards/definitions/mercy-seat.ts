import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const mercySeatCardDefinition: CardDefinition = {
  id: "mercy_seat",
  name: "Mercy Seat",
  cardTypes: ["artifact"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
