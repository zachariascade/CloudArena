import { describe, expect, it } from "vitest";

import { createScenarioBattle, getScenarioPreset } from "../../src/cloud-arena/index.js";

describe("multi-enemy actor state", () => {
  it("creates a real enemy actor for each scenario enemy preset", () => {
    const scenario = getScenarioPreset("demon_pack");
    const battle = createScenarioBattle(scenario, scenario.deck, 1, false);

    expect(battle.enemies).toHaveLength(3);
    expect(battle.enemies.map((enemy) => ({
      definitionId: enemy.definitionId,
      name: enemy.name,
      health: enemy.health,
      basePower: enemy.basePower,
    }))).toEqual(
      scenario.enemies.map((enemy) => ({
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
