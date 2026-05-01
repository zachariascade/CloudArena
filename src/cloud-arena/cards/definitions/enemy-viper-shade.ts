import type { CardDefinition } from "../../core/types.js";

export const enemyViperShadeCardDefinition: CardDefinition = {
  id: "enemy_viper_shade",
  name: "Viper Shade",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "Viper Shade",
    frameTone: "split-black-red",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg/960px-The_Garden_of_Earthly_Delights_by_Bosch_High_Resolution.jpg",
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
