import type { CardSet } from "../core/types.js";

export const CARD_SETS = {
  none: {
    id: "none",
    name: "None",
  },
  exodus: {
    id: "exodus",
    name: "Exodus",
  },
  job: {
    id: "job",
    name: "Job",
  },
  gospels: {
    id: "gospels",
    name: "Gospels",
  },
  genesis: {
    id: "genesis",
    name: "Genesis",
  },
  daniel: {
    id: "daniel",
    name: "Daniel",
  },
} as const satisfies Record<string, CardSet>;
