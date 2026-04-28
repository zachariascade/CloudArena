import type { EnemyCardDefinition } from "../../core/types.js";

function createSlashCard(
  id: string,
  name: string,
  attackPowerMultiplier: number,
  attackTimes = 1,
): EnemyCardDefinition {
  return {
    id,
    name,
    effects: [
      {
        attackPowerMultiplier,
        attackTimes: attackTimes > 1 ? attackTimes : undefined,
        target: "player",
      },
    ],
  };
}

export function singleSlash(): EnemyCardDefinition {
  return createSlashCard("single_slash", "Single Slash", 1);
}

export function doubleSlash(): EnemyCardDefinition {
  return createSlashCard("double_slash", "Double Slash", 2);
}

export function tripleSlash(): EnemyCardDefinition {
  return createSlashCard("triple_slash", "Triple Slash", 3);
}

export function crossSlash(): EnemyCardDefinition {
  return createSlashCard("cross_slash", "Cross Slash", 1, 2);
}

export function multiSlash(): EnemyCardDefinition {
  return createSlashCard("multi_slash", "Multi-Slash", 2, 2);
}

export function gainBlockEqualToBasePower(): EnemyCardDefinition {
  return {
    id: "gain_block_equal_base_power",
    name: "Gain Block Equal To Base Power",
    effects: [
      {
        blockPowerMultiplier: 1,
        target: "enemy",
      },
    ],
  };
}

export function gainBlockEqualToHealth(): EnemyCardDefinition {
  return {
    id: "gain_block_equal_health",
    name: "Gain Block Equal To Health",
    effects: [
      {
        blockHealthMultiplier: 1,
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

export function weakenAllPermanents(amount = 1): EnemyCardDefinition {
  return {
    id: `weaken_all_permanents_${amount}`,
    name: amount === 1 ? "Weaken All Permanents" : `Weaken All Permanents ${amount}`,
    effects: [
      {
        target: "enemy",
        powerDeltaAllPermanents: -amount,
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

export function demonPierce(): EnemyCardDefinition {
  return {
    id: "enemy_demon_pierce",
    name: "Pierce",
    effects: [
      {
        attackPowerMultiplier: 1,
        bypassBlock: true,
        target: "player",
      },
    ],
  };
}

export function attackOnceWithBasePower(): EnemyCardDefinition {
  return singleSlash();
}

export function attackTwiceWithBasePower(): EnemyCardDefinition {
  return crossSlash();
}
