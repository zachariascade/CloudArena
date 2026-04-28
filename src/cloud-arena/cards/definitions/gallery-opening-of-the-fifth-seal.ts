import type { CardDefinition } from "../../core/types.js";

export const galleryOpeningOfTheFifthSealCardDefinition: CardDefinition = {
  id: "gallery_opening_of_the_fifth_seal",
  name: "The Opening of the Fifth Seal",
  cardTypes: ["sorcery"],
  cost: 3,
  display: {
    title: "The Unsealed Witnesses",
    subtitle: "Sorcery",
    frameTone: "white",
    manaCost: "{3}",
    artist: "El Greco",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/El_Greco_-_The_Opening_of_the_Fifth_Seal_%28The_Vision_of_St_John%29_-_WGA10637.jpg/960px-El_Greco_-_The_Opening_of_the_Fifth_Seal_%28The_Vision_of_St_John%29_-_WGA10637.jpg",
    imageAlt: "El Greco's The Opening of the Fifth Seal",
    flavorText: "The martyrs rise because the story is not finished with them yet.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "044",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "return_from_graveyard",
      selector: {
        zone: "graveyard",
        controller: "you",
        cardType: "creature",
      },
      targeting: {
        prompt: "Choose a creature card from your graveyard",
      },
    },
    {
      type: "gain_block",
      target: "player",
      amount: { type: "constant", value: 2 },
    },
  ],
};
