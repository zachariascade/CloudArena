import type { CardDefinition } from "../../core/types.js";

export const anointedBannerCardDefinition: CardDefinition = {
  id: "anointed_banner",
  name: "Ark of the Covenant",
  cardTypes: ["artifact"],
  cost: 2,
  display: {
    name: "Ark of the Covenant",
    frameTone: "white",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg/960px-The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg",
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
