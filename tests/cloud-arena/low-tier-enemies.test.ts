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

    expect(battle.enemy.intent).toEqual({ attackAmount: 5 });

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

    const startingTokens = battle.enemyBattlefield.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    const startingHealth = battle.player.health;

    expect(startingTokens.map((token) => token.definitionId)).toEqual(["token_imp"]);
    expect(battle.enemy.intent).toEqual({ spawnCardId: "token_imp", spawnCount: 1 });

    applyBattleAction(battle, { type: "end_turn" });

    const tokensAfterSpawn = battle.enemyBattlefield.filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    expect(tokensAfterSpawn.length).toBe(2);
    expect(battle.player.health).toBe(startingHealth - 4);
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
    const targetToken = battle.enemyBattlefield.find((entry) => entry !== null);

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
});
