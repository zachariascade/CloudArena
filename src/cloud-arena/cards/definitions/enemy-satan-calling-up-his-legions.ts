import type { CardDefinition } from "../../core/types.js";

export const enemySatanCallingUpHisLegionsCardDefinition: CardDefinition = {
  id: "enemy_satan_calling_up_his_legions",
  name: "Satan Calling Up His Legions",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Satan Calling Up His Legions",
    frameTone: "split-black-red",
    manaCost: "{0}",
    artist: "William Blake",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Satan%20Calling%20up%20his%20legions.jpg",
    imageAlt: "William Blake's Satan Calling Up His Legions",
    flavorText: "The first summons is always a memory of the war to come.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E16",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 6,
  health: 6,
  recoveryPolicy: "none",
  keywords: ["menace"],
  abilities: [],
};
