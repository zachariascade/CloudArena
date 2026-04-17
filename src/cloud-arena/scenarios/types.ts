import type { CardDefinitionId, CardEnemyConfig } from "../core/types.js";

export type CloudArenaDeckPresetId =
  | "mixed_guardian";

export type CloudArenaEnemyPresetId =
  | "bruiser_demon"
  | "grunt_demon"
  | "imp_caller"
  | "long_battle_demon"
  | "warder_demon";

export type CloudArenaScenarioId =
  | "grunt_demon"
  | "imp_caller"
  | "mixed_guardian";

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
  startingTokens?: CardDefinitionId[];
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
