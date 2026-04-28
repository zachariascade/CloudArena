import type { CardDefinition } from "../../core/types.js";

export const galleryDanielInTheLionsDenCardDefinition: CardDefinition = {
  id: "gallery_daniel_in_the_lions_den",
  name: "Daniel in the Lions' Den",
  cardTypes: ["enchantment"],
  cost: 3,
  display: {
    title: "Daniel in the Lions' Den",
    subtitle: "Legendary Enchantment",
    frameTone: "white",
    manaCost: "{3}",
    artist: "Gustave Doré",
    imagePath:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/131.Daniel_in_the_Lions%27_Den.jpg/960px-131.Daniel_in_the_Lions%27_Den.jpg",
    imageAlt: "Gustave Doré's Daniel in the Lions' Den",
    flavorText: "Faith stands calmly where hunger expects a feast.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "063",
  },
  onPlay: [],
  power: 0,
  health: 5,
  abilities: [
    {
      kind: "triggered",
      trigger: {
        event: "permanent_blocked",
        selector: {
          zone: "battlefield",
          controller: "you",
          cardType: "creature",
        },
      },
      conditions: [
        {
          type: "threshold",
          selector: {
            zone: "battlefield",
            controller: "you",
            cardType: "creature",
            defending: true,
          },
          op: "==",
          value: 1,
        },
      ],
      effects: [
        {
          type: "grant_keyword",
          target: {
            zone: "battlefield",
            controller: "you",
            cardType: "creature",
            relation: "self",
            source: "trigger_subject",
          },
          keyword: "indestructible",
          duration: "end_of_turn",
        },
      ],
    },
  ],
};
