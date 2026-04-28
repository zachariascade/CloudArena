import { describe, expect, it } from "vitest";

import { applyBattleAction, createBattle, type CardDefinitionLibrary } from "../../src/cloud-arena/index.js";
import { createTestBattle, formatBattleLog, TEST_CARD_DEFINITIONS } from "./helpers.js";

const judgmentBladeCardDefinition: CardDefinitionLibrary["judgment_blade"] = {
  id: "judgment_blade",
  name: "Judgment Blade",
  cardTypes: ["artifact"],
  subtypes: ["Equipment"],
  cost: 3,
  onPlay: [],
  power: 1,
  health: 1,
  attackAllEnemyPermanents: true,
};

describe("cloud arena combat engine permanent flow", () => {
  it("handles playing Guardian and defending with it across rounds", () => {
    const battle = createTestBattle({
      playerDeck: [
        "guardian",
        "defend",
        "attack",
        "attack",
        "defend",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 10,
        behavior: [
          { attackAmount: 10 },
          { attackAmount: 15 },
          { attackAmount: 12 },
        ],
      }
    });
    const startingHealth = battle.player.health;

    expect(battle.player.hand.map((card) => card.definitionId)).toEqual([
      "guardian",
      "defend",
      "attack",
      "attack",
      "defend",
    ]);

    const guardianCard = battle.player.hand[0];

    if (!guardianCard) {
      throw new Error("Expected round one cards were missing.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    expect(battle.player.energy).toBe(1);
    expect(battle.battlefield[0]).not.toBeNull();
    expect(battle.battlefield[0]?.name).toBe("Guardian");
    expect(battle.battlefield[0]?.controllerId).toBe("player");
    expect(battle.battlefield[0]?.health).toBe(10);
    expect(battle.battlefield[0]?.block).toBe(0);
    expect(battle.battlefield[0]?.counters).toHaveLength(0);
    expect(battle.battlefield[0]?.attachments).toEqual([]);
    expect(battle.battlefield[0]?.abilities).toHaveLength(1);
    expect(battle.player.discardPile).toHaveLength(0);

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(2);
    expect(battle.player.health).toBe(startingHealth - 10);
    expect(battle.player.block).toBe(0);
    expect(battle.enemy.intent).toEqual({ attackAmount: 15 });
    expect(battle.battlefield[0]?.health).toBe(10);
    expect(battle.battlefield[0]?.block).toBe(0);
    expect(battle.battlefield[0]?.hasActedThisTurn).toBe(false);
    expect(battle.player.hand).toHaveLength(5);

    const guardianPermanent = battle.battlefield[0];
    const roundTwoAttackOne = battle.player.hand.find((card) => card.definitionId === "attack");
    const roundTwoDefend = battle.player.hand.find((card) => card.definitionId === "defend");
    const roundTwoAttackTwo = battle.player.hand.find(
      (card) =>
        card.definitionId === "attack" &&
        card.instanceId !== roundTwoAttackOne?.instanceId,
    );

    if (!guardianPermanent || !roundTwoAttackOne || !roundTwoDefend || !roundTwoAttackTwo) {
      throw new Error("Expected round two state was missing.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardianPermanent.instanceId,
      action: "defend",
    });

    expect(battle.blockingQueue).toEqual([guardianPermanent.instanceId]);
    expect(battle.battlefield[0]?.isDefending).toBe(true);
    expect(battle.battlefield[0]?.hasActedThisTurn).toBe(true);
    expect(battle.battlefield[0]?.block).toBe(0);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: roundTwoAttackOne.instanceId,
    });
    const firstAttackTarget = battle.enemyBattlefield.find((permanent) => permanent?.isEnemyLeader);

    if (!firstAttackTarget) {
      throw new Error("Expected enemy leader to target.");
    }

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: firstAttackTarget.instanceId,
    });

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: roundTwoDefend.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: roundTwoAttackTwo.instanceId,
    });
    const secondAttackTarget = battle.enemyBattlefield.find((permanent) => permanent?.isEnemyLeader);

    if (!secondAttackTarget) {
      throw new Error("Expected enemy leader to target.");
    }

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: secondAttackTarget.instanceId,
    });

    expect(battle.enemy.health).toBe(18);
    expect(battle.player.block).toBe(7);

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(3);
    expect(battle.player.health).toBe(startingHealth - 10);
    expect(battle.player.block).toBe(0);
    expect(battle.enemy.health).toBe(18);
    expect(battle.enemy.intent).toEqual({ attackAmount: 12 });
    expect(battle.battlefield[0]?.health).toBe(2);
    expect(battle.battlefield[0]?.block).toBe(0);
    expect(battle.blockingQueue).toEqual([]);
    expect(battle.player.graveyard).toHaveLength(0);
  });

  it("permanent attack actions can hit multiple times", () => {
    const battle = createTestBattle({
      playerDeck: [
        "blade_dancer",
        "attack",
        "defend",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Ravaging Demon",
        health: 24,
        basePower: 10,
        behavior: [
          { attackAmount: 10 },
          { attackAmount: 10 },
        ],
      },
    });

    const bladeDancerCard = battle.player.hand.find((card) => card.definitionId === "blade_dancer");

    if (!bladeDancerCard) {
      throw new Error("Expected Blade Dancer in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bladeDancerCard.instanceId,
    });

    const bladeDancerPermanent = battle.battlefield[0];

    if (!bladeDancerPermanent) {
      throw new Error("Expected Blade Dancer on the battlefield.");
    }

    applyBattleAction(battle, { type: "end_turn" });

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: bladeDancerPermanent.instanceId,
      action: "attack",
    });

    const attackTarget = battle.enemyBattlefield.find((permanent) => permanent?.isEnemyLeader);

    if (!attackTarget) {
      throw new Error("Expected enemy leader to target.");
    }

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: attackTarget.instanceId,
    });

    expect(battle.enemy.health).toBe(18);
  });

  it("full-heal defenders restore their health at the start of the next round", () => {
    const cardDefinitions: CardDefinitionLibrary = {
      ...TEST_CARD_DEFINITIONS,
      renewing_guardian: {
        id: "renewing_guardian",
        name: "Renewing Guardian",
        cardTypes: ["creature"],
        cost: 2,
        onPlay: [],
        power: 2,
        health: 8,
        keywords: ["refresh"],
      },
    };
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions,
      playerDeck: ["renewing_guardian", "defend", "attack", "attack", "defend"],
      enemy: {
        name: "Bruiser",
        health: 30,
        basePower: 8,
        behavior: [
          { attackAmount: 4 },
          { attackAmount: 6 },
          { attackAmount: 4 },
        ],
      },
    });

    const renewingGuardianCard = battle.player.hand.find(
      (card) => card.definitionId === "renewing_guardian",
    );

    if (!renewingGuardianCard) {
      throw new Error("Expected renewing_guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: renewingGuardianCard.instanceId,
    });
    applyBattleAction(battle, { type: "end_turn" });

    const renewingGuardian = battle.battlefield[0];

    if (!renewingGuardian) {
      throw new Error("Expected renewing_guardian on battlefield.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: renewingGuardian.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.battlefield[0]?.health).toBe(8);
    expect(formatBattleLog(battle)).toContain(
      `turn 2: enemy_intent dealt 6 damage to permanent ${renewingGuardian.instanceId}`,
    );
  });

  it("defend asks for a target only when multiple enemy permanents can be blocked", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "attack", "defend", "attack", "defend"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 10,
        behavior: [{ attackAmount: 10 }],
        startingPermanents: ["enemy_husk"],
      },
    });

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");

    if (!guardianCard) {
      throw new Error("Expected guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, { type: "end_turn" });

    const guardianPermanent = battle.battlefield[0];

    if (!guardianPermanent) {
      throw new Error("Expected guardian on battlefield.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardianPermanent.instanceId,
      action: "defend",
    });

    expect(battle.pendingTargetRequest).toBeTruthy();
    expect(battle.pendingTargetRequest?.prompt).toBe("Choose an enemy to block for");
    expect(guardianPermanent.blockingTargetPermanentId).toBeNull();
  });

  it("sweeps every enemy permanent when Judgment Blade is equipped", () => {
    const cardDefinitions: CardDefinitionLibrary = {
      ...TEST_CARD_DEFINITIONS,
      judgment_blade: judgmentBladeCardDefinition,
    };
    const battle = createTestBattle({
      cardDefinitions,
      summoningSicknessPolicy: "disabled",
      playerDeck: [
        "guardian",
        "judgment_blade",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 10,
        behavior: [
          { attackAmount: 10 },
        ],
        startingPermanents: [
          "enemy_husk",
          "enemy_brute",
        ],
      },
    });
    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const bladeCard = battle.player.hand.find((card) => card.definitionId === "judgment_blade");

    if (!guardianCard || !bladeCard) {
      throw new Error("Expected Guardian and Judgment Blade in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bladeCard.instanceId,
    });

    const bladePermanent = battle.battlefield.find((permanent) => permanent?.definitionId === "judgment_blade");
    const guardianPermanent = battle.battlefield.find((permanent) => permanent?.definitionId === "guardian");

    if (!bladePermanent || !guardianPermanent) {
      throw new Error("Expected Guardian and Judgment Blade on the battlefield.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: bladePermanent.instanceId,
      source: "ability",
      action: "equip",
      abilityId: "equip",
    });

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: guardianPermanent.instanceId,
    });

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardianPermanent.instanceId,
      source: "rules",
      action: "attack",
    });

    const enemyPermanents = battle.enemyBattlefield.filter(
      (permanent): permanent is NonNullable<typeof permanent> => permanent !== null,
    );

    expect(battle.pendingTargetRequest).toBeNull();
    expect(enemyPermanents).toHaveLength(3);
    expect(enemyPermanents.map((permanent) => permanent.health)).toEqual([25, 1, 3]);
    expect(battle.enemy.health).toBe(25);
    expect(formatBattleLog(battle)).toContain(
      `turn 1: permanent_action ${guardianPermanent.instanceId} dealt 5 damage to permanent ${enemyPermanents[1]?.instanceId}`,
    );
  });

  it("rejects defend on non-creature permanents", () => {
    const cardDefinitions: CardDefinitionLibrary = {
      ...TEST_CARD_DEFINITIONS,
      judgment_blade: judgmentBladeCardDefinition,
    };
    const battle = createTestBattle({
      cardDefinitions,
      playerDeck: [
        "judgment_blade",
        "attack",
        "defend",
        "attack",
        "defend",
      ],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 10,
        behavior: [
          { attackAmount: 10 },
        ],
      },
    });
    battle.player.energy = 10;

    const bladeCard = battle.player.hand.find((card) => card.definitionId === "judgment_blade");

    if (!bladeCard) {
      throw new Error("Expected Judgment Blade in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bladeCard.instanceId,
    });

    const bladePermanent = battle.battlefield.find((permanent) => permanent?.definitionId === "judgment_blade");

    if (!bladePermanent) {
      throw new Error("Expected Judgment Blade on the battlefield.");
    }

    expect(() =>
      applyBattleAction(battle, {
        type: "use_permanent_action",
        permanentId: bladePermanent.instanceId,
        source: "rules",
        action: "defend",
      })
    ).toThrow(/not a creature/);
  });
});
