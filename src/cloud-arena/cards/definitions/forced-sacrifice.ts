import type { CardDefinition } from "../../core/types.js";

export const forcedSacrificeCardDefinition: CardDefinition = {
  id: "forced_sacrifice",
  name: "Forced Sacrifice",
  cardTypes: ["instant"],
  cost: 1,
  onPlay: [],
  spellEffects: [
    {
      type: "sacrifice",
      selector: {
        zone: "battlefield",
        controller: "you",
        cardType: "permanent",
      },
      targeting: {
        prompt: "Choose a permanent to sacrifice",
      },
      amount: 1,
      choice: "controller",
    },
  ],
};
