import type { CardDefinition } from "../../core/types.js";

export const enemyPackAlphaCardDefinition: CardDefinition = {
  id: "enemy_pack_alpha",
  name: "Legion",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Legion",
    frameTone: "split-black-red",
    imagePath: "Christ_healing_the_man_possessed_with_devils.jpg",
    imageAlt: "Jesus healing the man possessed by demons",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E05",
  },
  onPlay: [],
  playableInPlayerDecks: false,
  power: 0,
  health: 0,
  abilities: [],
};
