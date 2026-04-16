import type { CardDefinition } from "../../core/types.js";

export const armoryDiscipleCardDefinition: CardDefinition = {
  id: "armory_disciple",
  name: "Armory Disciple",
  cardTypes: ["creature"],
  cost: 2,
  onPlay: [],
  power: 2,
  health: 4,
  abilities: [
    // {
    //   kind: "triggered",
    //   trigger: { event: "self_enters_battlefield" },
    //   effects: [
    //     {
    //       type: "attach_from_hand",
    //       selector: {
    //         zone: "hand",
    //         controller: "you",
    //         cardType: "equipment",
    //       },
    //       target: "self",
    //       optional: true,
    //       cost: "free",
    //     },
    //   ],
    // },
  ],
};
