import type { CardDefinition } from "../../core/types.js";

export const enemyLongBattleDemonCardDefinition: CardDefinition = {
  id: "enemy_long_battle_demon",
  name: "Long Battle Demon",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "Long Battle Demon",
    title: "Long Battle Demon",
    frameTone: "split-black-red",
    imagePath: "card_0009_lucifer_fallen_angel_of_light.webp",
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
