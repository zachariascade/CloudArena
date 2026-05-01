import type { CardDefinition } from "../../core/types.js";

export const haltBucklerCardDefinition: CardDefinition = {
  id: "halt_buckler",
  name: "Bulwark of Intercession",
  cardTypes: ["artifact"],
  cost: 2,
  display: {
    name: "Bulwark of Intercession",
    frameTone: "colorless",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg/960px-Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg",
    imageAlt: "A holy buckler lifted to catch the full force of an oncoming strike",
    flavorText: "A bearer behind it becomes a wall, and a wall behind it becomes a promise.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "020",
  },
  subtypes: ["Equipment"],
  onPlay: [],
  power: 0,
  health: 1,
  grantedKeywords: ["halt"],
};
