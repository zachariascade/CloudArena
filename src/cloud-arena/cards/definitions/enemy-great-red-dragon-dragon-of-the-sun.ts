import type { CardDefinition } from "../../core/types.js";

export const enemyGreatRedDragonDragonOfTheSunCardDefinition: CardDefinition = {
  id: "enemy_great_red_dragon_dragon_of_the_sun",
  name: "Great Red Dragon, Dragon of the Sun",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Great Red Dragon, Dragon of the Sun",
    frameTone: "split-black-red",
    manaCost: "{0}",
    artist: "William Blake",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/The%20Great%20Red%20Dragon%20and%20the%20Woman%20Clothed%20with%20the%20Sun.jpg",
    imageAlt: "William Blake's Great Red Dragon",
    flavorText: "The sun gives it color; the fire does the rest.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E21",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 7,
  health: 7,
  recoveryPolicy: "none",
  keywords: ["menace", "deathtouch"],
  abilities: [],
};
