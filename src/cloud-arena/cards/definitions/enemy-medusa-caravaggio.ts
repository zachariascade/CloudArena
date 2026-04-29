import type { CardDefinition } from "../../core/types.js";

export const enemyMedusaCaravaggioCardDefinition: CardDefinition = {
  id: "enemy_medusa_caravaggio",
  name: "Medusa",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "Medusa",
    frameTone: "black-green",
    artist: "Caravaggio",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Medusa-Caravaggio%20(Uffizi).jpg",
    imageAlt: "Caravaggio's Medusa",
    flavorText: "One glance can still a kingdom.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E19",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 4,
  health: 5,
  recoveryPolicy: "none",
  keywords: ["deathtouch"],
  abilities: [],
};
