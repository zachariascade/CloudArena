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
      "lake_of_ice",
      "imp_caller",
      "malchior_binder_of_wills",
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
      "lake_of_ice",
      "grunt_demon",
      "bruiser_demon",
      "warder_demon",
      "imp_caller",
      "malchior_binder_of_wills",
      "long_battle_demon",
    ]);
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

    expect(demonPack.deck).toBe(mixedGuardianDeck.cards);
    expect(demonPack.enemy).toBe(getEnemyPreset("demon_pack"));
    expect(lakeOfIce.enemy).toBe(getEnemyPreset("lake_of_ice"));
    expect(impCaller.enemy).toBe(getEnemyPreset("imp_caller"));
    expect(malchior.enemy).toBe(getEnemyPreset("malchior_binder_of_wills"));
  });

  it("keeps the demon pack scenario wired to its deck and enemy plan", () => {
    const demonPack = getScenarioPreset("demon_pack");

    expect(demonPack.deck.length).toBeGreaterThan(0);
    expect(demonPack.enemy.cards.length).toBe(3);
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

    expect(grunt.basePower).toBe(5);
    expect(pack.leaderDefinitionId).toBe("enemy_pack_alpha");
    expect(pack.startingPermanents).toEqual(["enemy_husk", "enemy_brute"]);
    expect(lakeOfIce.leaderDefinitionId).toBe("enemy_cocytus");
    expect(lakeOfIce.cards).toHaveLength(4);
    expect(lakeOfIce.cards.some((card) => card.effects.some((effect) => effect.powerDeltaAllPermanents === -1))).toBe(true);
    expect(bruiser.basePower).toBe(6);
    expect(warder.basePower).toBe(4);
    expect(impCaller.startingTokens).toEqual(["token_imp"]);
    expect(impCaller.cards.some((card) => card.effects.some((effect) => effect.spawnCardId === "token_imp"))).toBe(true);
    expect(malchior.leaderDefinitionId).toBe("enemy_malchior");
    expect(malchior.basePower).toBe(4);
    expect(malchior.cards).toHaveLength(5);
    expect(longBattleDemon.leaderDefinitionId).toBe("enemy_long_battle_demon");
    expect(longBattleDemon.cards).toHaveLength(3);
    expect(malchior.cards[0]).toMatchObject({
      id: "malchior_eldritch_aegis",
      effects: [
        { attackPowerMultiplier: 1, target: "player" },
        { blockAmount: 10, target: "enemy" },
      ],
    });
    expect(malchior.cards[1]).toMatchObject({
      id: "malchior_siphon_resolve",
      effects: [{ energyDelta: -1, target: "player" }],
    });
    expect(malchior.cards[2]).toMatchObject({
      id: "malchior_crushing_edict",
      effects: [{ attackPowerMultiplier: 2, target: "player" }],
    });
    expect(malchior.cards[3]).toMatchObject({
      id: "malchior_chain_of_command",
      effects: [{ powerDeltaTargetPermanents: -1, target: "player" }],
    });
    expect(malchior.cards[4]).toMatchObject({
      id: "malchior_twin_subjugation",
      effects: [{ attackPowerMultiplier: 2, attackTimes: 2, target: "player" }],
    });
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
