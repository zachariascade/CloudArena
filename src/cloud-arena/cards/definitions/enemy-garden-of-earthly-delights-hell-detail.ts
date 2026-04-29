import type { CardDefinition } from "../../core/types.js";

export const enemyGardenOfEarthlyDelightsHellDetailCardDefinition: CardDefinition = {
  id: "enemy_garden_of_earthly_delights_hell_detail",
  name: "Garden of Earthly Delights - Hell Detail",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "Garden of Earthly Delights - Hell Detail",
    title: "Garden of Earthly Delights - Hell Detail",
    frameTone: "split-black-red",
    artist: "Hieronymus Bosch",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Hieronymus%20Bosch%20-%20The%20Garden%20of%20Earthly%20Delights%20-%20Hell%20Detail.jpg",
    imageAlt: "Hieronymus Bosch's Garden of Earthly Delights hell detail",
    flavorText: "Punishment here is only the shape of desire coming due.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E22",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 5,
  health: 6,
  recoveryPolicy: "none",
  keywords: ["menace"],
  abilities: [],
};
