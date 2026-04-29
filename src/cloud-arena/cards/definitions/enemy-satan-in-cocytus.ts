import type { CardDefinition } from "../../core/types.js";

export const enemySatanInCocytusCardDefinition: CardDefinition = {
  id: "enemy_satan_in_cocytus",
  name: "Satan in Cocytus",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "Satan in Cocytus",
    title: "Satan in Cocytus, The Frozen Betrayer",
    frameTone: "split-black-red",
    artist: "Gustave Doré",
    imagePath:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Gustave_Dore_Inferno34.jpg/960px-Gustave_Dore_Inferno34.jpg",
    imageAlt: "Gustave Doré's Satan in Cocytus",
    flavorText: "The deepest cold is a punishment for a will that never bent.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E24",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 6,
  health: 7,
  recoveryPolicy: "none",
  keywords: ["menace"],
  abilities: [],
};
