import type { CardDefinition } from "../../core/types.js";

export const enemyMalchiorCardDefinition: CardDefinition = {
  id: "enemy_malchior",
  name: "Malchior, Binder of Wills",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "Malchior, Binder of Wills",
    title: "Malchior, Binder of Wills",
    frameTone: "split-black-red",
    imagePath: "dante-eagle.jpg",
    imageAlt: "A dark sovereign presiding over a scene of domination and judgment",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E06",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 0,
  health: 0,
  keywords: ["menace"],
  abilities: [],
};
