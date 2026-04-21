import type { CardDefinition } from "../../core/types.js";

export const enemyBruteCardDefinition: CardDefinition = {
  id: "enemy_brute",
  name: "Beast of the Pit",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Beast of the Pit",
    subtitle: "Enemy - Demon",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "card_0009_lucifer_fallen_angel_of_light.webp",
    imageAlt: "A hulking demon brute wrapped in fire and shadow",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E04",
  },
  onPlay: [],
  power: 4,
  health: 8,
  recoveryPolicy: "none",
  abilities: [],
};
