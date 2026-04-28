import type { CardDefinition } from "../../core/types.js";

export const galleryJacobWrestlesWithTheAngelCardDefinition: CardDefinition = {
  id: "gallery_jacob_wrestles_with_the_angel",
  name: "Jacob Wrestles with the Angel",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    title: "Wrestler at the Ford",
    subtitle: "Legendary Creature - Human Warrior",
    frameTone: "split-white-green",
    manaCost: "{3}",
    artist: "Gustave Doré",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/024.Jacob_Wrestles_with_the_Angel.jpg/960px-024.Jacob_Wrestles_with_the_Angel.jpg",
    imageAlt: "Gustave Doré's Jacob Wrestles with the Angel",
    flavorText: "Blessing and struggle often arrive wearing the same face.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "040",
    footerStat: "3/5",
  },
  subtypes: ["Human", "Warrior"],
  onPlay: [],
  power: 3,
  health: 5,
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 3 },
        },
      ],
    },
    {
      id: "gallery_jacob_wrestles_with_the_angel_hold_fast",
      kind: "activated",
      activation: { type: "action", actionId: "hold_fast" },
      costs: [
        { type: "energy", amount: 1 },
        { type: "tap" },
      ],
      effects: [
        {
          type: "add_counter",
          target: "self",
          powerDelta: 1,
          healthDelta: 1,
        },
        {
          type: "restore_health",
          target: "self",
        },
      ],
    },
  ],
};
