import type { CardDefinition } from "../../core/types.js";

export const armoryDiscipleCardDefinition: CardDefinition = {
  id: "armory_disciple",
  name: "Tubal-Cain, Forger of Bronze and Iron",
  cardTypes: ["creature"],
  cost: 2,
  display: {
    name: "Tubal-Cain, Forger of Bronze and Iron",
    frameTone: "white",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Gustave_Dore_Bible_The_Tower_of_Babel.jpg/960px-Gustave_Dore_Bible_The_Tower_of_Babel.jpg",
    imageAlt: "Tubal-Cain forging bronze and iron in a biblical illustration",
    flavorText: "The right tool arrives the moment discipline becomes devotion.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "008",
  },
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
