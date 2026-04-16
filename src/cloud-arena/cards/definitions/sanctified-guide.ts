import type { CardDefinition } from "../../core/types.js";

export const sanctifiedGuideCardDefinition: CardDefinition = {
  id: "sanctified_guide",
  name: "Sanctified Guide",
  cardTypes: ["creature"],
  cost: 3,
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
