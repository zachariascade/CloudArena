import { formatEnemyIntent } from "./enemy-intent.js";
import type { BattleState } from "./types.js";

export type BattleSummary = {
  turnNumber: number;
  phase: BattleState["phase"];
  player: {
    health: number;
    maxHealth: number;
    block: number;
    energy: number;
    handCount: number;
    discardCount: number;
    graveyardCount: number;
  };
  enemy: {
    name: string;
    health: number;
    maxHealth: number;
    block: number;
    intent: string;
  };
  battlefield: string[];
  blockingQueue: string[];
};

export function buildBattleSummary(state: BattleState): BattleSummary {
  return {
    turnNumber: state.turnNumber,
    phase: state.phase,
    player: {
      health: state.player.health,
      maxHealth: state.player.maxHealth,
      block: state.player.block,
      energy: state.player.energy,
      handCount: state.player.hand.length,
      discardCount: state.player.discardPile.length,
      graveyardCount: state.player.graveyard.length,
    },
    enemy: {
      name: state.enemy.name,
      health: state.enemy.health,
      maxHealth: state.enemy.maxHealth,
      block: state.enemy.block,
      intent: formatEnemyIntent(state.enemy.intent),
    },
    battlefield: state.battlefield.map((permanent, index) => {
      if (!permanent) {
        return `slot ${index + 1}: empty`;
      }

      return [
        `slot ${index + 1}: ${permanent.name}`,
        `hp=${permanent.health}/${permanent.maxHealth}`,
        `block=${permanent.block}`,
        `acted=${permanent.hasActedThisTurn ? "yes" : "no"}`,
        `tapped=${permanent.isTapped ? "yes" : "no"}`,
        `defending=${permanent.isDefending ? "yes" : "no"}`,
      ].join(", ");
    }),
    blockingQueue: [...state.blockingQueue],
  };
}

export function formatBattleSummary(summary: BattleSummary): string {
  return [
    `turn: ${summary.turnNumber}`,
    `phase: ${summary.phase}`,
    `player: hp=${summary.player.health}/${summary.player.maxHealth}, block=${summary.player.block}, energy=${summary.player.energy}, hand=${summary.player.handCount}, discard=${summary.player.discardCount}, graveyard=${summary.player.graveyardCount}`,
    `enemy: ${summary.enemy.name}, hp=${summary.enemy.health}/${summary.enemy.maxHealth}, block=${summary.enemy.block}, intent=${summary.enemy.intent}`,
    `battlefield:\n${summary.battlefield.join("\n")}`,
    `blocking queue: ${summary.blockingQueue.length > 0 ? summary.blockingQueue.join(", ") : "empty"}`,
  ].join("\n");
}
