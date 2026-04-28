import type { CardDefinition } from "../../core/types.js";

export const galleryTransfigurationCardDefinition: CardDefinition = {
  id: "gallery_transfiguration",
  name: "The Transfiguration",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    title: "Shining on the Mountain",
    subtitle: "Legendary Creature - Human",
    frameTone: "split-white-blue",
    manaCost: "{3}",
    artist: "Raphael",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Transfiguration_Raphael.jpg/960px-Transfiguration_Raphael.jpg",
    imageAlt: "Raphael's The Transfiguration",
    flavorText: "A brighter form can transform not just the eye, but the field itself.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "051",
    footerStat: "4/5",
  },
  subtypes: ["Human"],
  onPlay: [],
  power: 4,
  health: 5,
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "draw_card",
          target: "self",
          amount: { type: "constant", value: 1 },
        },
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 3 },
        },
      ],
    },
    {
      id: "gallery_transfiguration_lift",
      kind: "activated",
      activation: { type: "action", actionId: "lift_up" },
      costs: [
        { type: "energy", amount: 2 },
        { type: "tap" },
      ],
      targeting: {
        prompt: "Choose a creature you control",
      },
      effects: [
        {
          type: "add_counter",
          target: {
            zone: "battlefield",
            controller: "you",
            cardType: "creature",
            relation: "another",
          },
          powerDelta: 1,
          healthDelta: 1,
          targeting: {
            prompt: "Choose a creature to transfigure",
          },
        },
      ],
    },
  ],
};
