import type { CardDefinition } from "../../core/types.js";

export const resurrectCardDefinition: CardDefinition = {
  id: "resurrect",
  name: "Raised from the Tomb",
  cardTypes: ["instant"],
  cost: 2,
  display: {
    title: "Raised from the Tomb",
    frameTone: "white",
    manaCost: "{2}",
    imagePath: "https://commons.wikimedia.org/wiki/Special:FilePath/Benozzo%20Gozzoli%2C%20The%20Raising%20of%20Lazarus%2C%20mid%201490s%2C%20NGA%201163.jpg",
    imageAlt: "Benozzo Gozzoli's The Raising of Lazarus",
    flavorText: "What falls away can be gathered back, cleanly and with purpose.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "017",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "return_from_graveyard",
      selector: {
        zone: "graveyard",
        controller: "you",
      },
      targeting: {
        prompt: "Choose a card from your graveyard",
      },
    },
  ],
};
