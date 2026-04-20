import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
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

    expect(battle.enemy.intent).toEqual({ attackAmount: 12, attackTimes: 2 });

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
          { id: "attack_once", name: "Attack Once", effects: [{ target: "player", attackAmount: 3 }] },
          { id: "gain_block", name: "Gain Block", effects: [{ target: "enemy", blockPowerMultiplier: 1 }] },
          { id: "attack_twice", name: "Attack Twice", effects: [{ target: "player", attackAmount: 3, attackTimes: 2 }] },
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
});
