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
    expect(Object.keys(cloudArenaScenarioPresets)).toEqual(["mixed_guardian"]);
  });

  it("exposes reusable deck and enemy preset registries", () => {
    expect(Object.keys(cloudArenaDeckPresets)).toEqual(["mixed_guardian"]);
    expect(Object.keys(cloudArenaEnemyPresets)).toEqual(["long_battle_demon"]);
  });

  it("builds scenarios from swappable deck and enemy presets", () => {
    const mixedGuardian = getScenarioPreset("mixed_guardian");
    const mixedGuardianDeck = getDeckPreset("mixed_guardian");
    const longBattleDemon = getEnemyPreset("long_battle_demon");

    expect(mixedGuardian.deck).toBe(mixedGuardianDeck.cards);
    expect(mixedGuardian.enemy).toBe(longBattleDemon);
  });

  it("keeps the mixed guardian scenario wired to its deck and enemy plan", () => {
    const mixedGuardian = getScenarioPreset("mixed_guardian");

    expect(mixedGuardian.deck).toContain("guardian");
    expect(mixedGuardian.deck).toContain("graveyard_hymn");
    expect(mixedGuardian.deck.filter((card) => card === "token_angel")).toHaveLength(3);
    expect(mixedGuardian.deck.length).toBeGreaterThanOrEqual(10);
    expect(mixedGuardian.enemy.cards.length).toBeGreaterThanOrEqual(3);
  });

  it("supports the mixed guardian preset running through simulation", () => {
    const scenario = getScenarioPreset("mixed_guardian");
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
