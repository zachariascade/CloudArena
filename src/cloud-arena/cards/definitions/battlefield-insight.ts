import type { CardDefinition } from "../../core/types.js";

export const battlefieldInsightCardDefinition: CardDefinition = {
  id: "battlefield_insight",
  name: "Watchman on the Wall",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    name: "Watchman on the Wall",
    title: "Watchman on the Wall",
    frameTone: "white",
    imagePath: "card_0037_builder_of_the_tower.jpg",
    imageAlt:
      "A high vantage over the battlefield revealing the shape of the fight",
    flavorText: "Clarity grows where the field can be seen in full.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "022",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "draw_card",
      target: "self",
      amount: {
        type: "count",
        selector: {
          zone: "battlefield",
          cardType: "creature",
        },
      },
    },
  ],
};
