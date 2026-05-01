import type { CardDefinition } from "../../core/types.js";

export const tubalCainsForgeCardDefinition: CardDefinition = {
  id: "tubal_cains_forge",
  name: "Forge of Tubal-Cain",
  cardTypes: ["artifact"],
  cost: 2,
  display: {
    name: "Forge of Tubal-Cain",
    frameTone: "colorless",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Gustave_Dore_Bible_The_Tower_of_Babel.jpg/960px-Gustave_Dore_Bible_The_Tower_of_Babel.jpg",
    imageAlt: "An ancient forge blazing with sacred fire, hammering raw ore into power",
    flavorText: "He was the forger of every cutting instrument. From his hands came the fuel of war.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "027",
  },
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [
    {
      id: "tubal_cains_forge_gain_energy",
      kind: "activated",
      activation: { type: "action", actionId: "gain_energy" },
      costs: [{ type: "tap" }],
      effects: [
        {
          type: "gain_energy",
          target: "player",
          amount: { type: "constant", value: 2 },
        },
      ],
    },
  ],
};
