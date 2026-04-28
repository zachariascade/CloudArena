import type { CardDefinition } from "../../core/types.js";

export const galleryTriumphOfChristianityOverPaganismCardDefinition: CardDefinition = {
  id: "gallery_triumph_of_christianity_over_paganism",
  name: "The Triumph of Christianity Over Paganism",
  cardTypes: ["enchantment"],
  cost: 3,
  display: {
    title: "Triumph of the Cross",
    subtitle: "Legendary Enchantment",
    frameTone: "white",
    manaCost: "{3}",
    artist: "Gustave Doré",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/The_Triumph_Of_Christianity_Over_Paganism.Gustave_Dor%C3%A9.jpg/960px-The_Triumph_Of_Christianity_Over_Paganism.Gustave_Dor%C3%A9.jpg",
    imageAlt: "Gustave Doré's The Triumph of Christianity Over Paganism",
    flavorText: "What endures eventually becomes the architecture around which the rest must turn.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "052",
  },
  onPlay: [],
  power: 0,
  health: 7,
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 6 },
        },
      ],
    },
    {
      kind: "triggered",
      trigger: {
        event: "turn_started",
        player: "self",
      },
      effects: [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 1 },
        },
      ],
    },
  ],
};
