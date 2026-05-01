import type { CardDefinition } from "../../core/types.js";

export const sanctifiedGuideCardDefinition: CardDefinition = {
  id: "sanctified_guide",
  name: "Pillar of Cloud",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    name: "Pillar of Cloud",
    frameTone: "white",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Gustave_Dore_Bible_The_Tower_of_Babel.jpg/960px-Gustave_Dore_Bible_The_Tower_of_Babel.jpg",
    imageAlt: "An angel guiding a single blessing onto the field",
    flavorText: "A steady hand can direct grace exactly where the line is thinnest.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "014",
  },
  subtypes: ["Angel"],
  onPlay: [],
  power: 2,
  health: 4,
  abilities: [
    {
      kind: "activated",
      id: "bless_target",
      activation: {
        type: "action",
        actionId: "bless_target",
      },
      costs: [{ type: "tap" }],
      targeting: {
        prompt: "Choose a creature to bless",
        allowSelfTarget: false,
      },
      effects: [
        {
          type: "add_counter",
          target: {
            zone: "battlefield",
            controller: "you",
            cardType: "creature",
          },
          powerDelta: 1,
          healthDelta: 1,
        },
      ],
    },
  ],
};
