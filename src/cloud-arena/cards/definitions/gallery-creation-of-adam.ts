import type { CardDefinition } from "../../core/types.js";

export const galleryCreationOfAdamCardDefinition: CardDefinition = {
  id: "gallery_creation_of_adam",
  name: "Creation of Adam",
  cardTypes: ["enchantment"],
  cost: 3,
  display: {
    title: "Spark of Life",
    subtitle: "Legendary Enchantment",
    frameTone: "split-white-blue",
    manaCost: "{3}",
    artist: "Michelangelo",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
    imageAlt: "Michelangelo's Creation of Adam",
    flavorText: "One touch can turn waiting into motion.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "036",
    footerStat: "0/4",
  },
  onPlay: [],
  power: 0,
  health: 4,
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 4 },
        },
        {
          type: "gain_energy",
          target: "player",
          amount: { type: "constant", value: 1 },
        },
      ],
    },
    {
      id: "gallery_creation_of_adam_give_form",
      kind: "activated",
      activation: { type: "action", actionId: "give_form" },
      costs: [
        { type: "energy", amount: 1 },
        { type: "tap" },
      ],
      targeting: {
        prompt: "Choose a creature you control",
      },
      effects: [
        {
          type: "add_counter",
          target: {
            zone: "battlefield",
            controller: "you",
            cardType: "creature",
          },
          powerDelta: 1,
          healthDelta: 1,
          targeting: {
            prompt: "Choose a creature to inspire",
          },
        },
      ],
    },
  ],
};
