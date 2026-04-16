import type { CardDefinition } from "../../core/types.js";

export const graveyardHymnCardDefinition: CardDefinition = {
  id: "graveyard_hymn",
  name: "Graveyard Hymn",
  cardTypes: ["creature"],
  cost: 2,
  subtypes: ["Angel"],
  onPlay: [],
  power: 2,
  health: 2,
  abilities: [
    {
      kind: "triggered",
      trigger: {
        event: "permanent_died",
        selector: {
          relation: "self",
        },
      },
        effects: [
          {
            type: "add_counter",
            target: {
              zone: "battlefield",
              cardType: "creature",
            },
            powerDelta: 1,
            healthDelta: 1,
          },
      ],
    },
  ],
};
