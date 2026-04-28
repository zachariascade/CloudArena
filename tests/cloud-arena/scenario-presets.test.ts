import { describe, expect, it } from "vitest";

import {
  cardDefinitions,
  cloudArenaDeckPresets,
  cloudArenaEnemyPresets,
  cloudArenaScenarioPresets,
  getDeckPreset,
  getEnemyPreset,
  getScenarioPreset,
  runSimulation,
  chooseHeuristicAction,
} from "../../src/cloud-arena/index.js";

describe("cloud arena scenario presets", () => {
  it("defines the expected scenario coverage presets", () => {
    const keys = Object.keys(cloudArenaScenarioPresets);
    expect(keys).toContain("demon_pack");
    expect(keys).toContain("lake_of_ice");
    expect(keys).toContain("imp_caller");
    expect(keys).toContain("malchior_binder_of_wills");
    expect(keys).toContain("viper_shade");
  });

  it("exposes reusable deck and enemy preset registries", () => {
    const deckKeys = Object.keys(cloudArenaDeckPresets);
    expect(deckKeys).toContain("master_deck");
    expect(deckKeys).toContain("mixed_guardian");

    const enemyKeys = Object.keys(cloudArenaEnemyPresets);
    expect(enemyKeys).toContain("demon_pack");
    expect(enemyKeys).toContain("lake_of_ice");
    expect(enemyKeys).toContain("grunt_demon");
    expect(enemyKeys).toContain("bruiser_demon");
    expect(enemyKeys).toContain("warder_demon");
    expect(enemyKeys).toContain("imp_caller");
    expect(enemyKeys).toContain("malchior_binder_of_wills");
    expect(enemyKeys).toContain("long_battle_demon");
    expect(enemyKeys).toContain("viper_shade");
  });

  it("keeps enemy-only slash cards out of the master deck preset", () => {
    const masterDeck = getDeckPreset("master_deck");

    expect(masterDeck.cards).not.toContain("single_slash");
    expect(masterDeck.cards).not.toContain("double_slash");
    expect(masterDeck.cards).not.toContain("triple_slash");
    expect(masterDeck.cards).not.toContain("cross_slash");
    expect(masterDeck.cards).not.toContain("multi_slash");
    expect(masterDeck.cards).not.toContain("token_imp");
  });

  it("builds scenarios from swappable deck and enemy presets", () => {
    const demonPack = getScenarioPreset("demon_pack");
    const lakeOfIce = getScenarioPreset("lake_of_ice");
    const mixedGuardianDeck = getDeckPreset("mixed_guardian");
    const impCaller = getScenarioPreset("imp_caller");
    const malchior = getScenarioPreset("malchior_binder_of_wills");

    const viperShade = getScenarioPreset("viper_shade");

    expect(demonPack.deck).toBe(mixedGuardianDeck.cards);
    expect(demonPack.enemies[0]).toBe(getEnemyPreset("demon_pack"));
    expect(lakeOfIce.enemies[0]).toBe(getEnemyPreset("lake_of_ice"));
    expect(impCaller.enemies[0]).toBe(getEnemyPreset("imp_caller"));
    expect(malchior.enemies[0]).toBe(getEnemyPreset("malchior_binder_of_wills"));
    expect(viperShade.enemies[0]).toBe(getEnemyPreset("viper_shade"));
  });

  it("keeps the demon pack scenario wired to its deck and enemy plan", () => {
    const demonPack = getScenarioPreset("demon_pack");

    expect(demonPack.deck.length).toBeGreaterThan(0);
    expect(demonPack.enemies[0]?.cards?.length).toBeGreaterThan(0);
    expect(demonPack.enemies.map((enemy) => enemy.definitionId)).toEqual([
      "enemy_pack_alpha",
      "enemy_cocytus",
      "enemy_brute",
    ]);
  });

  it("exposes the new low-tier enemy families and pack bodies", () => {
    const grunt = getEnemyPreset("grunt_demon");
    const pack = getEnemyPreset("demon_pack");
    const lakeOfIce = getEnemyPreset("lake_of_ice");
    const bruiser = getEnemyPreset("bruiser_demon");
    const warder = getEnemyPreset("warder_demon");
    const impCaller = getEnemyPreset("imp_caller");
    const malchior = getEnemyPreset("malchior_binder_of_wills");
    const longBattleDemon = getEnemyPreset("long_battle_demon");

    expect(grunt.basePower).toBeGreaterThan(0);
    expect(pack.definitionId).toBe("enemy_pack_alpha");
    expect(lakeOfIce.definitionId).toBe("enemy_cocytus");
    expect(lakeOfIce.cards?.length).toBeGreaterThan(0);
    expect(lakeOfIce.cards?.some((card) => card.id === "enemy_demon_pierce")).toBe(true);
    expect(bruiser.definitionId).toBe("enemy_brute");
    expect(bruiser.basePower).toBeGreaterThan(0);
    expect(warder.definitionId).toBe("enemy_husk");
    expect(warder.basePower).toBeGreaterThan(0);
    expect(impCaller.startingTokens).toEqual(["token_imp"]);
    expect(
      impCaller.cards?.some((card) =>
        card.effects.some((effect) => effect.spawnCardId === "token_imp"),
      ),
    ).toBe(true);
    expect(malchior.definitionId).toBe("enemy_malchior");
    expect(malchior.basePower).toBeGreaterThan(0);
    expect(malchior.cards?.length).toBeGreaterThan(0);
    expect(longBattleDemon.definitionId).toBe("enemy_long_battle_demon");
    expect(longBattleDemon.cards?.length).toBeGreaterThan(0);

    const viperShade = getEnemyPreset("viper_shade");
    expect(viperShade.definitionId).toBe("enemy_viper_shade");
    expect(viperShade.basePower).toBeGreaterThan(0);
    expect(viperShade.cards?.length).toBeGreaterThan(0);
  });

  it("supports the demon pack preset running through simulation", () => {
    const scenario = getScenarioPreset("demon_pack");
    const result = runSimulation({
      seed: 3,
      playerHealth: scenario.playerHealth,
      cardDefinitions,
      playerDeck: scenario.deck,
      enemy: {
        name: scenario.enemies[0]!.name,
        health: scenario.enemies[0]!.health,
        basePower: scenario.enemies[0]!.basePower,
        cards: scenario.enemies[0]!.cards!,
        leaderDefinitionId: scenario.enemies[0]!.definitionId,
      },
      maxSteps: scenario.recommendedMaxSteps,
      agentName: "heuristic_baseline",
      agent: chooseHeuristicAction,
    });

    const totalDrawn = result.log.filter(
      (event) => event.type === "card_drawn",
    ).length;

    expect(result.trace.config.playerDeck).toEqual(scenario.deck);
    expect(totalDrawn).toBeGreaterThan(0);
  });
});
