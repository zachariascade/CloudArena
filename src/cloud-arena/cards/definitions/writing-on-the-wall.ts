import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const writingOnTheWallCardDefinition: CardDefinition = {
  id: "writing_on_the_wall",
  name: "Writing on the Wall, Doom Foretold",
  cardTypes: ["enchantment", "saga"],
  cost: 2,
  manaCost: "{2}{W}",

  cardSet: CARD_SETS.daniel,
  rarity: "rare",
  display: {
    name: "Writing on the Wall, Doom Foretold",
    title: null,
    frameTone: "split-black-red",
    artist: "John Martin",
    imagePath:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/John_Martin_-_Belshazzar%27s_Feast_-_Google_Art_Project.jpg/960px-John_Martin_-_Belshazzar%27s_Feast_-_Google_Art_Project.jpg",
    imageAlt: "John Martin's Belshazzar's Feast",
    flavorText: "A warning can arrive before the sword.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "036",
  },
  onPlay: [],
  power: 1,
  health: 5,
  saga: {
    chapters: [
      {
        chapter: 1,
        label: "I",
        effects: [
          {
            type: "gain_block",
            target: "player",
            amount: { type: "constant", value: 5 },
          },
        ],
      },
      {
        chapter: 2,
        label: "II",
        effects: [
          {
            type: "deal_damage",
            target: {
              zone: "enemy_battlefield",
              controller: "opponent",
              cardType: "permanent",
            },
            amount: { type: "constant", value: 4 },
            targeting: {
              prompt: "Choose an enemy marked by the writing",
            },
          },
        ],
      },
      {
        chapter: 3,
        label: "III",
        effects: [
          {
            type: "draw_card",
            target: "player",
            amount: { type: "constant", value: 1 },
          },
        ],
      },
    ],
  },
  abilities: [],
};
