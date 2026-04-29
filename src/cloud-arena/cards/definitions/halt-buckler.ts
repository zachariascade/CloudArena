import type { CardDefinition } from "../../core/types.js";

export const haltBucklerCardDefinition: CardDefinition = {
  id: "halt_buckler",
  name: "Bulwark of Intercession",
  cardTypes: ["artifact"],
  cost: 2,
  display: {
    title: "Bulwark of Intercession",
    frameTone: "colorless",
    manaCost: "{2}",
    imagePath: "card_0036_watcher_at_edens_gate.jpg",
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
