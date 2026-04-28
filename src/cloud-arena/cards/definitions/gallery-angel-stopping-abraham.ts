import type { CardDefinition } from "../../core/types.js";

export const galleryAngelStoppingAbrahamCardDefinition: CardDefinition = {
  id: "gallery_angel_stopping_abraham",
  name: "Angel Stopping Abraham",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    title: "Voice of Stayed Hand",
    subtitle: "Legendary Creature - Angel",
    frameTone: "split-white-green",
    manaCost: "{3}",
    artist: "Rembrandt van Rijn",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/9/96/Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg",
    imageAlt: "Rembrandt's The Angel Preventing Abraham from Sacrificing his Son, Isaac",
    flavorText: "The blade can lower itself when mercy speaks first.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "032",
    footerStat: "2/5",
  },
  subtypes: ["Angel"],
  onPlay: [],
  power: 2,
  health: 5,
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 4 },
        },
      ],
    },
    {
      id: "angel_stopping_abraham_intervene",
      kind: "activated",
      activation: { type: "action", actionId: "intervene" },
      costs: [
        { type: "energy", amount: 1 },
        { type: "tap" },
      ],
      effects: [
        {
          type: "restore_health",
          target: "self",
        },
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 3 },
        },
      ],
    },
  ],
};
