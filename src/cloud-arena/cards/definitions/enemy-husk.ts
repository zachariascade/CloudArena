import type { CardDefinition } from "../../core/types.js";

export const enemyHuskCardDefinition: CardDefinition = {
  id: "enemy_husk",
  name: "Cocytus, Lake of Ice",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "Cocytus, Lake of Ice",
    frameTone: "split-black-red",
    imagePath: "dante-cocytus.jpg",
    imageAlt: "A frozen infernal scene inspired by Dante's ninth circle",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E03",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 2,
  health: 6,
  recoveryPolicy: "none",
  abilities: [],
};
