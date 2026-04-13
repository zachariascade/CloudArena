import type { CardDefinition } from "../../core/types.js";

export const anointedBannerCardDefinition: CardDefinition = {
  id: "anointed_banner",
  name: "Anointed Banner",
  cardTypes: ["artifact"],
  cost: 2,
  onPlay: [],
  power: 0,
  health: 6,
  abilities: [
    {
      id: "anointed_banner_apply_block",
      kind: "activated",
      activation: { type: "action", actionId: "apply_block" },
      effects: [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 2 },
        },
      ],
    },
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
