import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";
import { danielTreeDisplay } from "./daniel-display.js";

export const dreamOfTheTreeCardDefinition: CardDefinition = {
  id: "dream_of_the_tree",
  name: "The Great Tree Humbled",
  cardTypes: ["enchantment", "saga"],
  cost: 3,
  manaCost: "{3}{G}",

  cardSet: CARD_SETS.daniel,
  rarity: "rare",
  display: danielTreeDisplay,
  onPlay: [],
  power: 1,
  health: 7,
  saga: {
    chapters: [
      {
        chapter: 1,
        label: "I",
        title: "The Tree Reaches the Heavens",
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
        title: "A Watcher Cries Aloud",
        effects: [
          {
            type: "add_counter",
            target: "self",
            powerDelta: 1,
            healthDelta: 1,
          },
        ],
      },
      {
        chapter: 3,
        label: "III",
        title: "Cut Down the Tree",
        effects: [
          {
            type: "deal_damage",
            target: {
              zone: "enemy_battlefield",
              controller: "opponent",
              cardType: "permanent",
            },
            amount: { type: "constant", value: 5 },
            targeting: {
              prompt: "Choose a proud enemy to humble",
            },
          },
        ],
      },
      {
        chapter: 4,
        label: "IV",
        title: "Until Heaven Rules",
        effects: [
          {
            type: "draw_card",
            target: "player",
            amount: { type: "constant", value: 1 },
          },
          {
            type: "gain_energy",
            target: "player",
            amount: { type: "constant", value: 1 },
          },
        ],
      },
    ],
  },
  abilities: [],
};
