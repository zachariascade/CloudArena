import type { CardDefinition } from "../../core/types.js";

export const enemyPackAlphaCardDefinition: CardDefinition = {
  id: "enemy_pack_alpha",
  name: "Legion",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Legion",
    subtitle: "Enemy - Demon",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "grunt_demon.svg",
    imageAlt: "A pack leader demon with a commanding stare and ember-lit armor",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E05",
  },
  onPlay: [],
  power: 0,
  health: 0,
  abilities: [],
};
