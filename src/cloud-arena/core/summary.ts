import { formatEnemyIntent } from "./enemy-intent.js";
import { getPrimaryEnemyPermanent } from "./permanents.js";
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
  enemyBattlefield: string[];
  blockingQueue: string[];
};

export function buildBattleSummary(state: BattleState): BattleSummary {
  const compactSlots = 5;
  const primaryEnemyPermanent = getPrimaryEnemyPermanent(state);
  const primaryEnemyActor = state.enemies[0] ?? null;
  const enemyName = primaryEnemyPermanent?.name ?? primaryEnemyActor?.name ?? state.enemy.name;
  const enemyHealth = primaryEnemyPermanent?.health ?? primaryEnemyActor?.health ?? state.enemy.health;
  const enemyMaxHealth = primaryEnemyPermanent?.maxHealth ?? primaryEnemyActor?.maxHealth ?? state.enemy.maxHealth;
  const enemyBlock = primaryEnemyPermanent?.block ?? primaryEnemyActor?.block ?? state.enemy.block;

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
      name: enemyName,
      health: enemyHealth,
      maxHealth: enemyMaxHealth,
      block: enemyBlock,
      intent: formatEnemyIntent(primaryEnemyActor?.intent ?? state.enemy.intent),
    },
    battlefield: state.battlefield.slice(0, compactSlots).map((permanent, index) => {
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
        `blockingFor=${permanent.blockingTargetPermanentId ?? "none"}`,
      ].join(", ");
    }),
    enemyBattlefield: state.enemyBattlefield.slice(0, compactSlots).map((permanent, index) => {
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
        `blockingFor=${permanent.blockingTargetPermanentId ?? "none"}`,
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
    `enemy battlefield:\n${summary.enemyBattlefield.join("\n")}`,
    `blocking queue: ${summary.blockingQueue.length > 0 ? summary.blockingQueue.join(", ") : "empty"}`,
  ].join("\n");
}
