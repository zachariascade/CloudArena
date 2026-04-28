import type { CardDefinition } from "../../core/types.js";

export const enemySatanAsTheFallenAngelCardDefinition: CardDefinition = {
  id: "enemy_satan_as_the_fallen_angel",
  name: "Satan as the Fallen Angel",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Satan as the Fallen Angel",
    subtitle: "Enemy - Angel Demon",
    frameTone: "split-black-red",
    manaCost: "{0}",
    artist: "Sir Thomas Lawrence",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/%27Satan%20as%20the%20Fallen%20Angel%27%20by%20Sir%20Thomas%20Lawrence,%20chalk.jpg",
    imageAlt: "Sir Thomas Lawrence's Satan as the Fallen Angel",
    flavorText: "The ruin is quiet, but the pride remains eloquent.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E14",
    footerStat: "4/5",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 4,
  health: 5,
  recoveryPolicy: "none",
  keywords: ["menace"],
  abilities: [],
};
