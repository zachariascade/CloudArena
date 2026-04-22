import type { CardDefinition } from "../../core/types.js";

export const graveyardHymnCardDefinition: CardDefinition = {
  id: "graveyard_hymn",
  name: "Song of the Dry Bones",
  cardTypes: ["creature"],
  cost: 2,
  display: {
    title: "Song of the Dry Bones",
    subtitle: "Creature - Angel",
    frameTone: "white",
    manaCost: "{2}",
    imagePath: "https://commons.wikimedia.org/wiki/Special:FilePath/Quinten%20Massys%20Vision%20des%20Propheten%20Ezechiels.jpg",
    imageAlt: "Quinten Massys's Vision of the Prophet Ezekiel",
    flavorText: "Even in ruin, a faithful voice can make the whole field rise again.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "015",
    footerStat: "2/2",
  },
  subtypes: ["Angel"],
  onPlay: [],
  power: 2,
  health: 2,
  abilities: [
    {
      kind: "triggered",
      trigger: {
        event: "permanent_died",
        selector: {
          relation: "self",
        },
      },
        effects: [
          {
            type: "add_counter",
            target: {
              zone: "battlefield",
              cardType: "creature",
            },
            powerDelta: 1,
            healthDelta: 1,
          },
      ],
    },
  ],
};
