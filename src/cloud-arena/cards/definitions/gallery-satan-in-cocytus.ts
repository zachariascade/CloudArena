import type { CardDefinition } from "../../core/types.js";

export const gallerySatanInCocytusCardDefinition: CardDefinition = {
  id: "gallery_satan_in_cocytus",
  name: "Satan in Cocytus",
  cardTypes: ["creature"],
  cost: 6,
  display: {
    title: "The Frozen Betrayer",
    subtitle: "Legendary Creature - Demon",
    frameTone: "split-black-red",
    manaCost: "{6}",
    artist: "Gustave Doré",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Gustave_Dore_Inferno34.jpg/960px-Gustave_Dore_Inferno34.jpg",
    imageAlt: "Gustave Doré's Satan in Cocytus",
    flavorText: "The deepest cold is a punishment for a will that never bent.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "048",
    footerStat: "6/7",
  },
  subtypes: ["Demon"],
  onPlay: [],
  power: 6,
  health: 7,
  keywords: ["menace"],
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "deal_damage",
          target: "enemy",
          amount: { type: "constant", value: 2 },
        },
      ],
    },
    {
      id: "gallery_satan_in_cocytus_freeze",
      kind: "activated",
      activation: { type: "action", actionId: "freeze_blood" },
      costs: [
        { type: "energy", amount: 2 },
        { type: "tap" },
      ],
      effects: [
        {
          type: "deal_damage",
          target: "enemy",
          amount: { type: "constant", value: 3 },
        },
      ],
    },
  ],
};
