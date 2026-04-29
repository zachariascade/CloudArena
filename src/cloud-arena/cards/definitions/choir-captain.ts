import type { CardDefinition } from "../../core/types.js";

export const choirCaptainCardDefinition: CardDefinition = {
  id: "choir_captain",
  name: "Choir Captain",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    title: "Voice Above the Host",
    frameTone: "white",
    manaCost: "{3}",
    imagePath: "classics/card_0055_image_of_god.jpg",
    imageAlt: "An angelic captain calling ranks into formation",
    flavorText: "Its song counts every wing and turns presence into power.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "007",
  },
  subtypes: ["Angel"],
  keywords: ["refresh"],
  onPlay: [],
  power: 2,
  health: 3,
  abilities: [
    {
      kind: "static",
      modifier: {
        target: "self",
        stat: "power",
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
