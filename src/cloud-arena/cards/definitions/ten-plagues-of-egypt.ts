import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const tenPlaguesOfEgyptCardDefinition: CardDefinition = {
  id: "ten_plagues_of_egypt",
  name: "Ten Plagues of Egypt",
  cardTypes: ["saga"],
  cost: 4,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  power: 0,
  health: 4,
  saga: {
    chapters: [
      {
        chapter: 1,
        label: "I",
        title: "A Warning Before the First Blow",
        effects: [],
      },
    ],
  },
  abilities: [],
};
