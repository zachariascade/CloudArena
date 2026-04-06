import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  buildBattleSummary,
  playCard,
  usePermanentAction,
} from "../../src/cloud-arena/index.js";
import { createTestBattle, formatBattleLog } from "./helpers.js";

describe("cloud arena combat engine edge cases", () => {
  it("cannot play a card without enough energy", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "attack", "defend", "attack", "defend"],
      enemy: {
        name: "Accusing Spirit",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      }
    });

    battle.player.energy = 1;
    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");

    if (!guardianCard) {
      throw new Error("Expected Guardian in opening hand.");
    }

    expect(() =>
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: guardianCard.instanceId,
      }),
    ).toThrow("Not enough energy");
  });

  it("cannot use a permanent action twice in one round", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "attack", "defend", "attack", "defend"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      }
    });

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");

    if (!guardianCard) {
      throw new Error("Expected Guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    const guardianPermanent = battle.battlefield[0];

    if (!guardianPermanent) {
      throw new Error("Expected Guardian on battlefield.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardianPermanent.instanceId,
      action: "attack",
    });

    expect(() =>
      applyBattleAction(battle, {
        type: "use_permanent_action",
        permanentId: guardianPermanent.instanceId,
        action: "defend",
      }),
    ).toThrow("already acted");
  });

  it("cannot play a permanent when no board slot is open", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "guardian", "guardian", "guardian", "attack"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      }
    });

    battle.player.energy = 10;

    const guardianCards = [...battle.player.hand].filter((card) => card.definitionId === "guardian");
    const firstGuardian = guardianCards[0];
    const secondGuardian = guardianCards[1];
    const thirdGuardian = guardianCards[2];
    const fourthGuardian = guardianCards[3];

    if (!firstGuardian || !secondGuardian || !thirdGuardian || !fourthGuardian) {
      throw new Error("Expected four Guardians in hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: firstGuardian.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: secondGuardian.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: thirdGuardian.instanceId });

    expect(battle.battlefield.filter(Boolean)).toHaveLength(3);

    expect(() =>
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: fourthGuardian.instanceId,
      }),
    ).toThrow("open battlefield slot");
  });

  it("low-level actions fail during the wrong phase", () => {
    const battle = createTestBattle({
      playerDeck: ["attack", "defend", "attack", "defend", "attack"],
      enemy: {
        name: "Accusing Spirit",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      }
    });

    battle.phase = "enemy_resolution";

    const attackCard = battle.player.hand[0];

    if (!attackCard) {
      throw new Error("Expected Attack in hand.");
    }

    expect(() => playCard(battle, attackCard.instanceId)).toThrow("player_action phase");

    expect(() =>
      usePermanentAction(battle, "missing_permanent", "attack"),
    ).toThrow("player_action phase");
  });

  it("enemy damage spills from player block into a defending permanent", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "defend", "attack", "attack", "defend"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 15,
        behavior: [
          { attackAmount: 15 },
          { attackAmount: 15 },
        ],
      }
    });
    const startingHealth = battle.player.health;

    const guardianCard = battle.player.hand[0];
    const defendCard = battle.player.hand[1];

    if (!guardianCard || !defendCard) {
      throw new Error("Expected round one cards were missing.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: guardianCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: defendCard.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    const guardianPermanent = battle.battlefield[0];

    if (!guardianPermanent) {
      throw new Error("Expected Guardian on battlefield.");
    }

    const attackCard = battle.player.hand.find((card) => card.definitionId === "attack");
    const roundTwoDefend = battle.player.hand.find((card) => card.definitionId === "defend");

    if (!attackCard || !roundTwoDefend) {
      throw new Error("Expected round two cards were missing.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardianPermanent.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: attackCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: roundTwoDefend.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.player.health).toBe(startingHealth - 8);
    expect(battle.battlefield[0]?.health).toBe(5);
    expect(battle.battlefield[0]?.block).toBe(0);
  });

  it("enemy damage spills from a defending permanent into player health when needed", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "defend", "attack", "attack", "defend"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 25,
        behavior: [
          { attackAmount: 10 },
          { attackAmount: 25 },
        ],
      }
    });
    const startingHealth = battle.player.health;

    const guardianCard = battle.player.hand[0];
    const defendCard = battle.player.hand[1];

    if (!guardianCard || !defendCard) {
      throw new Error("Expected round one cards were missing.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: guardianCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: defendCard.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    const guardianPermanent = battle.battlefield[0];
    const roundTwoDefend = battle.player.hand.find((card) => card.definitionId === "defend");

    if (!guardianPermanent || !roundTwoDefend) {
      throw new Error("Expected round two state was missing.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardianPermanent.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: roundTwoDefend.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.battlefield[0]).toBeNull();
    expect(battle.player.graveyard.map((card) => card.definitionId)).toEqual(["guardian"]);
    expect(battle.player.health).toBe(startingHealth - 8);
  });

  it("battle ends when enemy health reaches zero", () => {
    const battle = createTestBattle({
      playerDeck: ["attack", "defend", "attack", "defend", "attack"],
      enemy: {
        name: "Accusing Spirit",
        health: 6,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      }
    });

    const attackCard = battle.player.hand.find((card) => card.definitionId === "attack");

    if (!attackCard) {
      throw new Error("Expected Attack in hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: attackCard.instanceId,
    });

    expect(battle.phase).toBe("finished");
    expect(battle.enemy.health).toBe(0);
    expect(battle.log.at(-1)).toEqual({
      type: "battle_finished",
      turnNumber: 1,
      winner: "player",
      playerHealth: battle.player.health,
      enemyHealth: battle.enemy.health,
      permanents: [],
    });
  });

  it("battle ends when player health reaches zero", () => {
    const battle = createTestBattle({
      playerHealth: 500,
      playerDeck: ["defend", "attack", "attack", "defend", "attack"],
      enemy: {
        name: "Accusing Spirit",
        health: 30,
        basePower: 500,
        behavior: [{ attackAmount: 500 }],
      }
    });

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.phase).toBe("finished");
    expect(battle.player.health).toBe(0);
    expect(battle.log.at(-1)).toEqual({
      type: "battle_finished",
      turnNumber: 1,
      winner: "enemy",
      playerHealth: battle.player.health,
      enemyHealth: battle.enemy.health,
      permanents: [],
    });
  });

  it("emits richer log events for state-changing combat actions", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "defend", "attack", "attack", "defend"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 15,
        behavior: [
          { attackAmount: 15 },
          { attackAmount: 15 },
        ],
      }
    });

    const guardianCard = battle.player.hand[0];
    const defendCard = battle.player.hand[1];

    if (!guardianCard || !defendCard) {
      throw new Error("Expected opening hand cards were missing.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: guardianCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: defendCard.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    const guardianPermanent = battle.battlefield[0];
    if (!guardianPermanent) {
      throw new Error("Expected Guardian on the battlefield.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardianPermanent.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, { type: "end_turn" });

    const eventTypes = battle.log.map((event) => event.type);

    expect(eventTypes).toContain("permanent_summoned");
    expect(eventTypes).toContain("block_gained");
    expect(eventTypes).toContain("damage_dealt");
    expect(eventTypes).toContain("enemy_intent_resolved");
  });

  it("playing a permanent card places it on the battlefield instead of discard", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "attack", "defend", "attack", "defend"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      }
    });

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");

    if (!guardianCard) {
      throw new Error("Expected Guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    expect(
      battle.battlefield.some(
        (permanent) => permanent?.sourceCardInstanceId === guardianCard.instanceId,
      ),
    ).toBe(true);
    expect(
      battle.player.discardPile.some((card) => card.instanceId === guardianCard.instanceId),
    ).toBe(false);
  });

  it("a dead permanent card goes to graveyard as the original card instance", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "defend", "attack", "attack", "defend"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 25,
        behavior: [
          { attackAmount: 10 },
          { attackAmount: 25 },
        ],
      }
    });

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const defendCard = battle.player.hand.find((card) => card.definitionId === "defend");

    if (!guardianCard || !defendCard) {
      throw new Error("Expected round one cards were missing.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: defendCard.instanceId,
    });
    applyBattleAction(battle, { type: "end_turn" });

    const guardianPermanent = battle.battlefield[0];
    const roundTwoDefend = battle.player.hand.find((card) => card.definitionId === "defend");

    if (!guardianPermanent || !roundTwoDefend) {
      throw new Error("Expected round two state was missing.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardianPermanent.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: roundTwoDefend.instanceId,
    });
    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.battlefield[0]).toBeNull();
    expect(battle.player.graveyard).toEqual([
      {
        instanceId: guardianCard.instanceId,
        definitionId: "guardian",
      },
    ]);
  });

  it("keeps a stable readable battle log for a representative permanent exchange", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "defend", "attack", "attack", "defend"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 15,
        behavior: [
          { attackAmount: 15 },
          { attackAmount: 15 },
        ],
      },
    });

    const guardianCard = battle.player.hand[0];
    const defendCard = battle.player.hand[1];

    if (!guardianCard || !defendCard) {
      throw new Error("Expected opening hand cards were missing.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: guardianCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: defendCard.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    const guardianPermanent = battle.battlefield[0];
    const attackCard = battle.player.hand.find((card) => card.definitionId === "attack");
    const roundTwoDefend = battle.player.hand.find((card) => card.definitionId === "defend");

    if (!guardianPermanent || !attackCard || !roundTwoDefend) {
      throw new Error("Expected round two state was missing.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardianPermanent.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: attackCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: roundTwoDefend.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    expect(formatBattleLog(battle)).toMatchInlineSnapshot(`
      [
        "turn 1: battle created",
        "turn 1: start turn, drew 5, energy 3, enemy intent attack 15",
        "turn 1: player drew guardian",
        "turn 1: player drew defend",
        "turn 1: player drew attack",
        "turn 1: player drew attack",
        "turn 1: player drew defend",
        "turn 1: played guardian",
        "turn 1: summoned guardian as guardian_1 into slot 1",
        "turn 1: played defend",
        "turn 1: player gained 7 block",
        "turn 1: end turn",
        "turn 1: enemy resolved attack 15",
        "turn 1: enemy_intent dealt 7 damage to player",
        "turn 1: enemy_intent dealt 8 damage to player",
        "turn 2: start turn, drew 4, energy 3, enemy intent attack 15",
        "turn 2: player drew defend",
        "turn 2: player drew attack",
        "turn 2: player drew attack",
        "turn 2: player drew defend",
        "turn 2: permanent guardian_1 used defend",
        "turn 2: permanent guardian_1 gained 3 block",
        "turn 2: played attack",
        "turn 2: card dealt 6 damage to enemy",
        "turn 2: played defend",
        "turn 2: player gained 7 block",
        "turn 2: end turn",
        "turn 2: enemy resolved attack 15",
        "turn 2: enemy_intent dealt 7 damage to player",
        "turn 2: enemy_intent dealt 8 damage to permanent guardian_1",
        "turn 3: start turn, drew 4, energy 3, enemy intent attack 15",
        "turn 3: player drew defend",
        "turn 3: player drew attack",
        "turn 3: player drew defend",
        "turn 3: player drew attack",
      ]
    `);
  });

  it("builds a compact battle summary for UI or simulator consumers", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "defend", "attack", "attack", "defend"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 10,
        behavior: [{ attackAmount: 10 }],
      },
    });

    const guardianCard = battle.player.hand[0];

    if (!guardianCard) {
      throw new Error("Expected Guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    expect(buildBattleSummary(battle)).toEqual({
      turnNumber: 1,
      phase: "player_action",
      player: {
        health: battle.player.maxHealth,
        maxHealth: battle.player.maxHealth,
        block: 0,
        energy: 1,
        handCount: 4,
        discardCount: 0,
        graveyardCount: 0,
      },
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        maxHealth: 30,
        block: 0,
        intent: "attack 10",
      },
      battlefield: [
        "slot 1: Guardian, hp=10/10, block=0, acted=no, defending=no",
        "slot 2: empty",
        "slot 3: empty",
      ],
      blockingQueue: [],
    });
  });
});
