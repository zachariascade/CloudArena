import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  getDerivedPermanentStat,
  getEnemyPlanStepAtIndexFromInput,
  formatEnemyIntent,
} from "../../src/cloud-arena/index.js";
import { createTestBattle, formatBattleLog } from "./helpers.js";

describe("cloud arena low-tier enemies", () => {
  it("resolves grunt demon attacks from base power", () => {
    const battle = createTestBattle({
      playerDeck: ["attack", "attack", "defend", "attack", "defend"],
      enemy: {
        name: "Test Attacker",
        health: 18,
        basePower: 5,
        cards: [
          { id: "single_slash", name: "Single Slash", effects: [{ attackPowerMultiplier: 1, target: "player" }] },
          { id: "single_slash_2", name: "Single Slash", effects: [{ attackPowerMultiplier: 1, target: "player" }] },
          { id: "single_slash_3", name: "Single Slash", effects: [{ attackPowerMultiplier: 1, target: "player" }] },
        ],
      },
    });

    const startingHealth = battle.player.health;
    const leader = battle.enemyBattlefield.find((entry) => entry?.isEnemyLeader);

    expect(battle.enemy.intent).toEqual({ attackAmount: 5 });
    expect(leader?.name).toBe("Test Attacker");
    expect(leader?.definitionId).toBe("enemy_leader");

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.player.health).toBe(startingHealth - 5);
    expect(formatBattleLog(battle)).toContain("turn 1: enemy resolved attack 5");
  });

  it("lets a power-scaling enemy gain power and scale later attacks", () => {
    const battle = createTestBattle({
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: "Test Bruiser",
        health: 24,
        basePower: 6,
        cards: [
          { id: "cross_slash", name: "Cross Slash", effects: [{ attackPowerMultiplier: 1, attackTimes: 2, target: "player" }] },
          { id: "gain_power_1", name: "Gain Power", effects: [{ powerDelta: 1, target: "enemy" }] },
          { id: "cross_slash_2", name: "Cross Slash", effects: [{ attackPowerMultiplier: 1, attackTimes: 2, target: "player" }] },
        ],
      },
    });

    const startingHealth = battle.player.health;

    expect(battle.enemy.intent).toEqual({ attackAmount: 6, attackTimes: 2 });

    applyBattleAction(battle, { type: "end_turn" });
    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.enemy.basePower).toBe(7);
    expect(battle.player.health).toBe(startingHealth - 12);
    expect(formatBattleLog(battle)).toContain("turn 2: enemy gained 1 power, base power now 7");
  });

  it("starts a token-spawning enemy with tokens and spawns more during combat", () => {
    const battle = createTestBattle({
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: "Test Spawner",
        health: 20,
        basePower: 3,
        startingTokens: ["token_imp"],
        cards: [
          { id: "token_imp_spawn_1", name: "Spawn token_imp", effects: [{ spawnCardId: "token_imp", spawnCount: 1, target: "enemy" }] },
          { id: "single_slash", name: "Single Slash", effects: [{ attackPowerMultiplier: 1, target: "player" }] },
          { id: "token_imp_spawn_2", name: "Spawn 2 token_imps", effects: [{ spawnCardId: "token_imp", spawnCount: 2, target: "enemy" }] },
        ],
      },
    });

    const startingTokens = battle.enemyBattlefield.filter(
      (entry): entry is NonNullable<typeof entry> => entry !== null && !entry.isEnemyLeader,
    );
    const startingHealth = battle.player.health;

    expect(startingTokens.map((token) => token.definitionId)).toEqual(["token_imp"]);
    expect(battle.enemy.intent).toEqual({ spawnCardId: "token_imp", spawnCount: 1 });

    applyBattleAction(battle, { type: "end_turn" });

    const tokensAfterSpawn = battle.enemyBattlefield.filter(
      (entry): entry is NonNullable<typeof entry> => entry !== null && !entry.isEnemyLeader,
    );

    expect(tokensAfterSpawn.length).toBe(2);
    expect(battle.player.health).toBe(startingHealth - 2);
    expect(formatBattleLog(battle)).toContain("turn 1: enemy played token_imp_spawn_1");
  });

  it("lets the player target an enemy token directly", () => {
    const battle = createTestBattle({
      playerDeck: ["enemy_targeted_smite", "attack", "defend", "attack", "defend"],
      enemy: {
        name: "Test Spawner",
        health: 20,
        basePower: 3,
        startingTokens: ["token_imp"],
        cards: [
          { id: "token_imp_spawn_1", name: "Spawn token_imp", effects: [{ spawnCardId: "token_imp", spawnCount: 1, target: "enemy" }] },
          { id: "single_slash", name: "Single Slash", effects: [{ attackPowerMultiplier: 1, target: "player" }] },
          { id: "token_imp_spawn_2", name: "Spawn 2 token_imps", effects: [{ spawnCardId: "token_imp", spawnCount: 2, target: "enemy" }] },
        ],
      },
    });

    const targetedSmite = battle.player.hand.find((card) => card.definitionId === "enemy_targeted_smite");
    const targetToken = battle.enemyBattlefield.find(
      (entry): entry is NonNullable<typeof entry> => entry !== null && entry.definitionId === "token_imp",
    );

    if (!targetedSmite || !targetToken) {
      throw new Error("Expected a targeted smite and an enemy token in the opening state.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: targetedSmite.instanceId,
    });

    expect(battle.pendingTargetRequest).toBeTruthy();
    expect(battle.pendingTargetRequest?.selector.zone).toBe("enemy_battlefield");

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: targetToken.instanceId,
    });

    expect(targetToken.health).toBe(1);
    expect(battle.pendingTargetRequest).toBeNull();
  });

  it("does not let a spawned token attack on the same resolution step", () => {
    const battle = createTestBattle({
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: "Test Spawner",
        health: 20,
        basePower: 3,
        startingTokens: ["token_imp"],
        cards: [
          { id: "token_imp_spawn_1", name: "Spawn token_imp", effects: [{ spawnCardId: "token_imp", spawnCount: 1, target: "enemy" }] },
          { id: "single_slash", name: "Single Slash", effects: [{ attackPowerMultiplier: 1, target: "player" }] },
          { id: "token_imp_spawn_2", name: "Spawn 2 token_imps", effects: [{ spawnCardId: "token_imp", spawnCount: 2, target: "enemy" }] },
        ],
      },
    });

    const startingHealth = battle.player.health;

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.player.health).toBe(startingHealth - 2);
    expect(
      battle.enemyBattlefield.filter(
        (entry): entry is NonNullable<typeof entry> => entry !== null && entry.definitionId === "token_imp",
      ),
    ).toHaveLength(2);
  });

  it("starts a multi-enemy pack encounter with multiple enemy permanents", () => {
    const battle = createTestBattle({
      playerDeck: ["attack", "defend", "attack", "defend", "attack"],
      enemy: {
        name: "Demon Pack",
        health: 24,
        basePower: 3,
        cards: [
          { id: "attack_once_1", name: "Attack Once 1", effects: [{ target: "player", attackAmount: 3 }] },
          { id: "attack_once_2", name: "Attack Once 2", effects: [{ target: "player", attackAmount: 3 }] },
          { id: "attack_once_3", name: "Attack Once 3", effects: [{ target: "player", attackAmount: 3 }] },
          { id: "weaken_all_permanents", name: "Weaken All Permanents", effects: [{ target: "enemy", powerDeltaAllPermanents: -1 }] },
        ],
        startingPermanents: ["enemy_husk", "enemy_brute"],
      },
    });

    const enemyBodies = battle.enemyBattlefield.filter(
      (entry): entry is NonNullable<typeof entry> => entry !== null,
    );

    expect(enemyBodies).toHaveLength(3);
    expect(enemyBodies.filter((entry) => entry.definitionId === "enemy_husk")).toHaveLength(1);
    expect(enemyBodies.filter((entry) => entry.definitionId === "enemy_brute")).toHaveLength(1);
    expect(battle.enemyBattlefield.some((entry) => entry?.isEnemyLeader)).toBe(true);

    const startHealth = battle.player.health;
    applyBattleAction(battle, { type: "end_turn" });

    const actedPermanents = battle.log.filter(
      (event): event is Extract<(typeof battle.log)[number], { type: "permanent_acted" }> =>
        event.type === "permanent_acted" && event.turnNumber === 1,
    );

    expect(actedPermanents.map((event) => event.permanentId).sort()).toEqual([
      "enemy_brute_1_3",
      "enemy_husk_1_2",
    ]);
    expect(battle.player.health).toBeLessThan(startHealth);
  });

  it("resolves an immediate block card when it becomes active", () => {
    const immediateBlockCard = {
      id: "gain_block_equal_health",
      name: "Gain Block Equal To Health",
      effects: [{ blockHealthMultiplier: 1, target: "enemy" as const, resolveTiming: "immediate" as const }],
    };

    const battle = createTestBattle({
      playerDeck: ["attack", "defend", "attack", "defend", "attack"],
      enemy: {
        name: "Test Blocker",
        health: 24,
        basePower: 3,
        cards: [
          { id: "single_slash", name: "Single Slash", effects: [{ attackPowerMultiplier: 1, target: "player" as const }] },
          immediateBlockCard,
          { id: "cross_slash", name: "Cross Slash", effects: [{ attackPowerMultiplier: 1, attackTimes: 2, target: "player" as const }] },
        ],
        startingPermanents: ["enemy_husk", "enemy_brute"],
      },
    });

    expect(battle.enemy.intent).toEqual({ attackAmount: 3 });
    expect(battle.enemy.block).toBe(0);

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(2);
    expect(battle.enemy.block).toBe(24);
    expect(battle.enemy.intent).toEqual({});
  });

  it("applies a battlefield-wide debuff to permanents for a turn", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "defend", "attack", "defend", "attack"],
      playerHealth: 100,
      enemy: {
        name: "Test Debuffer",
        health: 28,
        basePower: 4,
        cards: [
          { id: "single_slash", name: "Single Slash", effects: [{ attackPowerMultiplier: 1, target: "player" as const }] },
          { id: "double_slash", name: "Double Slash", effects: [{ attackPowerMultiplier: 2, target: "player" as const }] },
          { id: "triple_slash", name: "Triple Slash", effects: [{ attackPowerMultiplier: 3, target: "player" as const }] },
          { id: "weaken_all_permanents_1", name: "Weaken All Permanents", effects: [{ target: "enemy" as const, powerDeltaAllPermanents: -1 }] },
        ],
        startingPermanents: ["enemy_husk", "enemy_brute"],
      },
    });

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");

    if (!guardianCard) {
      throw new Error("Expected guardian in the opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    const guardian = battle.battlefield.find((entry) => entry?.definitionId === "guardian");

    if (!guardian) {
      throw new Error("Expected guardian on the battlefield.");
    }

    expect(getDerivedPermanentStat(battle, guardian, "power")).toBe(4);

    applyBattleAction(battle, { type: "end_turn" });
    applyBattleAction(battle, { type: "end_turn" });
    applyBattleAction(battle, { type: "end_turn" });

    const enemyLeader = battle.enemyBattlefield.find((entry) => entry?.isEnemyLeader);

    expect(enemyLeader?.intentLabel).toBe("Debuff");
    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(5);
    expect(getDerivedPermanentStat(battle, guardian, "power")).toBe(3);

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(6);
    expect(getDerivedPermanentStat(battle, guardian, "power")).toBe(4);
  });

  it("formats the battlefield-wide debuff intent as Debuff", () => {
    const enemyInput = {
      name: "Test Debuffer",
      health: 28,
      basePower: 4,
      cards: [
        { id: "single_slash", name: "Single Slash", effects: [{ attackPowerMultiplier: 1, target: "player" as const }] },
        { id: "double_slash", name: "Double Slash", effects: [{ attackPowerMultiplier: 2, target: "player" as const }] },
        { id: "triple_slash", name: "Triple Slash", effects: [{ attackPowerMultiplier: 3, target: "player" as const }] },
        { id: "weaken_all_permanents_1", name: "Weaken All Permanents", effects: [{ target: "enemy" as const, powerDeltaAllPermanents: -1 }] },
      ],
    };

    const step = getEnemyPlanStepAtIndexFromInput(enemyInput, 3);

    if (!step) {
      throw new Error("Expected the debuff step.");
    }

    expect(formatEnemyIntent(step.intent)).toBe("Debuff");
  });
});
