import type { CardDefinition } from "../../core/types.js";

export const enemyLeaderCardDefinition: CardDefinition = {
  id: "enemy_leader",
  name: "Prince of This World",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Prince of This World",
    subtitle: "Enemy - Demon",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "card_0009_lucifer_fallen_angel_of_light.webp",
    imageAlt: "A fallen angel wreathed in fire and shadow",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E00",
  },
  onPlay: [],
  power: 0,
  health: 0,
  abilities: [],
};
