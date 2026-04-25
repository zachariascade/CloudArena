import type { CardDefinition } from "../../core/types.js";

function createSlashCardDefinition(
  id: string,
  name: string,
  imagePath: string,
  collectorNumber: string,
): CardDefinition {
  return {
    id,
    name,
    cardTypes: ["instant"],
    cost: 0,
    display: {
      title: name,
      subtitle: "Enemy - Slash",
      frameTone: "split-black-red",
      manaCost: "{0}",
      imagePath,
      imageAlt: `${name} art showing a blade slash through the frame`,
      footerCode: "ARE",
      footerCredit: "Cloud Arena",
      collectorNumber,
    },
    onPlay: [],
    playableInPlayerDecks: false,
  };
}

export const enemySingleSlashCardDefinition = createSlashCardDefinition(
  "single_slash",
  "Single Slash",
  "single-slash.png",
  "E06",
);

export const enemyDoubleSlashCardDefinition = createSlashCardDefinition(
  "double_slash",
  "Double Slash",
  "double-slash.png",
  "E07",
);

export const enemyTripleSlashCardDefinition = createSlashCardDefinition(
  "triple_slash",
  "Triple Slash",
  "triple-slash.png",
  "E08",
);

export const enemyCrossSlashCardDefinition = createSlashCardDefinition(
  "cross_slash",
  "Cross Slash",
  "cross-slash.png",
  "E09",
);

export const enemyMultiSlashCardDefinition = createSlashCardDefinition(
  "multi_slash",
  "Multi-Slash",
  "multi-slash.png",
  "E10",
);
