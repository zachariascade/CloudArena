import type { CardDefinition } from "../../core/types.js";

export const anointedBannerCardDefinition: CardDefinition = {
  id: "anointed_banner",
  name: "Ark of the Covenant",
  cardTypes: ["artifact"],
  cost: 2,
  display: {
    title: "Ark of the Covenant",
    subtitle: "Artifact",
    frameTone: "white",
    manaCost: "{2}",
    imagePath: "classics/card_0057_ark_of_the_covenant.jpg",
    imageAlt: "Zanobi Strozzi's painting of King David dancing before the Ark of the Covenant",
    flavorText: "The Ark turns procession into promise, and promise into holy momentum.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "005",
  },
  onPlay: [],
  power: 0,
  health: 6,
  abilities: [
    {
      kind: "triggered",
      trigger: {
        event: "permanent_enters_battlefield",
        selector: {
          zone: "battlefield",
          controller: "you",
          cardType: "creature",
        },
      },
      effects: [
        {
          type: "add_counter",
          target: {
            zone: "battlefield",
            controller: "you",
            cardType: "creature",
            source: "trigger_subject",
            relation: "self",
          },
          powerDelta: 1,
          healthDelta: 1,
        },
      ],
    },
  ],
};
