import { describe, expect, it } from "vitest";

import { applyBattleAction, createBattle, type CardDefinitionLibrary } from "../../src/cloud-arena/index.js";
import { createTestBattle, formatBattleLog, TEST_CARD_DEFINITIONS } from "./helpers.js";

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
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: roundTwoDefend.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: roundTwoAttackTwo.instanceId,
    });

    expect(battle.enemy.health).toBe(18);
    expect(battle.player.block).toBe(7);

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.turnNumber).toBe(3);
    expect(battle.player.health).toBe(startingHealth - 10);
    expect(battle.player.block).toBe(0);
    expect(battle.enemy.health).toBe(18);
    expect(battle.enemy.intent).toEqual({ attackAmount: 12 });
    expect(battle.battlefield[0]?.health).toBe(10);
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

    expect(battle.enemy.health).toBe(18);
    expect(formatBattleLog(battle)).toContain(
      `turn 2: permanent_action ${bladeDancerPermanent.instanceId} dealt 6 damage to enemy`,
    );
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
});
