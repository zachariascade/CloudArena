import type { CardDefinition } from "../../core/types.js";

export const refreshSignetCardDefinition: CardDefinition = {
  id: "refresh_signet",
  name: "Signet of Renewal",
  cardTypes: ["artifact"],
  cost: 2,
  display: {
    name: "Signet of Renewal",
    title: "Signet of Renewal",
    frameTone: "colorless",
    imagePath: "card_0030_tree_of_life.jpg",
    imageAlt: "A shining signet carrying a warm pulse of restoring light",
    flavorText: "Even a worn guardian can be called back to the shape it was meant to hold.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "019",
  },
  subtypes: ["Equipment"],
  onPlay: [],
  power: 0,
  health: 1,
  grantedKeywords: ["refresh"],
};
