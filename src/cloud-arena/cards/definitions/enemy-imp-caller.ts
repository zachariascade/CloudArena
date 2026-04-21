import type { CardDefinition } from "../../core/types.js";

export const enemyImpCallerCardDefinition: CardDefinition = {
  id: "enemy_imp_caller",
  name: "Caller of Unclean Spirits",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Caller of Unclean Spirits",
    subtitle: "Enemy - Demon",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "0AF7C779-AF9B-4662-82E4-F481882E7788.jpeg",
    imageAlt: "The Imp Caller looming over a swarm of impish minions",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E06",
  },
  onPlay: [],
  power: 0,
  health: 0,
  abilities: [],
};
