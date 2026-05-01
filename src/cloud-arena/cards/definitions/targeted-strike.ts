import type { CardDefinition } from "../../core/types.js";

export const targetedStrikeCardDefinition: CardDefinition = {
  id: "targeted_strike",
  name: "David's Stone",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    name: "David's Stone",
    frameTone: "red",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/005.Cain_Slays_Abel.jpg/960px-005.Cain_Slays_Abel.jpg",
    imageAlt: "A marked exile struck by a precise blow",
    flavorText: "The sharpest strike is the one that lands exactly where it should.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "024",
  },
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
