import type { CardDefinition } from "../../core/types.js";

export const galleryJoshuaCommandingTheSunToStandStillUponGibeonCardDefinition: CardDefinition = {
  id: "gallery_joshua_commanding_the_sun_to_stand_still_upon_gibeon",
  name: "Joshua Commanding the Sun to Stand Still upon Gibeon",
  cardTypes: ["sorcery"],
  cost: 3,
  display: {
    name: "Joshua Commanding the Sun to Stand Still upon Gibeon",
    title: "The Sun Stands Still",
    frameTone: "white",
    artist: "John Martin",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Joshua_Commanding_the_Sun_to_Stand_Still_upon_Gibeon_%281816%29_John_Martin_-_NGA_2004.64.1.jpg/960px-Joshua_Commanding_the_Sun_to_Stand_Still_upon_Gibeon_%281816%29_John_Martin_-_NGA_2004.64.1.jpg",
    imageAlt: "John Martin's Joshua Commanding the Sun to Stand Still upon Gibeon",
    flavorText: "When time hesitates, the faithful can cross the ground it leaves behind.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "041",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "stun",
      target: "enemy",
    },
    {
      type: "deal_damage",
      target: "enemy",
      amount: { type: "constant", value: 3 },
    },
    {
      type: "gain_block",
      target: "player",
      amount: { type: "constant", value: 4 },
    },
  ],
};
