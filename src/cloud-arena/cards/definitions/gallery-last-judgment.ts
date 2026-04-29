import type { CardDefinition } from "../../core/types.js";

export const galleryLastJudgmentCardDefinition: CardDefinition = {
  id: "gallery_last_judgment",
  name: "The Last Judgment",
  cardTypes: ["sorcery"],
  cost: 3,
  display: {
    title: "Final Reckoning",
    frameTone: "split-black-red",
    manaCost: "{3}",
    artist: "Hieronymus Bosch",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Hieronymus_Bosch_-_The_Last_Judgement.jpg/960px-Hieronymus_Bosch_-_The_Last_Judgement.jpg",
    imageAlt: "Hieronymus Bosch's The Last Judgment",
    flavorText: "Every hidden thing eventually finds the light it tried to evade.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "042",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "deal_damage",
      target: "enemy",
      amount: { type: "constant", value: 5 },
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
