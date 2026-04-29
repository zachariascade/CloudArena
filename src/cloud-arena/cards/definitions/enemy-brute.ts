import type { CardDefinition } from "../../core/types.js";

export const enemyBruteCardDefinition: CardDefinition = {
  id: "enemy_brute",
  name: "Pan, Horned Brute",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Pan, Horned Brute",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "dante-swarm.jpeg",
    imageAlt: "A hulking demon brute wrapped in fire and shadow",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E04",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 4,
  health: 8,
  recoveryPolicy: "none",
  abilities: [],
};
