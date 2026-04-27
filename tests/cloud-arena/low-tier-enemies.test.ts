import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  getDerivedPermanentStat,
  getEnemyPlanStepAtIndexFromInput,
  formatEnemyIntent,
  getEnemyPreset,
} from "../../src/cloud-arena/index.js";
import { createTestBattle, formatBattleLog } from "./helpers.js";

describe("cloud arena low-tier enemies", () => {
  it("resolves grunt demon attacks from base power", () => {
    const preset = getEnemyPreset("grunt_demon");
    const battle = createTestBattle({
      playerDeck: ["attack", "attack", "defend", "attack", "defend"],
      enemy: {
        name: preset.name,
        health: preset.health,
        basePower: preset.basePower,
        cards: preset.cards,
      },
    });

    const startingHealth = battle.player.health;
    const leader = battle.enemyBattlefield.find((entry) => entry?.isEnemyLeader);

    expect(battle.enemy.intent).toEqual({ attackAmount: 5 });
    expect(leader?.name).toBe("Grunt Demon");
    expect(leader?.definitionId).toBe("enemy_leader");

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.player.health).toBe(startingHealth - 5);
    expect(formatBattleLog(battle)).toContain("turn 1: enemy resolved attack 5");
  });

  it("lets bruiser demon gain power and scale later attacks", () => {
    const preset = getEnemyPreset("bruiser_demon");
    const battle = createTestBattle({
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: preset.name,
        health: preset.health,
        basePower: preset.basePower,
        cards: preset.cards,
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

  it("starts imp caller with tokens and spawns more during combat", () => {
    const preset = getEnemyPreset("imp_caller");
    const battle = createTestBattle({
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: preset.name,
        health: preset.health,
        basePower: preset.basePower,
        cards: preset.cards,
        startingTokens: preset.startingTokens,
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
    const preset = getEnemyPreset("imp_caller");
    const battle = createTestBattle({
      playerDeck: ["enemy_targeted_smite", "attack", "defend", "attack", "defend"],
      enemy: {
        name: preset.name,
        health: preset.health,
        basePower: preset.basePower,
        cards: preset.cards,
        startingTokens: preset.startingTokens,
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

  it("does not let a spawned imp attack on the same resolution step", () => {
    const preset = getEnemyPreset("imp_caller");
    const battle = createTestBattle({
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: preset.name,
        health: preset.health,
        basePower: preset.basePower,
        cards: preset.cards,
        startingTokens: preset.startingTokens,
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

  it("resolves demon pack block card immediately when it becomes active", () => {
    const preset = getEnemyPreset("demon_pack");
    const battle = createTestBattle({
      playerDeck: ["attack", "defend", "attack", "defend", "attack"],
      enemy: {
        name: preset.name,
        health: preset.health,
        basePower: preset.basePower,
        cards: preset.cards,
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

  it("applies the lake of ice weakening card to all permanents for a turn", () => {
    const preset = getEnemyPreset("lake_of_ice");
    const battle = createTestBattle({
      playerDeck: ["guardian", "defend", "attack", "defend", "attack"],
      playerHealth: 100,
      enemy: {
        name: preset.name,
        health: preset.health,
        basePower: preset.basePower,
        cards: preset.cards,
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

  it("formats the lake of ice battlefield-wide debuff as Debuff", () => {
    const preset = getEnemyPreset("lake_of_ice");
    const step = getEnemyPlanStepAtIndexFromInput(
      {
        name: preset.name,
        health: preset.health,
        basePower: preset.basePower,
        cards: preset.cards,
      },
      3,
    );

    if (!step) {
      throw new Error("Expected the lake of ice debuff step.");
    }

    expect(formatEnemyIntent(step.intent)).toBe("Debuff");
  });
});
