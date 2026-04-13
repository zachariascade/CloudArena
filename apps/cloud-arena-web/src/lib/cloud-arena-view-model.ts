import type { CloudArenaSessionSnapshot } from "../../../../src/cloud-arena/api-contract.js";
import type {
  BattleEvent,
  SimulationTrace,
} from "../../../../src/cloud-arena/index.js";

import {
  buildBattleViewModelFromSessionSnapshot,
  buildBattleViewModelFromTraceStep,
  type CloudArenaBattleViewModel,
} from "./cloud-arena-battle-view-model.js";
import {
  type TraceViewerEventGroup,
  type TraceViewerStepViewModel,
  formatTraceActionRecord,
  groupTraceEventsByTurn,
} from "./cloud-arena-trace-view-model.js";

export type CloudArenaSummaryPill = {
  label: string;
  value: string;
};

export type CloudArenaCurrentActionViewModel = {
  title: string;
  detail: string;
  meta: CloudArenaSummaryPill[];
  keyboardHint?: string | null;
};

export type CloudArenaReplayContextViewModel = {
  currentStepIndex: number;
  stepCount: number;
  seed: number;
  agent: string;
  winner: string;
  finalTurnNumber: number;
};

export type CloudArenaSessionContextViewModel = {
  sessionId: string;
  scenarioId: string;
  status: CloudArenaSessionSnapshot["status"];
  seed: number;
  createdAt: string;
  actionCount: number;
};

export type CloudArenaViewModel = {
  mode: "replay" | "interactive";
  battle: CloudArenaBattleViewModel;
  summary: CloudArenaSummaryPill[];
  currentAction: CloudArenaCurrentActionViewModel | null;
  recentEvents: BattleEvent[];
  visibleLog: BattleEvent[];
  currentEvents: BattleEvent[];
  logGroups: TraceViewerEventGroup[];
  replay: CloudArenaReplayContextViewModel | null;
  session: CloudArenaSessionContextViewModel | null;
};

export function buildCloudArenaViewModelFromTraceStep(input: {
  currentStepIndex: number;
  stepCount: number;
  step: TraceViewerStepViewModel;
  trace: SimulationTrace;
}): CloudArenaViewModel {
  const battle = buildBattleViewModelFromTraceStep(input.step);
  const visibleLog = input.step.visibleLog;
  const currentEvents = input.step.currentEvents;

  return {
    mode: "replay",
    battle,
    summary: [
      { label: "Scenario", value: "Mixed Guardian" },
      { label: "Seed", value: String(input.trace.config.seed) },
      { label: "Agent", value: input.trace.config.agent },
      { label: "Winner", value: input.trace.result.winner },
      { label: "Final turn", value: String(input.trace.result.finalTurnNumber) },
    ],
    currentAction: {
      title: formatTraceActionRecord(input.step.actionRecord),
      detail: input.step.actionRecord?.reason ?? "Opening hand and board state before the first action.",
      meta: [
        { label: "Turn", value: String(input.step.turnNumber) },
        { label: "Intent", value: battle.enemy.intentLabel },
      ],
      keyboardHint: "Keyboard: ← previous, → next, Home first, End last",
    },
    recentEvents: currentEvents.length > 0 ? [...currentEvents] : visibleLog.slice(-8),
    visibleLog: [...visibleLog],
    currentEvents: [...currentEvents],
    logGroups: groupTraceEventsByTurn(visibleLog, currentEvents),
    replay: {
      currentStepIndex: input.currentStepIndex,
      stepCount: input.stepCount,
      seed: input.trace.config.seed,
      agent: input.trace.config.agent,
      winner: input.trace.result.winner,
      finalTurnNumber: input.trace.result.finalTurnNumber,
    },
    session: null,
  };
}

export function buildCloudArenaViewModelFromSessionSnapshot(
  snapshot: CloudArenaSessionSnapshot,
): CloudArenaViewModel {
  const battle = buildBattleViewModelFromSessionSnapshot(snapshot);
  const visibleLog = snapshot.log;

  return {
    mode: "interactive",
    battle,
    summary: [
      { label: "Scenario", value: "Mixed Guardian" },
      { label: "Seed", value: String(snapshot.seed) },
      { label: "Turn", value: String(snapshot.turnNumber) },
      { label: "Phase", value: snapshot.phase },
      { label: "Status", value: snapshot.status },
    ],
    currentAction: {
      title:
        snapshot.status === "finished"
          ? "Battle complete"
          : "Choose one of the legal actions to advance the live board state.",
      detail:
        snapshot.status === "finished"
          ? "This session has reached a finished battle state."
          : "Enemy turns resolve immediately when you end the turn, and the API returns the next updated snapshot.",
      meta: [
        { label: "Intent", value: battle.enemy.intentLabel },
        { label: "Actions", value: String(snapshot.legalActions.length) },
      ],
      keyboardHint: null,
    },
    recentEvents: snapshot.log.slice(-8),
    visibleLog: [...visibleLog],
    currentEvents: [],
    logGroups: groupTraceEventsByTurn(visibleLog, []),
    replay: null,
    session: {
      sessionId: snapshot.sessionId,
      scenarioId: snapshot.scenarioId,
      status: snapshot.status,
      seed: snapshot.seed,
      createdAt: snapshot.createdAt,
      actionCount: snapshot.actionHistory.length,
    },
  };
}
