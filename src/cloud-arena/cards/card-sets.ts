import type { CardSet } from "../core/types.js";

export const CARD_SETS = {
  daniel: {
    id: "daniel",
    name: "Daniel",
  },
} as const satisfies Record<string, CardSet>;
