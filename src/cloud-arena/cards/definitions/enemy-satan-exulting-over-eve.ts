import type { CardDefinition } from "../../core/types.js";

export const enemySatanExultingOverEveCardDefinition: CardDefinition = {
  id: "enemy_satan_exulting_over_eve",
  name: "Satan Exulting over Eve",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Satan Exulting over Eve",
    subtitle: "Enemy - Demon",
    frameTone: "split-black-red",
    manaCost: "{0}",
    artist: "William Blake",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Satan%20Exulting%20over%20Eve.jpg",
    imageAlt: "William Blake's Satan Exulting over Eve",
    flavorText: "A whisper of victory can stain the whole garden.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E15",
    footerStat: "5/4",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 5,
  health: 4,
  recoveryPolicy: "none",
  keywords: ["menace"],
  abilities: [],
};
