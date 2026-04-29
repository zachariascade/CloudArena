import type { CardDefinition } from "../../core/types.js";

export const enemyDemonPierceCardDefinition: CardDefinition = {
  id: "enemy_demon_pierce",
  name: "Pierce",
  cardTypes: ["instant"],
  cost: 0,
  display: {
    title: "Pierce",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "demon-pierce.png",
    imageAlt: "A demon driving forward in a lethal spearpoint of shadow and flame",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E17",
  },
  onPlay: [],
  playableInPlayerDecks: false,
};
