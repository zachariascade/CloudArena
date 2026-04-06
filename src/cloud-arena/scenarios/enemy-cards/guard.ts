import type { EnemyCardDefinition } from "../../core/types.js";

export function guard(blockAmount: number): EnemyCardDefinition {
  return {
    id: `guard_${blockAmount}`,
    name: `Guard ${blockAmount}`,
    effects: [
      {
        blockAmount,
        target: "enemy",
      },
    ],
  };
}
