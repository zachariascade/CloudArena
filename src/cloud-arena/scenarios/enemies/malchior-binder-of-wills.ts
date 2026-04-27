import type { EnemyCardDefinition } from "../../core/types.js";
import { doubleSlash, multiSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

const eldritchAegis: EnemyCardDefinition = {
  id: "malchior_eldritch_aegis",
  name: "Eldritch Aegis",
  effects: [
    {
      attackPowerMultiplier: 1,
      target: "player",
    },
    {
      blockAmount: 10,
      target: "enemy",
    },
  ],
};

const siphonResolve: EnemyCardDefinition = {
  id: "malchior_siphon_resolve",
  name: "Siphon Resolve",
  effects: [
    {
      energyDelta: -1,
      target: "player",
    },
  ],
};

const chainOfCommand: EnemyCardDefinition = {
  id: "malchior_chain_of_command",
  name: "Chain of Command",
  effects: [
    {
      powerDeltaTargetPermanents: -1,
      target: "player",
    },
  ],
};

export const malchiorBinderOfWillsEnemyPreset: CloudArenaEnemyPreset = {
  id: "malchior_binder_of_wills",
  definitionId: "enemy_malchior",
  name: "Malchior, Binder of Wills",
  health: 24,
  basePower: 4,
  cards: [
    eldritchAegis,
    siphonResolve,
    doubleSlash(),
    chainOfCommand,
    multiSlash(),
  ],
};
