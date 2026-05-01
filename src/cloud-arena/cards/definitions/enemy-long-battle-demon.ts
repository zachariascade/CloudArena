import type { CardDefinition } from "../../core/types.js";

export const enemyLongBattleDemonCardDefinition: CardDefinition = {
  id: "enemy_long_battle_demon",
  name: "Long Battle Demon",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "Long Battle Demon",
    frameTone: "split-black-red",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/William%20Blake%2C%20The%20Casting%20of%20the%20Rebel%20Angels%20into%20Hell.JPG/960px-William%20Blake%2C%20The%20Casting%20of%20the%20Rebel%20Angels%20into%20Hell.JPG",
    imageAlt: "A battle-worn demon lord marked by the length of the fight",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E12",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 0,
  health: 0,
  abilities: [],
};
