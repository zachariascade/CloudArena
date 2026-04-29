import type { CardDefinition } from "../../core/types.js";

export const galleryBelshazzarsFeastCardDefinition: CardDefinition = {
  id: "gallery_belshazzars_feast",
  name: "Belshazzar's Feast",
  cardTypes: ["sorcery"],
  cost: 3,
  display: {
    name: "Belshazzar's Feast",
    title: "Banquet of Empty Crowns",
    frameTone: "split-black-red",
    artist: "John Martin",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/John_Martin_-_Belshazzar%27s_Feast_-_Google_Art_Project.jpg/960px-John_Martin_-_Belshazzar%27s_Feast_-_Google_Art_Project.jpg",
    imageAlt: "John Martin's Belshazzar's Feast",
    flavorText: "A lavish table can still be a warning if the room is listening.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "034",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "deal_damage",
      target: "enemy",
      amount: { type: "constant", value: 4 },
    },
    {
      type: "gain_block",
      target: "player",
      amount: { type: "constant", value: 4 },
    },
  ],
};
