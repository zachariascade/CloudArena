import type { DefenderRecoveryPolicy } from "./types.js";

export const LEAN_V1_HAND_SIZE = 5;
export const LEAN_V1_STARTING_PLAYER_HEALTH = 20;
export const LEAN_V1_DEFAULT_TURN_ENERGY = 3;
export const LEAN_V1_CREATURE_SLOT_COUNT = 5;
export const LEAN_V1_NON_CREATURE_SLOT_COUNT = 5;
export const LEAN_V1_BOARD_SLOT_COUNT =
  LEAN_V1_CREATURE_SLOT_COUNT + LEAN_V1_NON_CREATURE_SLOT_COUNT;
export const LEAN_V1_DEFAULT_RECOVERY_POLICY: DefenderRecoveryPolicy = "none";
