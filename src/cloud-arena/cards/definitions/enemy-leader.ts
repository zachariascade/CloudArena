import type { CardDefinition } from "../../core/types.js";

export const enemyLeaderCardDefinition: CardDefinition = {
  id: "enemy_leader",
  name: "Prince of This World",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "Prince of This World",
    frameTone: "split-black-red",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Fall%20of%20the%20rebel%20angels%20-%20Peter%20Paul%20Rubens%20(Unframed).jpg/960px-Fall%20of%20the%20rebel%20angels%20-%20Peter%20Paul%20Rubens%20(Unframed).jpg",
    imageAlt: "A fallen angel wreathed in fire and shadow",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E00",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 0,
  health: 0,
  abilities: [],
};
