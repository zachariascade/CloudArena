import type { CardDefinition } from "../../core/types.js";

export const defendingStrikeCardDefinition: CardDefinition = {
  id: "defending_strike",
  name: "Zeal of Phinehas",
  cardTypes: ["instant"],
  cost: 2,
  display: {
    name: "Zeal of Phinehas",
    frameTone: "split-white-red",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/003.Adam%20and%20Eve%20Are%20Driven%20out%20of%20Eden.jpg/960px-003.Adam%20and%20Eve%20Are%20Driven%20out%20of%20Eden.jpg",
    imageAlt: "A hard-earned warning wrapped around a burning edge",
    flavorText: "Turn defense into pressure before the enemy can reset.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "003",
  },
  onPlay: [
    { attackAmount: 5, target: "enemy" },
    { blockAmount: 5, target: "player" },
  ],
};
