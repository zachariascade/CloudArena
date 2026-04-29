import type { CardDefinition } from "../../core/types.js";

export const enemyRebelAngelCardDefinition: CardDefinition = {
  id: "enemy_rebel_angel",
  name: "The Rebel Angel",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "The Rebel Angel",
    frameTone: "split-black-red",
    artist: "Nicholas Kalmakoff",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/L%E2%80%99ange%20rebelle%20%28The%20Rebel%20Angel%29%20%281924%29%20-%20Nikolai%20Kalmakov.jpg",
    imageAlt: "Nikolai Kalmakov's The Rebel Angel",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E12",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 4,
  health: 8,
  recoveryPolicy: "none",
  keywords: ["hexproof"],
  abilities: [],
};
