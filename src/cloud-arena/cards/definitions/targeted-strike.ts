import type { CardDefinition } from "../../core/types.js";

export const targetedStrikeCardDefinition: CardDefinition = {
  id: "targeted_strike",
  name: "Targeted Strike",
  cardTypes: ["instant"],
  cost: 1,
  onPlay: [
    {
      attackAmount: 4,
      target: {
        zone: "enemy_battlefield",
        controller: "opponent",
        cardType: "permanent",
      },
      targeting: {
        prompt: "Choose an enemy to strike",
      },
    },
  ],
};
