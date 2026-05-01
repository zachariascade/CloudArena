import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";
import { danielStatueDisplay } from "./daniel-display.js";

export const dreamOfTheStatueCardDefinition: CardDefinition = {
  id: "dream_of_the_statue",
  name: "Many Metal Statue, Dream of Empires",
  cardTypes: ["enchantment", "saga"],
  cost: 4,
  manaCost: "{4}{B}",

  cardSet: CARD_SETS.daniel,
  rarity: "rare",
  display: danielStatueDisplay,
  onPlay: [],
  power: 2,
  health: 6,
  saga: {
    chapters: [
      {
        chapter: 1,
        label: "I",
        title: "Head of Gold: Babylon",
        effects: [
          {
            type: "gain_energy",
            target: "player",
            amount: { type: "constant", value: 1 },
          },
        ],
      },
      {
        chapter: 2,
        label: "II",
        title: "Chest & Arms of Silver: Medo-Persia",
        effects: [
          {
            type: "gain_block",
            target: "player",
            amount: { type: "constant", value: 4 },
          },
        ],
      },
      {
        chapter: 3,
        label: "III",
        title: "Belly & Thighs of Bronze: Greece",
        effects: [
          {
            type: "deal_damage",
            target: {
              zone: "enemy_battlefield",
              controller: "opponent",
              cardType: "permanent",
            },
            amount: { type: "constant", value: 3 },
            targeting: {
              prompt: "Choose an empire to cast down",
            },
          },
        ],
      },
      {
        chapter: 4,
        label: "IV",
        title: "Legs of Iron & Feet of Iron/Clay: Rome",
        effects: [
          {
            type: "gain_block",
            target: "player",
            amount: { type: "constant", value: 6 },
          },
        ],
      },
      {
        chapter: 5,
        label: "V",
        title: "The Stone: The Eternal Kingdom of God",
        effects: [
          {
            type: "deal_damage",
            target: "enemy",
            amount: { type: "constant", value: 7 },
          },
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
