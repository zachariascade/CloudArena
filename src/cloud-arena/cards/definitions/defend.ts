import type { CardDefinition } from "../../core/types.js";

export const defendCardDefinition: CardDefinition = {
  id: "defend",
  name: "Shield of Faith",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    name: "Shield of Faith",
    frameTone: "white",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg/960px-Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg",
    imageAlt: "A steadfast shelter standing against the storm",
    flavorText: "Meet the blow with discipline, not panic.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "002",
  },
  onPlay: [{ blockAmount: 5, target: "player" }],
};
