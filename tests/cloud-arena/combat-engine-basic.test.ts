import { describe, expect, it } from "vitest";

import { applyBattleAction, assault } from "../../src/cloud-arena/index.js";
import { createTestBattle, formatBattleLog, requireCardInstanceId } from "./helpers.js";

describe("cloud arena combat engine basic flow", () => {
  it("handles the lean v1 non-permanent combat loop deterministically", () => {
    const battle = createTestBattle({
      playerDeck: ["attack", "attack", "attack", "defend", "defend", "attack", "defend"],
      enemy: {
        name: "Accusing Spirit",
        health: 30,
        basePower: 12,
        behavior: [
          { attackAmount: 12 },
          { blockAmount: 8 },
          { attackAmount: 14 },
        ],
      }
    });
    const startingHealth = battle.player.health;

    expect(battle.turnNumber).toBe(1);
    expect(battle.phase).toBe("player_action");
    expect(battle.player.hand).toHaveLength(5);
    expect(battle.player.energy).toBe(3);
    expect(battle.enemy.intent).toEqual({ attackAmount: 12 });

    const openingHandIds = battle.player.hand.map((card) => card.definitionId);
    expect(openingHandIds).toEqual(["attack", "attack", "attack", "defend", "defend"]);

    const firstAttack = battle.player.hand[0];
    const secondAttack = battle.player.hand[1];
    const defend = battle.player.hand[3];

    if (!firstAttack || !secondAttack || !defend) {
      throw new Error("Expected opening hand cards were missing.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: firstAttack.instanceId,
    });

    expect(battle.player.energy).toBe(2);
    expect(battle.enemy.health).toBe(24);
    expect(battle.enemy.block).toBe(0);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: secondAttack.instanceId,
    });

    expect(battle.player.energy).toBe(1);
    expect(battle.enemy.health).toBe(18);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: defend.instanceId,
    });

    expect(battle.player.energy).toBe(0);
    expect(battle.player.block).toBe(7);
    expect(battle.player.discardPile).toHaveLength(3);

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(2);
    expect(battle.phase).toBe("player_action");
    expect(battle.player.health).toBe(startingHealth - 5);
    expect(battle.player.block).toBe(0);
    expect(battle.enemy.health).toBe(18);
    expect(battle.enemy.block).toBe(0);
    expect(battle.player.energy).toBe(3);
    expect(battle.enemy.intent).toEqual({ blockAmount: 8 });
    expect(battle.player.hand).toHaveLength(5);
    expect(battle.player.discardPile).toHaveLength(0);

    const turnTwoAttackCards = battle.player.hand.filter((card) => card.definitionId === "attack");
    const turnTwoDefendCards = battle.player.hand.filter((card) => card.definitionId === "defend");
    const turnTwoFirstAttack = turnTwoAttackCards[0];
    const turnTwoSecondAttack = turnTwoAttackCards[1];
    const turnTwoDefend = turnTwoDefendCards[0];

    if (!turnTwoFirstAttack || !turnTwoDefend || !turnTwoSecondAttack) {
      throw new Error("Expected turn two cards were missing.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: turnTwoFirstAttack.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: turnTwoSecondAttack.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: turnTwoDefend.instanceId,
    });

    expect(battle.enemy.health).toBe(6);
    expect(battle.player.block).toBe(7);

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(3);
    expect(battle.player.health).toBe(startingHealth - 5);
    expect(battle.player.block).toBe(0);
    expect(battle.enemy.health).toBe(6);
    expect(battle.enemy.block).toBe(8);
    expect(battle.enemy.intent).toEqual({ attackAmount: 14 });
    expect(battle.player.hand).toHaveLength(5);

    const battleFinishedEvents = battle.log.filter((event) => event.type === "battle_finished");
    expect(battleFinishedEvents).toHaveLength(0);
  });

  it("enemy defend block persists into the next player turn, then clears on the following enemy resolution", () => {
    const battle = createTestBattle({
      playerDeck: ["attack", "attack", "attack", "defend", "defend", "attack", "defend"],
      enemy: {
        name: "Accusing Spirit",
        health: 40,
        basePower: 12,
        behavior: [
          { blockAmount: 8 },
          { attackAmount: 12 },
        ],
      },
    });

    expect(battle.enemy.intent).toEqual({ blockAmount: 8 });

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(2);
    expect(battle.enemy.block).toBe(8);
    expect(battle.enemy.intent).toEqual({ attackAmount: 12 });

    const attackCard = battle.player.hand.find((card) => card.definitionId === "attack");

    if (!attackCard) {
      throw new Error("Expected an attack card on turn two.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: attackCard.instanceId,
    });

    expect(battle.enemy.block).toBe(2);

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(3);
    expect(battle.enemy.block).toBe(0);
  });

  it("enemy attack_and_block deals damage and gains block in the same resolution", () => {
    const battle = createTestBattle({
      playerDeck: ["attack", "attack", "defend", "defend", "attack"],
      enemy: {
        name: "Shielded Warden",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12, blockAmount: 5 }],
      },
    });
    const startingHealth = battle.player.health;

    expect(battle.enemy.intent).toEqual({ attackAmount: 12,
      blockAmount: 5,
    });

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: requireCardInstanceId(battle, "defend"),
    });

    expect(battle.player.block).toBe(7);

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(2);
    expect(battle.player.health).toBe(startingHealth - 5);
    expect(battle.enemy.block).toBe(5);
    expect(formatBattleLog(battle)).toContain("turn 1: enemy resolved attack 12 + block 5");
  });

  it("enemy attackTimes multiplies attack damage without changing per-hit amount formatting", () => {
    const battle = createTestBattle({
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: "Relentless Striker",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12, attackTimes: 2 }],
      },
    });
    const startingHealth = battle.player.health;

    expect(battle.enemy.intent).toEqual({ attackAmount: 12,
      attackTimes: 2,
    });

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(2);
    expect(battle.player.health).toBe(startingHealth - 24);
    expect(formatBattleLog(battle)).toContain("turn 1: enemy resolved attack 12 x2");
  });

  it("enemy attack_and_block applies attackTimes only to the attack portion", () => {
    const battle = createTestBattle({
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: "Shielded Warden",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12, blockAmount: 5, attackTimes: 2 }],
      },
    });
    const startingHealth = battle.player.health;

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(2);
    expect(battle.player.health).toBe(startingHealth - 24);
    expect(battle.enemy.block).toBe(5);
    expect(formatBattleLog(battle)).toContain("turn 1: enemy resolved attack 12 x2 + block 5");
  });

  it("enemy can use scripted enemy cards instead of raw behavior intents", () => {
    const battle = createTestBattle({
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: "Scripted Warden",
        health: 40,
        basePower: 12,
        cards: [
          assault(12, 2, 5),
        ],
      },
    });
    const startingHealth = battle.player.health;

    expect(battle.enemy.intent).toEqual({ attackAmount: 24, attackTimes: 2, blockAmount: 5 });

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(2);
    expect(battle.player.health).toBe(startingHealth - 24);
    expect(battle.enemy.block).toBe(5);
    expect(formatBattleLog(battle)).toContain("turn 1: enemy played assault_12_x2_block_5");
  });

  it("Defending Strike deals damage and grants block in one play", () => {
    const battle = createTestBattle({
      playerDeck: [
        "defending_strike",
        "attack",
        "attack",
        "defend",
        "guardian",
      ],
      enemy: {
        name: "Accusing Spirit",
        health: 20,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    const defendingStrike = battle.player.hand.find(
      (card) => card.definitionId === "defending_strike",
    );

    if (!defendingStrike) {
      throw new Error("Expected Defending Strike in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: defendingStrike.instanceId,
    });

    expect(battle.player.energy).toBe(1);
    expect(battle.enemy.health).toBe(16);
    expect(battle.player.block).toBe(4);
    expect(formatBattleLog(battle).slice(-3)).toEqual([
      "turn 1: played defending_strike",
      "turn 1: card dealt 4 damage to enemy",
      "turn 1: player gained 4 block",
    ]);
  });

  it("player attack cards can hit multiple times", () => {
    const battle = createTestBattle({
      playerDeck: ["twin_strike", "attack", "defend", "guardian", "attack"],
      enemy: {
        name: "Accusing Spirit",
        health: 20,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    const twinStrike = battle.player.hand.find((card) => card.definitionId === "twin_strike");

    if (!twinStrike) {
      throw new Error("Expected Twin Strike in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: twinStrike.instanceId,
    });

    expect(battle.enemy.health).toBe(14);
    expect(formatBattleLog(battle).slice(-2)).toEqual([
      "turn 1: played twin_strike",
      "turn 1: card dealt 6 damage to enemy",
    ]);
  });
});
