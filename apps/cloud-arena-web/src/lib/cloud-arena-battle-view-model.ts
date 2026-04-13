import type {
  CloudArenaActionOption,
  CloudArenaCardSnapshot,
  CloudArenaPermanentSnapshot,
  CloudArenaSessionSnapshot,
} from "../../../../src/cloud-arena/api-contract.js";
import type {
  BattlePhase,
  EnemyIntent,
} from "../../../../src/cloud-arena/index.js";
import { formatEnemyIntent } from "../../../../src/cloud-arena/index.js";

import type { TraceViewerStepViewModel } from "./cloud-arena-trace-view-model.js";

export type CloudArenaBattleViewModel = {
  turnNumber: number;
  phase: BattlePhase;
  actionGroups: {
    hand: CloudArenaActionOption[];
    battlefield: CloudArenaActionOption[];
    turn: CloudArenaActionOption[];
  };
  player: {
    health: number;
    maxHealth: number;
    block: number;
    energy: number;
    hand: CloudArenaCardSnapshot[];
    drawPileCount: number;
    discardPile: CloudArenaCardSnapshot[];
    graveyard: CloudArenaCardSnapshot[];
  };
  enemy: {
    name: string;
    health: number;
    maxHealth: number;
    block: number;
    intent: EnemyIntent;
    intentLabel: string;
  };
  battlefield: Array<CloudArenaPermanentSnapshot | null>;
  blockingQueue: string[];
  legalActions: CloudArenaActionOption[];
};

export function buildBattleViewModelFromTraceStep(
  step: TraceViewerStepViewModel,
): CloudArenaBattleViewModel {
  return {
    turnNumber: step.turnNumber,
    phase: step.actionRecord?.phase ?? "player_action",
    actionGroups: {
      hand: [],
      battlefield: [],
      turn: [],
    },
    player: {
      health: step.player.health,
      maxHealth: step.player.maxHealth,
      block: step.player.block,
      energy: step.player.energy,
      hand: step.player.hand.map((card) => ({ ...card })),
      drawPileCount: step.player.drawPileCount,
      discardPile: step.player.discardPile.map((card) => ({ ...card })),
      graveyard: step.player.graveyard.map((card) => ({ ...card })),
    },
    enemy: {
      name: step.enemy.name,
      health: step.enemy.health,
      maxHealth: step.enemy.maxHealth,
      block: step.enemy.block,
      intent: { ...step.enemy.intent },
      intentLabel: formatEnemyIntent(step.enemy.intent),
    },
    battlefield: step.battlefield.map((slot) =>
      slot
        ? {
            ...slot,
            actions: slot.actions.map((action) => ({ ...action })),
          }
        : null,
    ),
    blockingQueue: [...step.blockingQueue],
    legalActions: [],
  };
}

export function buildBattleViewModelFromSessionSnapshot(
  snapshot: CloudArenaSessionSnapshot,
): CloudArenaBattleViewModel {
  const legalActions = snapshot.legalActions.map((option) => ({
    ...option,
    action: { ...option.action },
  }));

  return {
    turnNumber: snapshot.turnNumber,
    phase: snapshot.phase,
    actionGroups: {
      hand: legalActions.filter((option) => option.source === "hand"),
      battlefield: legalActions.filter((option) => option.source === "battlefield"),
      turn: legalActions.filter((option) => option.source === "turn"),
    },
    player: {
      health: snapshot.player.health,
      maxHealth: snapshot.player.maxHealth,
      block: snapshot.player.block,
      energy: snapshot.player.energy,
      hand: snapshot.player.hand.map((card) => ({ ...card })),
      drawPileCount: snapshot.player.drawPileCount,
      discardPile: snapshot.player.discardPile.map((card) => ({ ...card })),
      graveyard: snapshot.player.graveyard.map((card) => ({ ...card })),
    },
    enemy: {
      name: snapshot.enemy.name,
      health: snapshot.enemy.health,
      maxHealth: snapshot.enemy.maxHealth,
      block: snapshot.enemy.block,
      intent: { ...snapshot.enemy.intent },
      intentLabel: snapshot.enemy.intentLabel,
    },
    battlefield: snapshot.battlefield.map((slot) =>
      slot
        ? {
            ...slot,
            actions: slot.actions.map((action) => ({ ...action })),
          }
        : null,
    ),
    blockingQueue: [...snapshot.blockingQueue],
    legalActions,
  };
}
