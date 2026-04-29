import type { CardDefinition } from "../../core/types.js";

export const judgmentBladeCardDefinition: CardDefinition = {
  id: "judgment_blade",
  name: "Sword of Judgment",
  cardTypes: ["artifact"],
  cost: 3,
  display: {
    name: "Sword of Judgment",
    frameTone: "colorless",
    imagePath: "card_0027_let_there_be_light.png",
    imageAlt: "A blade of bright judgment poised above the battlefield",
    flavorText: "Where it falls, every enemy line feels the verdict at once.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "018",
  },
  subtypes: ["Equipment"],
  onPlay: [],
  power: 1,
  health: 1,
  attackAllEnemyPermanents: true,
};
