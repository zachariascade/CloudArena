import type { CardDefinition } from "../../core/types.js";

export const gallerySodomAndGomorrahCardDefinition: CardDefinition = {
  id: "gallery_sodom_and_gomorrah",
  name: "Sodom and Gomorrah",
  cardTypes: ["sorcery"],
  cost: 3,
  display: {
    title: "Fire on the Cities",
    frameTone: "split-black-red",
    artist: "John Martin",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/John_Martin_-_Sodom_and_Gomorrah.jpg/960px-John_Martin_-_Sodom_and_Gomorrah.jpg",
    imageAlt: "John Martin's Sodom and Gomorrah",
    flavorText: "What is built without restraint can vanish without warning.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "049",
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
      amount: { type: "constant", value: 3 },
    },
  ],
};
