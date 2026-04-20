import type { CardDefinition } from "../../core/types.js";

export const radiantConduitCardDefinition: CardDefinition = {
  id: "radiant_conduit",
  name: "Radiant Conduit",
  cardTypes: ["creature"],
  cost: 2,
  display: {
    title: "Radiant Conduit",
    subtitle: "Creature - Angel",
    frameTone: "white",
    manaCost: "{2}",
    imagePath: "2B5A00FD-D279-48BD-AEFE-0711AC4E9F54.jpeg",
    imageAlt: "An angel channeling radiant energy through the battlefield",
    flavorText: "A steady conduit turns a single spark into momentum.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "020",
  },
  subtypes: ["Angel"],
  onPlay: [],
  power: 1,
  health: 3,
  abilities: [
    {
      id: "radiant_conduit_gain_energy",
      kind: "activated",
      activation: { type: "action", actionId: "gain_energy" },
      costs: [{ type: "tap" }],
      effects: [
        {
          type: "gain_energy",
          target: "player",
          amount: { type: "constant", value: 1 },
        },
      ],
    },
  ],
};
