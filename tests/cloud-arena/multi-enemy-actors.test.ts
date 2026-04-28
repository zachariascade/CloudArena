import { describe, expect, it } from "vitest";

import { createBattle, type CardDefinitionLibrary } from "../../src/cloud-arena/index.js";

const MULTI_ENEMY_CARD_DEFINITIONS: CardDefinitionLibrary = {
  test_alpha: {
    id: "test_alpha",
    name: "Test Alpha",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 3,
    health: 10,
    abilities: [],
  },
  test_brute: {
    id: "test_brute",
    name: "Test Brute",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 4,
    health: 8,
    abilities: [],
  },
  test_shade: {
    id: "test_shade",
    name: "Test Shade",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 2,
    health: 6,
    abilities: [],
  },
  attack: {
    id: "attack",
    name: "Attack",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [{ attackAmount: 6, target: "enemy" }],
  },
  defend: {
    id: "defend",
    name: "Defend",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [{ blockAmount: 7, target: "player" }],
  },
};

const TEST_ENEMIES = [
  { definitionId: "test_alpha" as const, name: "Pack Alpha", health: 15, basePower: 3 },
  { definitionId: "test_brute" as const, name: "Pack Brute", health: 12, basePower: 4 },
  { definitionId: "test_shade" as const, name: "Pack Shade", health: 8, basePower: 2 },
];

describe("multi-enemy actor state", () => {
  it("creates a real enemy actor for each enemy entry", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions: MULTI_ENEMY_CARD_DEFINITIONS,
      playerDeck: ["attack", "defend", "attack", "defend", "attack"],
      enemies: TEST_ENEMIES.map((enemy) => ({
        definitionId: enemy.definitionId,
        name: enemy.name,
        health: enemy.health,
        basePower: enemy.basePower,
        leaderDefinitionId: enemy.definitionId,
        cards: [{ id: `${enemy.definitionId}_attack`, name: "Attack", effects: [{ attackPowerMultiplier: 1, target: "player" as const }] }],
      })),
    });

    expect(battle.enemies).toHaveLength(3);
    expect(battle.enemies.map((enemy) => ({
      definitionId: enemy.definitionId,
      name: enemy.name,
      health: enemy.health,
      basePower: enemy.basePower,
    }))).toEqual(
      TEST_ENEMIES.map((enemy) => ({
        definitionId: enemy.definitionId,
        name: enemy.name,
        health: enemy.health,
        basePower: enemy.basePower,
      })),
    );
    expect(battle.enemies.map((enemy) => enemy.permanentId)).toEqual(
      battle.enemyBattlefield
        .filter((permanent): permanent is NonNullable<typeof permanent> => permanent !== null)
        .map((permanent) => permanent.instanceId),
    );
    expect(
      battle.enemyBattlefield
        .filter((permanent): permanent is NonNullable<typeof permanent> => permanent !== null)
        .map((permanent) => permanent.enemyActorId),
    ).toEqual(battle.enemies.map((enemy) => enemy.id));
    expect(battle.enemy.name).toBe(battle.enemies[0]?.name);
    expect(battle.enemy.leaderPermanentId).toBe(battle.enemies[0]?.permanentId ?? null);
  });
});
