import { describe, expect, it } from "vitest";

import {
  chooseHeuristicAction,
  chooseHeuristicDecision,
  assault,
  runSimulation,
  type BattleAction,
  type BattleState,
} from "../../src/cloud-arena/index.js";
import { createTestBattle, TEST_CARD_DEFINITIONS } from "./helpers.js";

function simpleDeterministicAgent(
  _state: BattleState,
  legalActions: BattleAction[],
): BattleAction {
  const chooseTargetAction = legalActions.find((action) => action.type === "choose_target");
  const playAttack = legalActions.find(
    (action) => action.type === "play_card" && action.cardInstanceId.includes("card_"),
  );

  const attackCardAction = legalActions.find((action) => action.type === "play_card");
  const permanentAttack = legalActions.find(
    (action) => action.type === "use_permanent_action" && action.action === "attack",
  );
  const permanentDefend = legalActions.find(
    (action) => action.type === "use_permanent_action" && action.action === "defend",
  );
  const defendCardAction = legalActions.find((action) => action.type === "play_card");
  const endTurnAction = legalActions.find((action) => action.type === "end_turn");

  return (
    chooseTargetAction ??
    permanentAttack ??
    playAttack ??
    attackCardAction ??
    permanentDefend ??
    defendCardAction ??
    endTurnAction ??
    legalActions[0] ??
    { type: "end_turn" }
  );
}

describe("cloud arena simulation runner", () => {
  it("runs a deterministic simulation to completion and returns history, summary, and log", () => {
    const result = runSimulation({
      seed: 1,
      maxSteps: 50,
      cardDefinitions: TEST_CARD_DEFINITIONS,
      playerDeck: ["attack", "attack", "attack", "defend", "defend"],
      enemy: {
        name: "Accusing Spirit",
        health: 12,
        basePower: 8,
        behavior: [{ attackAmount: 8 }],
      },
      agent: (state, legalActions) => {
        const chooseTargetAction = legalActions.find((action) => action.type === "choose_target");

        if (chooseTargetAction) {
          return chooseTargetAction;
        }

        const attackAction = legalActions.find((action) => {
          if (action.type !== "play_card") {
            return false;
          }

          const card = state.player.hand.find((entry) => entry.instanceId === action.cardInstanceId);
          return card?.definitionId === "attack";
        });

        return attackAction ?? legalActions.find((action) => action.type === "end_turn") ?? legalActions[0]!;
      },
    });

    expect(result.seed).toBe(1);
    expect(result.finalState.phase).toBe("finished");
    expect(result.summary.enemy.health).toBe(0);
    expect(result.actionHistory).toEqual([
      {
        turnNumber: 1,
        phase: "player_action",
        action: {
          type: "play_card",
          cardInstanceId: "card_1",
        },
        reason: undefined,
      },
      {
        turnNumber: 1,
        phase: "player_action",
        action: {
          type: "choose_target",
          targetPermanentId: "enemy_leader_1_1",
        },
        reason: undefined,
      },
      {
        turnNumber: 1,
        phase: "player_action",
        action: {
          type: "play_card",
          cardInstanceId: "card_2",
        },
        reason: undefined,
      },
      {
        turnNumber: 1,
        phase: "player_action",
        action: {
          type: "choose_target",
          targetPermanentId: "enemy_leader_1_1",
        },
        reason: undefined,
      },
    ]);
    expect(result.log.at(-1)).toEqual({
      type: "battle_finished",
      turnNumber: 1,
      winner: "player",
      playerHealth: result.finalState.player.health,
      enemyHealth: result.finalState.enemy.health,
      permanents: [],
    });
    expect(result.trace).toEqual({
      config: {
        seed: 1,
        playerHealth: result.finalState.player.maxHealth,
        cardDefinitions: TEST_CARD_DEFINITIONS,
        playerDeck: ["attack", "attack", "attack", "defend", "defend"],
        enemy: {
          name: "Accusing Spirit",
          health: 12,
          basePower: 8,
          behavior: [{ attackAmount: 8 }],
        },
        maxSteps: 50,
        agent: "anonymous_agent",
      },
      result: {
        winner: "player",
        finalPhase: "finished",
        finalTurnNumber: 1,
      },
      finalSummary: result.summary,
      actionHistory: result.actionHistory,
      log: result.log,
    });
  });

  it("discards unplayed hand cards and reshuffles discard into draw when needed", () => {
    const result = runSimulation({
      seed: 1,
      maxSteps: 20,
      cardDefinitions: TEST_CARD_DEFINITIONS,
      playerDeck: ["guardian", "attack", "attack", "attack", "attack", "attack"],
      enemy: {
        name: "Accusing Spirit",
        health: 20,
        basePower: 8,
        behavior: [
          { attackAmount: 8 },
          { attackAmount: 8 },
        ],
      },
      agent: (state, legalActions) => {
        const chooseTargetAction = legalActions.find((action) => action.type === "choose_target");

        if (chooseTargetAction) {
          return chooseTargetAction;
        }

        const guardianAction = legalActions.find((action) => {
          if (action.type !== "play_card") {
            return false;
          }

          const card = state.player.hand.find((entry) => entry.instanceId === action.cardInstanceId);
          return card?.definitionId === "guardian";
        });

        if (guardianAction) {
          return guardianAction;
        }

        const permanentAttack = legalActions.find(
          (action) => action.type === "use_permanent_action" && action.action === "attack",
        );

        if (permanentAttack) {
          return permanentAttack;
        }

        const attackAction = legalActions.find((action) => {
          if (action.type !== "play_card") {
            return false;
          }

          const card = state.player.hand.find((entry) => entry.instanceId === action.cardInstanceId);
          return card?.definitionId === "attack";
        });

        if (attackAction) {
          return attackAction;
        }

        return { type: "end_turn" };
      },
    });

    const secondTurnStart = result.log.find(
      (event) => event.type === "turn_started" && event.turnNumber === 2,
    );

    expect(secondTurnStart).toEqual({
      type: "turn_started",
      turnNumber: 2,
      cardsDrawn: 5,
      energy: 3,
      enemyIntent: { attackAmount: 8 },
    });
    expect(result.finalState.phase).toBe("finished");
  });

  it("rejects illegal actions selected by the simulation agent", () => {
    expect(() =>
      runSimulation({
        seed: 1,
        maxSteps: 5,
        cardDefinitions: TEST_CARD_DEFINITIONS,
        playerDeck: ["attack", "attack", "attack", "defend", "defend"],
        enemy: {
          name: "Accusing Spirit",
          health: 30,
          basePower: 8,
          behavior: [{ attackAmount: 8 }],
        },
        agent: () => ({
          type: "play_card",
          cardInstanceId: "not_a_real_card",
        }),
      }),
    ).toThrow("illegal action");
  });

  it("records attack_and_block intents in the trace and summary", () => {
    const result = runSimulation({
      seed: 1,
      maxSteps: 20,
      cardDefinitions: TEST_CARD_DEFINITIONS,
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: "Shielded Warden",
        health: 30,
        basePower: 8,
        behavior: [{ attackAmount: 8, blockAmount: 4 }],
      },
      agent: (state, legalActions) => {
        const chooseTargetAction = legalActions.find((action) => action.type === "choose_target");

        if (chooseTargetAction) {
          return chooseTargetAction;
        }

        const defendAction = legalActions.find((action) => {
          if (action.type !== "play_card") {
            return false;
          }

          const card = state.player.hand.find((entry) => entry.instanceId === action.cardInstanceId);
          return card?.definitionId === "defend";
        });

        if (state.turnNumber === 1 && defendAction) {
          return defendAction;
        }

        const attackAction = legalActions.find((action) => {
          if (action.type !== "play_card") {
            return false;
          }

          const card = state.player.hand.find((entry) => entry.instanceId === action.cardInstanceId);
          return card?.definitionId === "attack";
        });

        return attackAction ?? defendAction ?? legalActions.find((action) => action.type === "end_turn") ?? legalActions[0]!;
      },
    });

    const firstTurnStart = result.log.find(
      (event) => event.type === "turn_started" && event.turnNumber === 1,
    );
    const resolvedIntent = result.log.find((event) => event.type === "enemy_intent_resolved");
    const blockEvent = result.log.find(
      (event) =>
        event.type === "block_gained" &&
        event.turnNumber === 1 &&
        event.target === "enemy",
    );

    expect(firstTurnStart).toEqual({
      type: "turn_started",
      turnNumber: 1,
      cardsDrawn: 5,
      energy: 3,
      enemyIntent: { attackAmount: 8, blockAmount: 4 },
    });
    expect(resolvedIntent).toEqual({
      type: "enemy_intent_resolved",
      turnNumber: 1,
      intent: { attackAmount: 8, blockAmount: 4 },
    });
    expect(blockEvent).toEqual({
      type: "block_gained",
      turnNumber: 1,
      target: "enemy",
      amount: 4,
    });
    expect(result.summary.enemy.intent).toBe("attack 8 + block 4");
  });

  it("records attackTimes intents in trace output using per-hit formatting", () => {
    const result = runSimulation({
      seed: 1,
      maxSteps: 20,
      cardDefinitions: TEST_CARD_DEFINITIONS,
      playerDeck: ["attack", "attack", "attack", "attack", "attack"],
      enemy: {
        name: "Relentless Striker",
        health: 30,
        basePower: 8,
        behavior: [{ attackAmount: 6, attackTimes: 2 }],
      },
      agent: (state, legalActions) => {
        const chooseTargetAction = legalActions.find((action) => action.type === "choose_target");

        if (chooseTargetAction) {
          return chooseTargetAction;
        }

        const attackAction = legalActions.find((action) => {
          if (action.type !== "play_card") {
            return false;
          }

          const card = state.player.hand.find((entry) => entry.instanceId === action.cardInstanceId);
          return card?.definitionId === "attack";
        });

        return attackAction ?? legalActions.find((action) => action.type === "end_turn") ?? legalActions[0]!;
      },
    });

    const firstTurnStart = result.log.find(
      (event) => event.type === "turn_started" && event.turnNumber === 1,
    );
    const resolvedIntent = result.log.find((event) => event.type === "enemy_intent_resolved");

    expect(firstTurnStart).toEqual({
      type: "turn_started",
      turnNumber: 1,
      cardsDrawn: 5,
      energy: 3,
      enemyIntent: { attackAmount: 6, attackTimes: 2 },
    });
    expect(resolvedIntent).toEqual({
      type: "enemy_intent_resolved",
      turnNumber: 1,
      intent: { attackAmount: 6, attackTimes: 2 },
    });
    expect(result.summary.enemy.intent).toBe("attack 6 x2");
  });

  it("records enemy card scripts as an alternative to enemy behavior", () => {
    const result = runSimulation({
      seed: 1,
      maxSteps: 20,
      cardDefinitions: TEST_CARD_DEFINITIONS,
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: "Scripted Warden",
        health: 30,
        basePower: 8,
        cards: [
          assault(8, 1, 4),
        ],
      },
      agent: (state, legalActions) => {
        const chooseTargetAction = legalActions.find((action) => action.type === "choose_target");

        if (chooseTargetAction) {
          return chooseTargetAction;
        }

        const defendAction = legalActions.find((action) => {
          if (action.type !== "play_card") {
            return false;
          }

          const card = state.player.hand.find((entry) => entry.instanceId === action.cardInstanceId);
          return card?.definitionId === "defend";
        });

        if (state.turnNumber === 1 && defendAction) {
          return defendAction;
        }

        const attackAction = legalActions.find((action) => {
          if (action.type !== "play_card") {
            return false;
          }

          const card = state.player.hand.find((entry) => entry.instanceId === action.cardInstanceId);
          return card?.definitionId === "attack";
        });

        return attackAction ?? defendAction ?? legalActions.find((action) => action.type === "end_turn") ?? legalActions[0]!;
      },
    });

    const enemyCardPlayed = result.log.find((event) => event.type === "enemy_card_played");

    expect(enemyCardPlayed).toEqual({
      type: "enemy_card_played",
      turnNumber: 1,
      cardId: "assault_8_block_4",
    });
    expect(result.summary.enemy.intent).toBe("attack 8 + block 4");
  });

  it("heuristic agent prefers lethal when it is available", () => {
    const result = runSimulation({
      seed: 1,
      maxSteps: 10,
      agentName: "heuristic_baseline",
      cardDefinitions: TEST_CARD_DEFINITIONS,
      playerDeck: ["attack", "defend", "defend", "defend", "defend"],
      enemy: {
        name: "Accusing Spirit",
        health: 6,
        basePower: 8,
        behavior: [{ attackAmount: 8 }],
      },
      agent: chooseHeuristicDecision,
    });

    expect(result.actionHistory[0]).toEqual({
      turnNumber: 1,
      phase: "player_action",
      action: {
        type: "play_card",
        cardInstanceId: "card_1",
      },
      reason: "lethal damage available",
    });
    expect(result.finalState.phase).toBe("finished");
    expect(result.trace.config.agent).toBe("heuristic_baseline");
    expect(result.actionHistory[0]?.reason).toBe("lethal damage available");
  });

  it("heuristic agent prefers defense under heavy incoming attack", () => {
    const battleState = createTestBattle({
      playerHealth: 50,
      playerDeck: ["defend", "attack", "guardian", "guardian", "guardian"],
      enemy: {
        health: 30,
        behavior: [{ attackAmount: 14 }],
      },
    });

    const action = chooseHeuristicAction(battleState, [
      { type: "play_card", cardInstanceId: "card_1" },
      { type: "play_card", cardInstanceId: "card_2" },
      { type: "end_turn" },
    ]);

    expect(action).toEqual({
      type: "play_card",
      cardInstanceId: "card_1",
    });
  });

  it("heuristic agent values establishing a permanent over attacking into enemy block", () => {
    const battleState = createTestBattle({
      playerDeck: ["guardian", "attack", "attack", "defend", "defend"],
      enemy: {
        health: 30,
        behavior: [{ blockAmount: 8 }],
      },
    });
    battleState.enemy.block = 8;

    const action = chooseHeuristicAction(battleState, [
      { type: "play_card", cardInstanceId: "card_1" },
      { type: "play_card", cardInstanceId: "card_2" },
      { type: "end_turn" },
    ]);

    expect(action).toEqual({
      type: "play_card",
      cardInstanceId: "card_1",
    });
  });

  it("heuristic agent does not treat blocked attack damage as lethal", () => {
    const battleState = createTestBattle({
      playerHealth: 50,
      playerDeck: ["attack", "defend", "guardian", "guardian", "guardian"],
      enemy: {
        health: 6,
        behavior: [{ attackAmount: 14 }],
      },
    });
    battleState.enemy.block = 8;

    const action = chooseHeuristicAction(battleState, [
      { type: "play_card", cardInstanceId: "card_1" },
      { type: "play_card", cardInstanceId: "card_2" },
      { type: "end_turn" },
    ]);

    expect(action).toEqual({
      type: "play_card",
      cardInstanceId: "card_2",
    });
  });

  it("heuristic decision includes a readable reason", () => {
    const battleState = createTestBattle({
      playerDeck: ["guardian", "attack", "attack", "defend", "defend"],
      enemy: {
        health: 30,
        behavior: [{ blockAmount: 8 }],
      },
    });
    battleState.enemy.block = 8;

    const decision = chooseHeuristicDecision(battleState, [
      { type: "play_card", cardInstanceId: "card_1" },
      { type: "play_card", cardInstanceId: "card_2" },
      { type: "end_turn" },
    ]);

    expect(decision).toEqual({
      action: {
        type: "play_card",
        cardInstanceId: "card_1",
      },
      reason: "establish guardian on empty board",
    });
  });
});
