import type { CardDefinition } from "../../core/types.js";

export const attackCardDefinition: CardDefinition = {
  id: "attack",
  name: "Flaming Sword of the East",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    name: "Flaming Sword of the East",
    frameTone: "red",
    imagePath: "card_0032_flaming_sword_of_the_east.png",
    imageAlt: "A flaming sword cutting across the dark",
    flavorText: "Commit first. Let hesitation fall away after the strike lands.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "001",
  },
  onPlay: [{ attackAmount: 3, target: "enemy" }],
};
