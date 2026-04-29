import type { CardDefinition } from "../../core/types.js";

export const defendCardDefinition: CardDefinition = {
  id: "defend",
  name: "Shield of Faith",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    name: "Shield of Faith",
    frameTone: "white",
    imagePath: "card_0033_eden_garden_of_delight.jpg",
    imageAlt: "A steadfast shelter standing against the storm",
    flavorText: "Meet the blow with discipline, not panic.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "002",
  },
  onPlay: [{ blockAmount: 5, target: "player" }],
};
