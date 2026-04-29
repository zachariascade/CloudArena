import type { CardDefinition } from "../../core/types.js";

export const enemyDemonicCurseCardDefinition: CardDefinition = {
  id: "enemy_demonic_curse",
  name: "Demonic Curse",
  cardTypes: ["instant"],
  cost: 0,
  display: {
    name: "Demonic Curse",
    title: "Demonic Curse",
    frameTone: "split-black-red",
    imagePath: "demonic-curse",
    imageAlt: "A demonic curse spreading across the battlefield",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E14",
  },
  onPlay: [],
  playableInPlayerDecks: false,
};
