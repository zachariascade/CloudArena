import type { CardDefinition } from "../../core/types.js";

export const enemySaturnDevouringHisSonGoyaCardDefinition: CardDefinition = {
  id: "enemy_saturn_devouring_his_son_goya",
  name: "Saturn Devouring His Son",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "Saturn Devouring His Son",
    title: "Saturn Devouring His Son",
    frameTone: "split-black-red",
    artist: "Francisco de Goya",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Saturn%20Devouring%20His%20Son.jpg",
    imageAlt: "Francisco de Goya's Saturn Devouring His Son",
    flavorText: "A god who feeds on heirs eventually becomes a famine.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E18",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 6,
  health: 6,
  recoveryPolicy: "none",
  keywords: ["menace"],
  abilities: [],
};
