import type { CardDefinition } from "../../core/types.js";

export const enemyHuskCardDefinition: CardDefinition = {
  id: "enemy_husk",
  name: "Vessel of Wrath",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Vessel of Wrath",
    subtitle: "Enemy - Demon",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "grunt_demon.svg",
    imageAlt: "A lean demon husk with cracked armor and ember-lit eyes",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E03",
  },
  onPlay: [],
  power: 2,
  health: 6,
  recoveryPolicy: "none",
  abilities: [],
};
