import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const booksWereOpenedCardDefinition: CardDefinition = {
  id: "books_were_opened",
  name: "Books Were Opened",
  cardTypes: ["enchantment"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
