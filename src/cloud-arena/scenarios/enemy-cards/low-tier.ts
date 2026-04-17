import type { EnemyCardDefinition } from "../../core/types.js";

function createCardId(prefix: string): string {
  return prefix;
}

export function attackOnceWithBasePower(): EnemyCardDefinition {
  return {
    id: createCardId("attack_once_base_power"),
    name: "Attack Once With Base Power",
    effects: [
      {
        attackPowerMultiplier: 1,
        target: "player",
      },
    ],
  };
}

export function attackTwiceWithBasePower(): EnemyCardDefinition {
  return {
    id: createCardId("attack_twice_base_power"),
    name: "Attack Twice With Base Power",
    effects: [
      {
        attackPowerMultiplier: 1,
        attackTimes: 2,
        target: "player",
      },
    ],
  };
}

export function gainBlockEqualToBasePower(): EnemyCardDefinition {
  return {
    id: createCardId("gain_block_equal_base_power"),
    name: "Gain Block Equal To Base Power",
    effects: [
      {
        blockPowerMultiplier: 1,
        target: "enemy",
      },
    ],
  };
}

export function gainPower(amount = 1): EnemyCardDefinition {
  return {
    id: `gain_power_${amount}`,
    name: amount === 1 ? "Gain Power" : `Gain ${amount} Power`,
    effects: [
      {
        powerDelta: amount,
        target: "enemy",
      },
    ],
  };
}

export function spawnSimpleToken(tokenCardId = "token_imp", count = 1): EnemyCardDefinition {
  return {
    id: `${tokenCardId}_spawn_${count}`,
    name: count === 1 ? `Spawn ${tokenCardId}` : `Spawn ${count} ${tokenCardId}s`,
    effects: [
      {
        spawnCardId: tokenCardId,
        spawnCount: count,
        target: "enemy",
      },
    ],
  };
}
