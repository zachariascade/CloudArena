import type { CardDefinition } from "../../core/types.js";

export const enemyFallenAngelCabanelCardDefinition: CardDefinition = {
  id: "enemy_fallen_angel_cabanel",
  name: "The Fallen Angel",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "The Fallen Angel",
    frameTone: "split-black-red",
    manaCost: "{0}",
    artist: "Alexandre Cabanel",
    imagePath: "https://commons.wikimedia.org/wiki/Special:FilePath/The%20Fallen%20Angel.jpg",
    imageAlt: "Alexandre Cabanel's The Fallen Angel",
    flavorText: "A severed glow still burns where grace once stood.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E13",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 5,
  health: 5,
  recoveryPolicy: "none",
  abilities: [],
};
