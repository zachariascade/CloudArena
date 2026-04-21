import type { CardDefinition } from "../../core/types.js";

export const armoryDiscipleCardDefinition: CardDefinition = {
  id: "armory_disciple",
  name: "Tubal-Cain, Forger of Bronze and Iron",
  cardTypes: ["creature"],
  cost: 2,
  display: {
    title: "Tubal-Cain, Forger of Bronze and Iron",
    subtitle: "Creature - Human",
    frameTone: "white",
    manaCost: "{2}",
    imagePath: "card_0041_tubal_cain_forger_of_bronze_and_iron.jpg",
    imageAlt: "A disciple receiving blessed arms before battle",
    flavorText: "The right tool arrives the moment discipline becomes devotion.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "008",
    footerStat: "2/4",
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
