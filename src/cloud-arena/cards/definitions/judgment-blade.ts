import type { CardDefinition } from "../../core/types.js";

export const judgmentBladeCardDefinition: CardDefinition = {
  id: "judgment_blade",
  name: "Sword of Judgment",
  cardTypes: ["artifact"],
  cost: 3,
  display: {
    name: "Sword of Judgment",
    frameTone: "colorless",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg/960px-The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg",
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
