import type { CardDefinition } from "../../core/types.js";

export const anointedBannerCardDefinition: CardDefinition = {
  id: "anointed_banner",
  name: "Anointed Banner",
  type: "permanent",
  cost: 2,
  onPlay: [],
  health: 6,
  actions: [{ blockAmount: 2 }],
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "add_counter",
          target: {
            zone: "battlefield",
            cardType: "permanent",
          },
          counter: "+1/+1",
          amount: { type: "constant", value: 1 },
        },
      ],
    },
  ],
};
