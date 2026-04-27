import type { CardDefinition } from "../../core/types.js";

export const enemyDemonicBoostCardDefinition: CardDefinition = {
  id: "enemy_demonic_boost",
  name: "Demonic Boost",
  cardTypes: ["instant"],
  cost: 0,
  display: {
    title: "Demonic Boost",
    subtitle: "Enemy - Ritual",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "demonic-boost.png",
    imageAlt: "A demon surging with stolen power",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E15",
  },
  onPlay: [],
  playableInPlayerDecks: false,
};
