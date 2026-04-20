import type { CardDefinition } from "../../core/types.js";

export const anointedBannerCardDefinition: CardDefinition = {
  id: "anointed_banner",
  name: "Anointed Banner",
  cardTypes: ["artifact"],
  cost: 2,
  display: {
    title: "Consecrated Standard",
    subtitle: "Artifact",
    frameTone: "white",
    manaCost: "{2}",
    imagePath: "card_0057_garments_of_skin.jpg",
    imageAlt: "A consecrated banner lifted before the faithful",
    flavorText: "Raised high, it turns a gathered host into a sanctified advance.",
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
