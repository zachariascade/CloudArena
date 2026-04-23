import type {
  CloudArenaActionOption,
  CloudArenaCardSnapshot,
  CloudArenaPermanentSnapshot,
  CloudArenaPendingTargetRequestSnapshot,
  CloudArenaSessionSnapshot,
} from "../../../../src/cloud-arena/api-contract.js";
import type {
  BattlePhase,
  EnemyIntent,
} from "../../../../src/cloud-arena/index.js";

import type { TraceViewerStepViewModel } from "./cloud-arena-view-model-helpers.js";

function compactBattlefieldSlots(
  battlefield: Array<CloudArenaPermanentSnapshot | null>,
): Array<CloudArenaPermanentSnapshot | null> {
  return battlefield
    .filter((slot): slot is CloudArenaPermanentSnapshot => slot !== null)
    .map((slot, index) => ({
      ...slot,
      slotIndex: index,
    }));
}

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
    drawPile: CloudArenaCardSnapshot[];
    drawPileCount: number;
    discardPile: CloudArenaCardSnapshot[];
    graveyard: CloudArenaCardSnapshot[];
  };
  enemy: {
    name: string;
    health: number;
    maxHealth: number;
    block: number;
    leaderDefinitionId?: string | null;
    intent: EnemyIntent;
    intentLabel: string;
    intentQueueLabels?: string[];
  };
  battlefield: Array<CloudArenaPermanentSnapshot | null>;
  battlefieldSlotCount: number;
  enemyBattlefield?: Array<CloudArenaPermanentSnapshot | null>;
  pendingTargetRequest?: CloudArenaPendingTargetRequestSnapshot | null;
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
      drawPile: [],
      drawPileCount: step.player.drawPileCount,
      discardPile: step.player.discardPile.map((card) => ({ ...card })),
      graveyard: step.player.graveyard.map((card) => ({ ...card })),
    },
    enemy: {
      name: step.enemy.name,
      health: step.enemy.health,
      maxHealth: step.enemy.maxHealth,
      block: step.enemy.block,
      leaderDefinitionId: null,
      intent: { ...step.enemy.intent },
      intentLabel: step.enemy.intentLabel,
      intentQueueLabels: [],
    },
    battlefield: compactBattlefieldSlots(
      step.battlefield.map((slot) =>
        slot
          ? {
              ...slot,
              actions: slot.actions.map((action) => ({ ...action })),
            }
          : null,
      ),
    ),
    battlefieldSlotCount: step.battlefield.length,
    enemyBattlefield: Array.from({ length: step.battlefield.length }, () => null),
    pendingTargetRequest: null,
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
  const pendingCardPlay = snapshot.pendingTargetRequest?.context?.pendingCardPlay ?? null;
  const pendingCardPlayHandIndex = snapshot.pendingTargetRequest?.context?.pendingCardPlayHandIndex ?? null;
  const handCards = snapshot.player.hand.map((card) => ({ ...card }));

  if (pendingCardPlay && !handCards.some((card) => card.instanceId === pendingCardPlay.instanceId)) {
    const insertAt =
      typeof pendingCardPlayHandIndex === "number"
        ? Math.max(0, Math.min(pendingCardPlayHandIndex, handCards.length))
        : handCards.length;

    handCards.splice(insertAt, 0, { ...pendingCardPlay });
  }

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
      hand: handCards,
      drawPile: snapshot.player.drawPile.map((card) => ({ ...card })),
      drawPileCount: snapshot.player.drawPileCount,
      discardPile: snapshot.player.discardPile.map((card) => ({ ...card })),
      graveyard: snapshot.player.graveyard.map((card) => ({ ...card })),
    },
    enemy: {
      name: snapshot.enemy.name,
      health: snapshot.enemy.health,
      maxHealth: snapshot.enemy.maxHealth,
      block: snapshot.enemy.block,
      leaderDefinitionId: snapshot.enemy.leaderDefinitionId ?? null,
      intent: { ...snapshot.enemy.intent },
      intentLabel: snapshot.enemy.intentLabel,
      intentQueueLabels: [...snapshot.enemy.intentQueueLabels],
    },
    battlefield: compactBattlefieldSlots(
      snapshot.battlefield.map((slot) =>
        slot
          ? {
              ...slot,
              actions: slot.actions.map((action) => ({ ...action })),
            }
          : null,
      ),
    ),
    battlefieldSlotCount: snapshot.battlefield.length,
    enemyBattlefield: compactBattlefieldSlots(
      snapshot.enemyBattlefield.map((slot) =>
        slot
          ? {
              ...slot,
              actions: slot.actions.map((action) => ({ ...action })),
            }
          : null,
      ),
    ),
    pendingTargetRequest: snapshot.pendingTargetRequest
      ? {
          ...snapshot.pendingTargetRequest,
          selector: { ...snapshot.pendingTargetRequest.selector },
          context: snapshot.pendingTargetRequest.context
            ? { ...snapshot.pendingTargetRequest.context }
            : undefined,
        }
      : null,
    blockingQueue: [...snapshot.blockingQueue],
    legalActions,
  };
}
