import type { CardDefinition } from "../../core/types.js";

export const defendingStrikeCardDefinition: CardDefinition = {
  id: "defending_strike",
  name: "Zeal of Phinehas",
  cardTypes: ["instant"],
  cost: 2,
  display: {
    title: "Zeal of Phinehas",
    frameTone: "split-white-red",
    manaCost: "{2}",
    imagePath: "card_0031_tree_of_forbidden_knowledge.jpg",
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
