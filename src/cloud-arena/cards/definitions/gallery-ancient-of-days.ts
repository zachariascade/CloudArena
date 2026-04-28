import type { CardDefinition } from "../../core/types.js";

export const galleryAncientOfDaysCardDefinition: CardDefinition = {
  id: "gallery_ancient_of_days",
  name: "Ancient of Days",
  cardTypes: ["creature"],
  cost: 4,
  display: {
    title: "Keeper of the First Dawn",
    subtitle: "Legendary Creature - Sage",
    frameTone: "white",
    manaCost: "{4}",
    artist: "William Blake",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg/960px-The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg",
    imageAlt: "William Blake's The Ancient of Days",
    flavorText: "A single patient mind can hold the sky in its proper shape.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "031",
    footerStat: "4/6",
  },
  subtypes: ["Sage"],
  onPlay: [],
  power: 4,
  health: 6,
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
        {
          type: "gain_energy",
          target: "player",
          amount: { type: "constant", value: 1 },
        },
      ],
    },
    {
      id: "ancient_of_days_meditate",
      kind: "activated",
      activation: { type: "action", actionId: "meditate" },
      costs: [
        { type: "energy", amount: 2 },
        { type: "tap" },
      ],
      effects: [
        {
          type: "draw_card",
          target: "self",
          amount: { type: "constant", value: 2 },
        },
      ],
    },
  ],
};
