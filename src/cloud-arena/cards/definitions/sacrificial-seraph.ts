import type { CardDefinition } from "../../core/types.js";

export const sacrificialSeraphCardDefinition: CardDefinition = {
  id: "sacrificial_seraph",
  name: "Sacrificial Seraph",
  cardTypes: ["creature"],
  cost: 2,
  subtypes: ["Angel"],
  onPlay: [],
  power: 3,
  health: 8,
  preSummonEffects: [
    {
      type: "sacrifice",
      selector: {
        zone: "battlefield",
        controller: "you",
        cardType: "creature",
        relation: "another",
      },
      targeting: {
        prompt: "Choose a creature to sacrifice",
      },
      amount: 1,
      choice: "controller",
    },
  ],
  abilities: [
    {
      kind: "triggered",
      trigger: {
        event: "permanent_died",
        selector: {
          controller: "you",
          cardType: "permanent",
          relation: "another",
        },
      },
      effects: [
        {
          type: "add_counter",
          target: "self",
          powerDelta: 1,
          healthDelta: 1,
        },
      ],
    },
  ],
};
