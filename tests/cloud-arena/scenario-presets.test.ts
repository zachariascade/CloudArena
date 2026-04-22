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
    expect(Object.keys(cloudArenaScenarioPresets)).toEqual([
      "demon_pack",
      "imp_caller",
    ]);
  });

  it("exposes reusable deck and enemy preset registries", () => {
    expect(Object.keys(cloudArenaDeckPresets)).toEqual([
      "master_deck",
      "wide_angels",
      "tall_creatures",
      "mixed_guardian",
    ]);
    expect(Object.keys(cloudArenaEnemyPresets)).toEqual([
      "demon_pack",
      "grunt_demon",
      "bruiser_demon",
      "warder_demon",
      "imp_caller",
      "long_battle_demon",
    ]);
  });

  it("builds scenarios from swappable deck and enemy presets", () => {
    const demonPack = getScenarioPreset("demon_pack");
    const mixedGuardianDeck = getDeckPreset("mixed_guardian");
    const impCaller = getScenarioPreset("imp_caller");

    expect(demonPack.deck).toBe(mixedGuardianDeck.cards);
    expect(demonPack.enemy).toBe(getEnemyPreset("demon_pack"));
    expect(impCaller.enemy).toBe(getEnemyPreset("imp_caller"));
  });

  it("keeps the demon pack scenario wired to its deck and enemy plan", () => {
    const demonPack = getScenarioPreset("demon_pack");

    expect(demonPack.deck.length).toBeGreaterThan(0);
    expect(demonPack.enemy.cards.length).toBeGreaterThanOrEqual(3);
  });

  it("exposes the new low-tier enemy families and pack bodies", () => {
    const grunt = getEnemyPreset("grunt_demon");
    const pack = getEnemyPreset("demon_pack");
    const bruiser = getEnemyPreset("bruiser_demon");
    const warder = getEnemyPreset("warder_demon");
    const impCaller = getEnemyPreset("imp_caller");

    expect(grunt.basePower).toBe(5);
    expect(pack.leaderDefinitionId).toBe("enemy_pack_alpha");
    expect(pack.startingPermanents).toEqual(["enemy_husk", "enemy_brute"]);
    expect(bruiser.basePower).toBe(6);
    expect(warder.basePower).toBe(4);
    expect(impCaller.startingTokens).toEqual(["token_imp"]);
    expect(impCaller.cards.some((card) => card.effects.some((effect) => effect.spawnCardId === "token_imp"))).toBe(true);
  });

  it("supports the demon pack preset running through simulation", () => {
    const scenario = getScenarioPreset("demon_pack");
    const result = runSimulation({
      seed: 3,
      playerHealth: scenario.playerHealth,
      cardDefinitions,
      playerDeck: scenario.deck,
      enemy: scenario.enemy,
      maxSteps: scenario.recommendedMaxSteps,
      agentName: "heuristic_baseline",
      agent: chooseHeuristicAction,
    });

    const totalDrawn = result.log
      .filter((event) => event.type === "card_drawn")
      .length;

    expect(result.trace.config.playerDeck).toEqual(scenario.deck);
    expect(totalDrawn).toBeGreaterThan(0);
  });
});
