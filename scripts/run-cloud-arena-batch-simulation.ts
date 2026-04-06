import {
  chooseHeuristicDecision,
  getScenarioPreset,
  runBatchSimulations,
  type CloudArenaScenarioId,
  type SimulationTrace,
} from "../src/cloud-arena/index.js";

type BatchSimulationConfig = {
  scenarioId: CloudArenaScenarioId;
  seedStart: number;
  runs: number;
  maxSteps?: number;
  agentName: string;
  printPerRunResults: boolean;
  printSampleWinTrace: boolean;
  printSampleLossTrace: boolean;
};

const BATCH_SIMULATION_CONFIG: BatchSimulationConfig = {
  scenarioId: "mixed_guardian",
  seedStart: 1,
  runs: 20,
  maxSteps: undefined,
  agentName: "heuristic_baseline",
  printPerRunResults: true,
  printSampleWinTrace: false,
  printSampleLossTrace: false,
};

function printTraceSection(title: string, trace: SimulationTrace | null): void {
  console.log(`\n=== ${title} ===`);

  if (!trace) {
    console.log("none");
    return;
  }

  console.log(JSON.stringify(trace, null, 2));
}

function main(): void {
  const scenario = getScenarioPreset(BATCH_SIMULATION_CONFIG.scenarioId);
  const result = runBatchSimulations({
    seedStart: BATCH_SIMULATION_CONFIG.seedStart,
    runs: BATCH_SIMULATION_CONFIG.runs,
    maxSteps: BATCH_SIMULATION_CONFIG.maxSteps ?? scenario.recommendedMaxSteps,
    agentName: BATCH_SIMULATION_CONFIG.agentName,
    playerHealth: scenario.playerHealth,
    playerDeck: scenario.deck,
    enemy: scenario.enemy,
    agent: chooseHeuristicDecision,
  });

  console.log("=== Batch Config ===");
  console.log(
    JSON.stringify(
      {
        ...BATCH_SIMULATION_CONFIG,
        maxSteps: BATCH_SIMULATION_CONFIG.maxSteps ?? scenario.recommendedMaxSteps,
        scenario,
      },
      null,
      2,
    ),
  );

  console.log("\n=== Batch Summary ===");
  console.log(JSON.stringify(result.summary, null, 2));

  if (BATCH_SIMULATION_CONFIG.printPerRunResults) {
    console.log("\n=== Per Run Results ===");
    for (const run of result.runs) {
      console.log(
        `seed ${run.seed}: winner=${run.winner}, turns=${run.finalTurnNumber}, playerHp=${run.playerHealth}, enemyHp=${run.enemyHealth}, permanents=${run.survivingPermanents}, damageTaken=${run.damageTaken}, avgUnusedEnergy=${run.averageUnusedEnergyPerTurn}, deadTurns=${run.deadTurns}`,
      );
    }
  }

  if (BATCH_SIMULATION_CONFIG.printSampleWinTrace) {
    printTraceSection("Sample Win Trace", result.sampleWinTrace);
  }

  if (BATCH_SIMULATION_CONFIG.printSampleLossTrace) {
    printTraceSection("Sample Loss Trace", result.sampleLossTrace);
  }
}

main();
