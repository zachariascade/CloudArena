import type { CardDefinition } from "../../core/types.js";

export const targetedStrikeCardDefinition: CardDefinition = {
  id: "targeted_strike",
  name: "Targeted Strike",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    title: "Targeted Strike",
    subtitle: "Instant",
    frameTone: "red",
    manaCost: "{1}",
    imagePath: "card_0023_cain_marked_exile.jpg",
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
