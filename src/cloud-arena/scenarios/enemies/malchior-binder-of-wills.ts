import type { EnemyCardDefinition } from "../../core/types.js";
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

const crushingEdict: EnemyCardDefinition = {
  id: "malchior_crushing_edict",
  name: "Crushing Edict",
  effects: [
    {
      attackPowerMultiplier: 2,
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

const twinSubjugation: EnemyCardDefinition = {
  id: "malchior_twin_subjugation",
  name: "Twin Subjugation",
  effects: [
    {
      attackPowerMultiplier: 2,
      attackTimes: 2,
      target: "player",
    },
  ],
};

export const malchiorBinderOfWillsEnemyPreset: CloudArenaEnemyPreset = {
  id: "malchior_binder_of_wills",
  name: "Malchior, Binder of Wills",
  health: 24,
  basePower: 4,
  leaderDefinitionId: "enemy_malchior",
  cards: [
    eldritchAegis,
    siphonResolve,
    crushingEdict,
    chainOfCommand,
    twinSubjugation,
  ],
};
