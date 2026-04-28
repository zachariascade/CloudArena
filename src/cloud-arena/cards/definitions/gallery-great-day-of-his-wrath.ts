import type { CardDefinition } from "../../core/types.js";

export const galleryGreatDayOfHisWrathCardDefinition: CardDefinition = {
  id: "gallery_great_day_of_his_wrath",
  name: "The Great Day of His Wrath",
  cardTypes: ["sorcery"],
  cost: 3,
  display: {
    title: "Day of Wrath",
    subtitle: "Sorcery",
    frameTone: "split-black-red",
    manaCost: "{3}",
    artist: "John Martin",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg/960px-John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg",
    imageAlt: "John Martin's The Great Day of His Wrath",
    flavorText: "When the sky breaks, everything below it must answer for its shape.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "038",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "deal_damage",
      target: "enemy",
      amount: { type: "constant", value: 4 },
    },
    {
      type: "deal_damage",
      target: {
        zone: "battlefield",
        controller: "opponent",
        cardType: "permanent",
      },
      amount: { type: "constant", value: 3 },
    },
    {
      type: "gain_block",
      target: "player",
      amount: { type: "constant", value: 4 },
    },
  ],
};
