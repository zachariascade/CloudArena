import type { CardDefinition } from "../../core/types.js";

export const enemyViperShadeCardDefinition: CardDefinition = {
  id: "enemy_viper_shade",
  name: "Viper Shade",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Viper Shade",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "classics/card_0048_the_serpent_whisperer_in_the_garden.png",
    imageAlt: "A shadowy serpentine demon coiled in the dark, its touch bringing instant death",
    flavorText: "It does not need strength. A single touch is enough.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E16",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 2,
  health: 4,
  recoveryPolicy: "none",
  keywords: ["deathtouch"],
  abilities: [],
};
