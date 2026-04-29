import type { CardDefinition } from "../../core/types.js";

export const enemyNumberOfTheBeast666CardDefinition: CardDefinition = {
  id: "enemy_number_of_the_beast_666",
  name: "The Number of the Beast is 666",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "The Number of the Beast is 666",
    frameTone: "split-black-red",
    artist: "William Blake",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/The%20number%20of%20the%20beast%20is%20666%20Philadelphia,%20Rosenbach%20Museum%20and%20Library.jpg",
    imageAlt: "William Blake's The Number of the Beast is 666",
    flavorText: "A count can become a summons when spoken by the wrong mouth.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E17",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 5,
  health: 5,
  recoveryPolicy: "none",
  keywords: ["menace"],
  abilities: [],
};
