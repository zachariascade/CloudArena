import type { CardDefinition } from "../../core/types.js";

export const gallerySaintMichaelVanquishingSatanCardDefinition: CardDefinition = {
  id: "gallery_saint_michael_vanquishing_satan",
  name: "Saint Michael Vanquishing Satan",
  cardTypes: ["creature"],
  cost: 5,
  display: {
    title: "Champion of Heaven",
    subtitle: "Legendary Creature - Angel",
    frameTone: "split-white-red",
    manaCost: "{5}",
    artist: "Raphael",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/7/74/Raphael_-_St._Michael_Vanquishing_Satan.jpg",
    imageAlt: "Raphael's Saint Michael Vanquishing Satan",
    flavorText: "The victory is not only force. It is order restored.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "047",
    footerStat: "5/6",
  },
  subtypes: ["Angel"],
  onPlay: [],
  power: 5,
  health: 6,
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "deal_damage",
          target: "enemy",
          amount: { type: "constant", value: 3 },
        },
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 3 },
        },
      ],
    },
    {
      id: "gallery_saint_michael_vanquishing_satan_smite",
      kind: "activated",
      activation: { type: "action", actionId: "smite_fiend" },
      costs: [
        { type: "energy", amount: 2 },
      ],
      effects: [
        {
          type: "deal_damage",
          target: "enemy",
          amount: { type: "constant", value: 2 },
        },
      ],
    },
  ],
};
