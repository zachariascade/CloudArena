import type { CardDefinition } from "../../core/types.js";
import { danielFieryFurnaceDisplay } from "./daniel-display.js";
import { CARD_SETS } from "../card-sets.js";

export const deliveranceFromFireCardDefinition: CardDefinition = {
  id: "deliverance_from_fire",
  name: "Deliverance from Fire",
  cardTypes: ["sorcery"],
  cost: 3,

  cardSet: CARD_SETS.daniel,
  display: danielFieryFurnaceDisplay,
  onPlay: [],
  spellEffects: [
    {
      type: "grant_keyword",
      target: {
        zone: "battlefield",
        controller: "you",
        cardType: "permanent",
      },
      keyword: "indestructible",
      duration: "end_of_turn",
    },
  ],
};
