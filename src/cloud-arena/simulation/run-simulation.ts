import { getLegalActions } from "../actions/legal-actions.js";
import { createBattle } from "../core/create-battle.js";
import { applyBattleAction } from "../core/engine.js";
import { cloneEnemyConfig } from "../core/enemy-plan.js";
import { buildBattleSummary, type BattleSummary } from "../core/summary.js";
import type {
  BattleAction,
  BattleEvent,
  BattlePhase,
  BattleState,
  CreateBattleInput,
} from "../core/types.js";

export type SimulationDecision = {
  action: BattleAction;
  reason?: string;
};

export type SimulationAgent = (
  state: BattleState,
  legalActions: BattleAction[],
) => BattleAction | SimulationDecision;

export type SimulationActionRecord = {
  turnNumber: number;
  phase: BattlePhase;
  action: BattleAction;
  reason?: string;
};

export type SimulationInput = CreateBattleInput & {
  agent: SimulationAgent;
  agentName?: string;
  maxSteps?: number;
};

export type SimulationTrace = {
  config: {
    seed: number;
    playerHealth: number;
    cardDefinitions: CreateBattleInput["cardDefinitions"];
    playerDeck: CreateBattleInput["playerDeck"];
    enemy: CreateBattleInput["enemy"];
    maxSteps: number;
    agent: string;
  };
  result: {
    winner: "player" | "enemy" | "unknown";
    finalPhase: BattlePhase;
    finalTurnNumber: number;
  };
  finalSummary: BattleSummary;
  actionHistory: SimulationActionRecord[];
  log: BattleEvent[];
};

export type SimulationResult = {
  seed: number;
  finalState: BattleState;
  actionHistory: SimulationActionRecord[];
  summary: BattleSummary;
  log: BattleEvent[];
  trace: SimulationTrace;
};

function toActionKey(action: BattleAction): string {
  return JSON.stringify(action);
}

function assertLegalAction(
  selectedAction: BattleAction,
  legalActions: BattleAction[],
): void {
  const selectedKey = toActionKey(selectedAction);
  const legalKeys = new Set(legalActions.map(toActionKey));

  if (!legalKeys.has(selectedKey)) {
    throw new Error(`Simulation agent selected an illegal action: ${selectedKey}`);
  }
}

function findWinner(log: BattleEvent[]): "player" | "enemy" | "unknown" {
  for (let index = log.length - 1; index >= 0; index -= 1) {
    const event = log[index];

    if (event?.type === "battle_finished") {
      return event.winner;
    }
  }

  return "unknown";
}

function normalizeAgentSelection(
  selection: BattleAction | SimulationDecision,
): SimulationDecision {
  if (
    "action" in selection &&
    typeof selection.action === "object" &&
    selection.action !== null &&
    "type" in selection.action
  ) {
    return selection as SimulationDecision;
  }

  return { action: selection as BattleAction };
}

export function runSimulation(input: SimulationInput): SimulationResult {
  const state = createBattle(input);
  const traceEnemy = input.enemies?.[0] ?? input.enemy;

  if (!traceEnemy) {
    throw new Error("Simulation input must include at least one enemy definition.");
  }

  const startingDeck = [
    ...state.player.hand,
    ...state.player.drawPile,
  ].map((card) => card.definitionId);
  const actionHistory: SimulationActionRecord[] = [];
  const maxSteps = input.maxSteps ?? 1000;

  for (let step = 0; step < maxSteps; step += 1) {
    if (state.phase === "finished") {
      const summary = buildBattleSummary(state);
      const log = [...state.log];
      const trace: SimulationTrace = {
        config: {
          seed: state.seed,
          playerHealth: state.player.maxHealth,
          cardDefinitions: state.cardDefinitions,
          playerDeck: startingDeck,
          enemy: cloneEnemyConfig(traceEnemy),
          maxSteps,
          agent: input.agentName ?? "anonymous_agent",
        },
        result: {
          winner: findWinner(log),
          finalPhase: state.phase,
          finalTurnNumber: state.turnNumber,
        },
        finalSummary: summary,
        actionHistory: [...actionHistory],
        log,
      };

      return {
        seed: state.seed,
        finalState: state,
        actionHistory,
        summary,
        log,
        trace,
      };
    }

    const legalActions = getLegalActions(state);

    if (legalActions.length === 0) {
      throw new Error(`No legal actions available while battle is in phase ${state.phase}.`);
    }

    const decision = normalizeAgentSelection(input.agent(state, legalActions));
    assertLegalAction(decision.action, legalActions);

    actionHistory.push({
      turnNumber: state.turnNumber,
      phase: state.phase,
      action: decision.action,
      reason: decision.reason,
    });

    applyBattleAction(state, decision.action);
  }

  throw new Error(`Simulation exceeded maxSteps (${maxSteps}) without finishing.`);
}
