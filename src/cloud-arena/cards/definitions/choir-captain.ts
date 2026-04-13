import type { CardDefinition } from "../../core/types.js";

export const choirCaptainCardDefinition: CardDefinition = {
  id: "choir_captain",
  name: "Choir Captain",
  cardTypes: ["creature"],
  cost: 3,
  subtypes: ["Angel"],
  onPlay: [],
  power: 2,
  health: 9,
  abilities: [
    {
      kind: "static",
      modifier: {
        target: "self",
        stat: "power",
        operation: "add",
        value: {
          type: "count",
          selector: {
            zone: "battlefield",
            subtype: "Angel",
          },
        },
      },
    },
  ],
};
