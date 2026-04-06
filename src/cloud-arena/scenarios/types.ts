import type { CardDefinitionId, CardEnemyConfig } from "../core/types.js";

export type CloudArenaDeckPresetId =
  | "mixed_guardian";

export type CloudArenaEnemyPresetId =
  | "long_battle_demon";

export type CloudArenaScenarioId =
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
