import { getCardDefinitionFromLibrary } from "../cards/definitions.js";
import type { CreateBattleInput } from "../core/types.js";
import {
  runSimulation,
  type SimulationActionRecord,
  type SimulationAgent,
  type SimulationTrace,
} from "./run-simulation.js";

export type BatchSimulationInput = CreateBattleInput & {
  agent: SimulationAgent;
  agentName?: string;
  maxSteps?: number;
  seedStart?: number;
  runs: number;
};

export type BatchSimulationRunResult = {
  seed: number;
  winner: "player" | "enemy" | "unknown";
  finalTurnNumber: number;
  playerHealth: number;
  enemyHealth: number;
  survivingPermanents: number;
  damageTaken: number;
  averageUnusedEnergyPerTurn: number;
  deadTurns: number;
  trace: SimulationTrace;
};

export type BatchSimulationSummary = {
  totalRuns: number;
  wins: number;
  losses: number;
  winRate: number;
  averageTurns: number;
  averageTurnsToWin: number | null;
  averageRemainingPlayerHealthOnWins: number | null;
  averageRemainingEnemyHealthOnLosses: number | null;
  averageSurvivingPermanents: number | null;
  averageDamageTaken: number | null;
  averageUnusedEnergyPerTurn: number | null;
  averageDeadTurns: number | null;
};

export type BatchSimulationResult = {
  runs: BatchSimulationRunResult[];
  summary: BatchSimulationSummary;
  sampleWinTrace: SimulationTrace | null;
  sampleLossTrace: SimulationTrace | null;
};

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return Number((total / values.length).toFixed(2));
}

function buildTurnUsageMap(
  actionHistory: SimulationActionRecord[],
): Map<number, SimulationActionRecord[]> {
  const usageByTurn = new Map<number, SimulationActionRecord[]>();

  for (const record of actionHistory) {
    const records = usageByTurn.get(record.turnNumber) ?? [];
    records.push(record);
    usageByTurn.set(record.turnNumber, records);
  }

  return usageByTurn;
}

function calculateAverageUnusedEnergyPerTurnFromTrace(trace: SimulationTrace): number {
  const usageByTurn = buildTurnUsageMap(trace.actionHistory);
  const playedCardEvents = trace.log.filter((event) => event.type === "card_played");
  let playedCardEventIndex = 0;
  const unusedEnergyValues: number[] = [];

  for (const records of usageByTurn.values()) {
    let spentEnergy = 0;

    for (const record of records) {
      if (record.action.type !== "play_card") {
        continue;
      }

      const playedCardEvent = playedCardEvents[playedCardEventIndex];
      playedCardEventIndex += 1;

      if (!playedCardEvent || playedCardEvent.type !== "card_played") {
        continue;
      }

      spentEnergy += getCardDefinitionFromLibrary(
        trace.config.cardDefinitions ?? {},
        playedCardEvent.cardId,
      ).cost;
    }

    unusedEnergyValues.push(Math.max(0, 3 - spentEnergy));
  }

  return average(unusedEnergyValues) ?? 0;
}

function calculateDeadTurns(actionHistory: SimulationActionRecord[]): number {
  const usageByTurn = buildTurnUsageMap(actionHistory);
  let deadTurns = 0;

  for (const records of usageByTurn.values()) {
    const hasMeaningfulAction = records.some(
      (record) => record.action.type === "play_card" || record.action.type === "use_permanent_action",
    );

    if (!hasMeaningfulAction) {
      deadTurns += 1;
    }
  }

  return deadTurns;
}

export function runBatchSimulations(
  input: BatchSimulationInput,
): BatchSimulationResult {
  const seedStart = input.seedStart ?? 1;
  const runs: BatchSimulationRunResult[] = [];

  for (let offset = 0; offset < input.runs; offset += 1) {
    const seed = seedStart + offset;
    const result = runSimulation({
      seed,
      playerHealth: input.playerHealth,
      playerDeck: input.playerDeck,
      shuffleDeck: input.shuffleDeck,
      enemy: input.enemy,
      agent: input.agent,
      agentName: input.agentName,
      maxSteps: input.maxSteps,
    });

    runs.push({
      seed,
      winner: result.trace.result.winner,
      finalTurnNumber: result.trace.result.finalTurnNumber,
      playerHealth: result.finalState.player.health,
      enemyHealth: result.finalState.enemy.health,
      survivingPermanents: result.finalState.battlefield.filter((entry) => entry !== null).length,
      damageTaken: result.finalState.player.maxHealth - result.finalState.player.health,
      averageUnusedEnergyPerTurn: calculateAverageUnusedEnergyPerTurnFromTrace(result.trace),
      deadTurns: calculateDeadTurns(result.actionHistory),
      trace: result.trace,
    });
  }

  const wins = runs.filter((run) => run.winner === "player");
  const losses = runs.filter((run) => run.winner === "enemy");
  const totalRuns = runs.length;

  return {
    runs,
    summary: {
      totalRuns,
      wins: wins.length,
      losses: losses.length,
      winRate: totalRuns === 0 ? 0 : Number(((wins.length / totalRuns) * 100).toFixed(2)),
      averageTurns: average(runs.map((run) => run.finalTurnNumber)) ?? 0,
      averageTurnsToWin: average(wins.map((run) => run.finalTurnNumber)),
      averageRemainingPlayerHealthOnWins: average(wins.map((run) => run.playerHealth)),
      averageRemainingEnemyHealthOnLosses: average(losses.map((run) => run.enemyHealth)),
      averageSurvivingPermanents: average(runs.map((run) => run.survivingPermanents)),
      averageDamageTaken: average(runs.map((run) => run.damageTaken)),
      averageUnusedEnergyPerTurn: average(runs.map((run) => run.averageUnusedEnergyPerTurn)),
      averageDeadTurns: average(runs.map((run) => run.deadTurns)),
    },
    sampleWinTrace: wins[0]?.trace ?? null,
    sampleLossTrace: losses[0]?.trace ?? null,
  };
}
