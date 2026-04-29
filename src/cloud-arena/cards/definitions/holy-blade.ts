import type { CardDefinition } from "../../core/types.js";

export const holyBladeCardDefinition: CardDefinition = {
  id: "holy_blade",
  name: "Sword of the Cherubim",
  cardTypes: ["artifact"],
  cost: 1,
  display: {
    title: "Sword of the Cherubim",
    frameTone: "colorless",
    imagePath: "card_0027_let_there_be_light.png",
    imageAlt: "A radiant blade formed from sacred light",
    flavorText: "No hand keeps it long; it belongs where the charge is fiercest.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "009",
  },
  subtypes: ["Equipment"],
  onPlay: [],
  power: 1,
  health: 1,
};
