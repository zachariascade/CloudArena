import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const mannaFromHeavenCardDefinition: CardDefinition = {
  id: "manna_from_heaven",
  name: "Manna from Heaven",
  cardTypes: ["sorcery"],
  cost: 1,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
  spellEffects: [
    {
      type: "add_counter",
      target: {
        zone: "battlefield",
        cardType: "permanent",
      },
      healthDelta: 3,
    },
  ],
};
