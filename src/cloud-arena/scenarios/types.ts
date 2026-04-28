import type {
  BehaviorEnemyConfig,
  CardDefinitionId,
  CardEnemyConfig,
} from "../core/types.js";

export type CloudArenaDeckPresetId =
  | "master_deck"
  | "starter_deck"
  | "counters"
  | "tall_creatures"
  | "mixed_guardian";

export type CloudArenaEnemyPresetId =
  | "bruiser_demon"
  | "demon_pack"
  | "fallen_angel_cabanel"
  | "satan_as_the_fallen_angel"
  | "satan_exulting_over_eve"
  | "satan_calling_up_his_legions"
  | "number_of_the_beast_666"
  | "saturn_devouring_his_son_goya"
  | "medusa_caravaggio"
  | "great_red_dragon_beast_from_sea"
  | "great_red_dragon_dragon_of_the_sun"
  | "garden_of_earthly_delights_hell_detail"
  | "triumph_of_death"
  | "satan_in_cocytus"
  | "lake_of_ice"
  | "grunt_demon"
  | "imp_caller"
  | "malchior_binder_of_wills"
  | "rebel_angel"
  | "long_battle_demon"
  | "warder_demon"
  | "viper_shade";

export type CloudArenaScenarioId =
  | "demon_pack"
  | "lake_of_ice"
  | "imp_caller"
  | "malchior_binder_of_wills"
  | "rebel_angel"
  | "viper_shade";

export type CloudArenaDeckPreset = {
  id: CloudArenaDeckPresetId;
  label: string;
  cards: CardDefinitionId[];
};

export type CloudArenaScenarioEnemy = {
  definitionId: CardDefinitionId;
  name: string;
  health: number;
  basePower: number;
  cards?: CardEnemyConfig["cards"];
  behavior?: BehaviorEnemyConfig["behavior"];
  startingTokens?: CardDefinitionId[];
};

export type CloudArenaEnemyPreset = CloudArenaScenarioEnemy & {
  id: CloudArenaEnemyPresetId;
  cards: CardEnemyConfig["cards"];
};

export type CloudArenaScenarioPreset = {
  id: CloudArenaScenarioId;
  label: string;
  notes: string;
  playerHealth: number;
  deck: CloudArenaDeckPreset["cards"];
  enemies: CloudArenaScenarioEnemy[];
  recommendedMaxSteps: number;
};
