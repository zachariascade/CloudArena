import type { CardDefinition } from "../../core/types.js";

export const enemyGruntDemonCardDefinition: CardDefinition = {
  id: "enemy_grunt_demon",
  name: "Grunt Demon",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Grunt Demon",
    subtitle: "Enemy - Demon",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "grunt_demon.svg",
    imageAlt: "A horned demon soldier framed by smoke and ember light",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E02",
  },
  onPlay: [],
  power: 0,
  health: 0,
  abilities: [],
};
