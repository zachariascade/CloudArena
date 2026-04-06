import type { EnemyCardDefinition } from "../../core/types.js";

function getStrikeId(attackAmount: number, attackTimes: number): string {
  return attackTimes > 1
    ? `strike_${attackAmount}_x${attackTimes}`
    : `strike_${attackAmount}`;
}

function getStrikeName(attackAmount: number, attackTimes: number): string {
  return attackTimes > 1
    ? `Strike ${attackAmount} x${attackTimes}`
    : `Strike ${attackAmount}`;
}

export function strike(
  attackAmount: number,
  attackTimes = 1,
): EnemyCardDefinition {
  return {
    id: getStrikeId(attackAmount, attackTimes),
    name: getStrikeName(attackAmount, attackTimes),
    effects: [
      {
        attackAmount,
        attackTimes: attackTimes > 1 ? attackTimes : undefined,
        target: "player",
      },
    ],
  };
}
