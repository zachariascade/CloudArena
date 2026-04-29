import type { CardDefinition } from "../../core/types.js";

export const enemyTriumphOfDeathCardDefinition: CardDefinition = {
  id: "enemy_triumph_of_death",
  name: "The Triumph of Death",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "The Triumph of Death",
    frameTone: "split-black-red",
    artist: "Pieter Bruegel the Elder",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/The%20Triumph%20of%20Death%20by%20Pieter%20Bruegel%20the%20Elder.jpg",
    imageAlt: "Pieter Bruegel the Elder's The Triumph of Death",
    flavorText: "No banner can outlast the silence that follows it.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E23",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 6,
  health: 7,
  recoveryPolicy: "none",
  keywords: ["menace"],
  abilities: [],
};
