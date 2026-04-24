import type { CardDefinitionId, CardEnemyConfig } from "../core/types.js";

export type CloudArenaDeckPresetId =
  | "master_deck"
  | "wide_angels"
  | "tall_creatures"
  | "mixed_guardian";

export type CloudArenaEnemyPresetId =
  | "bruiser_demon"
  | "demon_pack"
  | "lake_of_ice"
  | "grunt_demon"
  | "imp_caller"
  | "malchior_binder_of_wills"
  | "long_battle_demon"
  | "warder_demon";

export type CloudArenaScenarioId =
  | "demon_pack"
  | "lake_of_ice"
  | "imp_caller"
  | "malchior_binder_of_wills";

export type CloudArenaDeckPreset = {
  id: CloudArenaDeckPresetId;
  label: string;
  cards: CardDefinitionId[];
};

export type CloudArenaEnemyPreset = {
  id: CloudArenaEnemyPresetId;
  name: string;
  health: number;
  basePower: number;
  cards: CardEnemyConfig["cards"];
  leaderDefinitionId?: CardDefinitionId;
  startingTokens?: CardDefinitionId[];
  startingPermanents?: CardDefinitionId[];
};

export type CloudArenaScenarioPreset = {
  id: CloudArenaScenarioId;
  label: string;
  notes: string;
  playerHealth: number;
  deck: CloudArenaDeckPreset["cards"];
  enemy: CardEnemyConfig;
  recommendedMaxSteps: number;
};
