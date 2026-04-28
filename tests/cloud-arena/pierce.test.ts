import { describe, expect, it } from "vitest";

import { applyBattleAction } from "../../src/cloud-arena/core/engine.js";
import type { CardDefinition } from "../../src/cloud-arena/core/types.js";
import { createTestBattle, TEST_CARD_DEFINITIONS } from "./helpers.js";

const PIERCE_ATTACKER_DEFINITION: CardDefinition = {
  id: "pierce_attacker",
  name: "Pierce Attacker",
  cardTypes: ["creature"],
  cost: 0,
  onPlay: [],
  power: 5,
  health: 5,
  keywords: ["pierce"],
  abilities: [],
};

const BLOCKING_WALL_DEFINITION: CardDefinition = {
  id: "blocking_wall",
  name: "Blocking Wall",
  cardTypes: ["creature"],
  cost: 0,
  onPlay: [],
  power: 1,
  health: 8,
  abilities: [],
};

const PIERCE_ENEMY_DEFINITION: CardDefinition = {
  id: "pierce_enemy",
  name: "Pierce Enemy",
  cardTypes: ["creature"],
  cost: 0,
  onPlay: [],
  power: 6,
  health: 6,
  keywords: ["pierce"],
  abilities: [],
};

describe("pierce keyword", () => {
  it("lets attacks ignore block on enemy permanents", () => {
    const battle = createTestBattle({
      cardDefinitions: {
        ...TEST_CARD_DEFINITIONS,
        pierce_attacker: PIERCE_ATTACKER_DEFINITION,
        blocking_wall: BLOCKING_WALL_DEFINITION,
      },
      playerDeck: ["pierce_attacker", "attack", "defend", "attack", "attack"],
      enemy: {
        name: "Shield Dummy",
        health: 30,
        basePower: 0,
        leaderDefinitionId: "enemy_leader",
        behavior: [{ attackAmount: 0 }],
        startingPermanents: ["blocking_wall"],
      },
    });

    const attackerCard = battle.player.hand.find((card) => card.definitionId === "pierce_attacker");
    const blockingWall = battle.enemyBattlefield.find((permanent) => permanent?.definitionId === "blocking_wall");

    if (!attackerCard || !blockingWall) {
      throw new Error("Expected pierce attacker and blocking wall in play.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: attackerCard.instanceId,
    });

    applyBattleAction(battle, { type: "end_turn" });

    const postResetBlockingWall = battle.enemyBattlefield.find((permanent) => permanent?.definitionId === "blocking_wall");
    if (!postResetBlockingWall) {
      throw new Error("Expected blocking wall after the round reset.");
    }

    postResetBlockingWall.block = 4;

    const attacker = battle.battlefield.find((permanent) => permanent?.definitionId === "pierce_attacker");

    if (!attacker) {
      throw new Error("Expected pierce attacker on the battlefield.");
    }

    expect(attacker.keywords).toContain("pierce");

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: attacker.instanceId,
      action: "attack",
    });

    const target = battle.enemyBattlefield.find((permanent) => permanent?.definitionId === "blocking_wall");

    expect(battle.pendingTargetRequest?.context.attackBypassesBlock).toBe(true);
    expect(battle.pendingTargetRequest?.context.abilitySourcePermanentId).toBe(attacker.instanceId);

    if (battle.pendingTargetRequest && target) {
      applyBattleAction(battle, {
        type: "choose_target",
        targetPermanentId: target.instanceId,
      });
    }

    expect(target?.block).toBe(4);
    expect(target?.health).toBe(3);
  });

  it("lets enemy attacks ignore player block", () => {
    const battle = createTestBattle({
      cardDefinitions: {
        ...TEST_CARD_DEFINITIONS,
        pierce_enemy: PIERCE_ENEMY_DEFINITION,
      },
      playerDeck: ["defend", "attack", "attack", "attack", "attack"],
      enemy: {
        name: "Pierce Enemy",
        health: 30,
        basePower: 0,
        leaderDefinitionId: "pierce_enemy",
        behavior: [{ attackAmount: 6 }],
      },
    });

    const defendCard = battle.player.hand.find((card) => card.definitionId === "defend");
    if (!defendCard) {
      throw new Error("Expected defend in opening hand.");
    }

    const pierceEnemy = battle.enemyBattlefield.find((permanent) => permanent?.definitionId === "pierce_enemy");

    expect(pierceEnemy?.keywords).toContain("pierce");

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: defendCard.instanceId,
    });

    expect(battle.player.block).toBe(7);
    expect(battle.enemy.leaderPermanentId).toBeTruthy();

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.player.block).toBe(0);
    expect(battle.player.health).toBe(94);
  });
});
