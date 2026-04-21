import type { CardDefinition } from "../../core/types.js";

export const enemyGruntDemonCardDefinition: CardDefinition = {
  id: "enemy_grunt_demon",
  name: "Demon Horde",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Demon Horde",
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
