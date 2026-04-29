import type { CardDefinition } from "../../core/types.js";

export const enemyDemonicShieldCardDefinition: CardDefinition = {
  id: "enemy_demonic_shield",
  name: "Demonic Shield",
  cardTypes: ["instant"],
  cost: 0,
  display: {
    name: "Demonic Shield",
    frameTone: "split-black-red",
    imagePath: "demonic-shield.png",
    imageAlt: "A demonic shield flaring with infernal protection",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E11",
  },
  onPlay: [],
  playableInPlayerDecks: false,
};
