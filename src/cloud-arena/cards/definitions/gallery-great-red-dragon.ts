import type { CardDefinition } from "../../core/types.js";

export const galleryGreatRedDragonCardDefinition: CardDefinition = {
  id: "gallery_great_red_dragon",
  name: "Great Red Dragon",
  cardTypes: ["creature"],
  cost: 6,
  display: {
    title: "Dragon of the Sun",
    subtitle: "Legendary Creature - Dragon",
    frameTone: "split-red-black",
    manaCost: "{6}",
    artist: "William Blake",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/William_Blake_-_The_Great_Red_Dragon_and_the_Woman_Clothed_with_the_Sun_-_Google_Art_Project.jpg/960px-William_Blake_-_The_Great_Red_Dragon_and_the_Woman_Clothed_with_the_Sun_-_Google_Art_Project.jpg",
    imageAlt: "William Blake's Great Red Dragon",
    flavorText: "Its wings darken the light before the flame even speaks.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "039",
    footerStat: "6/6",
  },
  subtypes: ["Dragon"],
  onPlay: [],
  power: 6,
  health: 6,
  keywords: ["menace", "deathtouch"],
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "deal_damage",
          target: "enemy",
          amount: { type: "constant", value: 2 },
        },
      ],
    },
    {
      id: "gallery_great_red_dragon_scorch",
      kind: "activated",
      activation: { type: "action", actionId: "scorch" },
      costs: [
        { type: "energy", amount: 2 },
        { type: "tap" },
      ],
      effects: [
        {
          type: "deal_damage",
          target: "enemy",
          amount: { type: "constant", value: 3 },
        },
      ],
    },
  ],
};
