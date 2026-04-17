import { describe, expect, it } from "vitest";

import {
  chooseHeuristicAction,
  runBatchSimulations,
} from "../../src/cloud-arena/index.js";
import { TEST_CARD_DEFINITIONS } from "./helpers.js";

describe("cloud arena batch simulation runner", () => {
  it("runs deterministic batches across seeds and returns aggregate metrics", () => {
    const result = runBatchSimulations({
      seedStart: 1,
      runs: 3,
      maxSteps: 50,
      agentName: "heuristic_baseline",
      playerHealth: 100,
      cardDefinitions: TEST_CARD_DEFINITIONS,
      playerDeck: ["attack", "attack", "attack", "defend", "defend"],
      enemy: {
        name: "Accusing Spirit",
        health: 12,
        basePower: 8,
        behavior: [{ attackAmount: 8 }],
      },
      agent: chooseHeuristicAction,
    });

    expect(result.summary).toEqual({
      totalRuns: 3,
      wins: 3,
      losses: 0,
      winRate: 100,
      averageTurns: 4,
      averageTurnsToWin: 4,
      averageRemainingPlayerHealthOnWins: 100,
      averageRemainingEnemyHealthOnLosses: null,
      averageSurvivingPermanents: 0,
      averageDamageTaken: 0,
      averageUnusedEnergyPerTurn: 0.5,
      averageDeadTurns: 0,
    });
    expect(result.runs.map((run) => ({
      seed: run.seed,
      winner: run.winner,
      finalTurnNumber: run.finalTurnNumber,
      playerHealth: run.playerHealth,
      enemyHealth: run.enemyHealth,
      survivingPermanents: run.survivingPermanents,
      damageTaken: run.damageTaken,
      averageUnusedEnergyPerTurn: run.averageUnusedEnergyPerTurn,
      deadTurns: run.deadTurns,
    }))).toEqual([
      {
        seed: 1,
        winner: "player",
        finalTurnNumber: 4,
        playerHealth: 100,
        enemyHealth: 0,
        survivingPermanents: 0,
        damageTaken: 0,
        averageUnusedEnergyPerTurn: 0.5,
        deadTurns: 0,
      },
      {
        seed: 2,
        winner: "player",
        finalTurnNumber: 4,
        playerHealth: 100,
        enemyHealth: 0,
        survivingPermanents: 0,
        damageTaken: 0,
        averageUnusedEnergyPerTurn: 0.5,
        deadTurns: 0,
      },
      {
        seed: 3,
        winner: "player",
        finalTurnNumber: 4,
        playerHealth: 100,
        enemyHealth: 0,
        survivingPermanents: 0,
        damageTaken: 0,
        averageUnusedEnergyPerTurn: 0.5,
        deadTurns: 0,
      },
    ]);
    expect(result.sampleWinTrace?.result.winner).toBe("player");
    expect(result.sampleLossTrace).toBeNull();
  });
});
