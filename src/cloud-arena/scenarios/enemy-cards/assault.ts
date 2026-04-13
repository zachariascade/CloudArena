import type { DamageOverflowPolicy, EnemyCardDefinition } from "../../core/types.js";

function getAssaultId(
  attackAmount: number,
  attackTimes: number,
  blockAmount: number,
): string {
  return attackTimes > 1
    ? `assault_${attackAmount}_x${attackTimes}_block_${blockAmount}`
    : `assault_${attackAmount}_block_${blockAmount}`;
}

function getAssaultName(
  attackAmount: number,
  attackTimes: number,
  blockAmount: number,
): string {
  return attackTimes > 1
    ? `Assault ${attackAmount} x${attackTimes} + ${blockAmount} block`
    : `Assault ${attackAmount} + ${blockAmount} block`;
}

export function assault(
  attackAmount: number,
  attackTimes: number,
  blockAmount: number,
  overflowPolicy?: DamageOverflowPolicy,
): EnemyCardDefinition {
  return {
    id: getAssaultId(attackAmount, attackTimes, blockAmount),
    name: getAssaultName(attackAmount, attackTimes, blockAmount),
    effects: [
      {
        attackAmount,
        attackTimes: attackTimes > 1 ? attackTimes : undefined,
        overflowPolicy,
        target: "player",
      },
      {
        blockAmount,
        target: "enemy",
      },
    ],
  };
}
