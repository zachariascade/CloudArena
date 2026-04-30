import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const meneMeneTekelUpharsinCardDefinition: CardDefinition = {
  id: "mene_mene_tekel_upharsin",
  name: "Mene Mene Tekel Upharsin",
  cardTypes: ["sorcery"],
  cost: 4,

  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: {
    name: "Mene Mene Tekel Upharsin",
    title: "Belshazzar's Feast",
    frameTone: "split-black-red",
    artist: "John Martin",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Belshazzar's%20Feast.jpg",
    imageAlt: "John Martin's Belshazzar's Feast",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "035",
  },
  onPlay: [],
  abilities: [],
};
