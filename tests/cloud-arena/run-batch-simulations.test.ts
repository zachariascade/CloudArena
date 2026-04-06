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
      averageTurns: 1,
      averageTurnsToWin: 1,
      averageRemainingPlayerHealthOnWins: 100,
      averageRemainingEnemyHealthOnLosses: null,
      averageSurvivingPermanents: 0,
      averageDamageTaken: 0,
      averageUnusedEnergyPerTurn: 0,
      averageDeadTurns: 0,
    });
    expect(result.runs).toEqual([
      {
        seed: 1,
        winner: "player",
        finalTurnNumber: 1,
        playerHealth: 100,
        enemyHealth: 0,
        survivingPermanents: 0,
        damageTaken: 0,
        averageUnusedEnergyPerTurn: 0,
        deadTurns: 0,
        trace: result.runs[0]?.trace,
      },
      {
        seed: 2,
        winner: "player",
        finalTurnNumber: 1,
        playerHealth: 100,
        enemyHealth: 0,
        survivingPermanents: 0,
        damageTaken: 0,
        averageUnusedEnergyPerTurn: 0,
        deadTurns: 0,
        trace: result.runs[1]?.trace,
      },
      {
        seed: 3,
        winner: "player",
        finalTurnNumber: 1,
        playerHealth: 100,
        enemyHealth: 0,
        survivingPermanents: 0,
        damageTaken: 0,
        averageUnusedEnergyPerTurn: 0,
        deadTurns: 0,
        trace: result.runs[2]?.trace,
      },
    ]);
    expect(result.sampleWinTrace?.result.winner).toBe("player");
    expect(result.sampleLossTrace).toBeNull();
  });
});
