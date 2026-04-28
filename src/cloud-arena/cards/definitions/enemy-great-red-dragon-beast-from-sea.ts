import type { CardDefinition } from "../../core/types.js";

export const enemyGreatRedDragonBeastFromSeaCardDefinition: CardDefinition = {
  id: "enemy_great_red_dragon_beast_from_sea",
  name: "Great Red Dragon, Beast from the Sea",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Great Red Dragon, Beast from the Sea",
    subtitle: "Enemy - Dragon",
    frameTone: "split-black-red",
    manaCost: "{0}",
    artist: "William Blake",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/William%20Blake,%20The%20Great%20Red%20Dragon%20and%20the%20Beast%20from%20the%20Sea,%20c.%201805,%20NGA%2011499.jpg",
    imageAlt: "William Blake's Great Red Dragon and the Beast from the Sea",
    flavorText: "It rises from the deep with a scripture of claws and fire.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E20",
    footerStat: "6/6",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 6,
  health: 6,
  recoveryPolicy: "none",
  keywords: ["menace", "deathtouch"],
  abilities: [],
};
