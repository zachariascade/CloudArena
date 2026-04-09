import type { CardDefinition } from "../../core/types.js";

export const choirCaptainCardDefinition: CardDefinition = {
  id: "choir_captain",
  name: "Choir Captain",
  type: "permanent",
  cost: 3,
  subtypes: ["Angel"],
  onPlay: [],
  health: 9,
  actions: [{ attackAmount: 2 }],
  abilities: [
    {
      kind: "static",
      modifier: {
        target: "self",
        stat: "damage",
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
