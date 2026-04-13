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
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "sacrifice",
          selector: {
            zone: "battlefield",
            controller: "you",
            cardType: "permanent",
            relation: "another",
          },
          amount: 1,
          choice: "controller",
        },
      ],
    },
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
          counter: "+1/+1",
          amount: { type: "constant", value: 1 },
        },
      ],
    },
  ],
};
