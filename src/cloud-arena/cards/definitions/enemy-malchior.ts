import type { CardDefinition } from "../../core/types.js";

export const enemyMalchiorCardDefinition: CardDefinition = {
  id: "enemy_malchior",
  name: "Malchior, Binder of Wills",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Malchior, Binder of Wills",
    subtitle: "Enemy - Demon",
    frameTone: "split-black-red",
    manaCost: "{0}",
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
  abilities: [],
};
