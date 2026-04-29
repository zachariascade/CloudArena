import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  buildBattleSummary,
  destroyPermanent,
  getLegalActions,
  playCard,
  usePermanentAction,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle, getEnemyHealth, getEnemyBlock, getEnemyPermanent, formatBattleLog, TEST_CARD_DEFINITIONS } from "./helpers.js";

const RESURRECT_TEST_DEFINITIONS: CardDefinitionLibrary = {
  resurrect: {
    id: "resurrect",
    name: "Resurrect",
    cardTypes: ["instant"],
    cost: 2,
    onPlay: [],
    spellEffects: [
      {
        type: "return_from_graveyard",
        selector: {
          zone: "graveyard",
          controller: "you",
        },
        targeting: {
          prompt: "Choose a card from your graveyard",
        },
      },
    ],
  },
};

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
      summoningSicknessPolicy: "disabled",
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

    const leaderTarget = battle.enemyBattlefield.find((entry) => entry?.enemyActorId === "enemy_actor_1");

    if (!leaderTarget) {
      throw new Error("Expected an enemy leader target.");
    }

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: leaderTarget.instanceId,
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
      playerDeck: ["guardian", "guardian", "guardian", "guardian", "guardian", "guardian"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 0,
        behavior: [{ attackAmount: 0 }],
      }
    });

    battle.player.energy = 10;

    const guardianCards = [...battle.player.hand].filter((card) => card.definitionId === "guardian");
    const firstGuardian = guardianCards[0];
    const secondGuardian = guardianCards[1];
    const thirdGuardian = guardianCards[2];
    const fourthGuardian = guardianCards[3];
    const fifthGuardian = guardianCards[4];
    const sixthGuardian = battle.player.drawPile[0];

    if (!firstGuardian || !secondGuardian || !thirdGuardian || !fourthGuardian || !fifthGuardian || !sixthGuardian) {
      throw new Error("Expected six Guardians available.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: firstGuardian.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: secondGuardian.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: thirdGuardian.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: fourthGuardian.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: fifthGuardian.instanceId });

    expect(battle.battlefield.filter(Boolean)).toHaveLength(5);

    applyBattleAction(battle, { type: "end_turn" });

    const sixthGuardianInHand = battle.player.hand.find((card) => card.instanceId === sixthGuardian.instanceId);

    if (!sixthGuardianInHand) {
      throw new Error("Expected the sixth Guardian to be drawn on the next turn.");
    }

    expect(() =>
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: sixthGuardianInHand.instanceId,
      }),
    ).toThrow("open battlefield slot");
  });

  it("skips enemy summons when the enemy battlefield is full and still resolves lethal damage", () => {
    const battle = createTestBattle({
      playerHealth: 1,
      playerDeck: ["attack", "defend", "attack", "defend", "attack"],
      enemy: {
        name: "Overflowing Caller",
        health: 30,
        basePower: 1,
        behavior: [{ attackAmount: 1 }],
        cards: [
          {
            id: "spawn_then_strike",
            name: "Spawn Then Strike",
            effects: [
              {
                spawnCardId: "token_imp",
                spawnCount: 1,
                target: "enemy",
              },
              {
                attackAmount: 1,
                target: "player",
              },
            ],
          },
        ],
        startingPermanents: [
          "enemy_husk",
          "enemy_husk",
          "enemy_husk",
          "enemy_husk",
        ],
      },
    });

    expect(battle.enemyBattlefield.filter(Boolean)).toHaveLength(5);
    expect(battle.enemyBattlefield.some((entry) => entry?.definitionId === "token_imp")).toBe(false);

    expect(() => applyBattleAction(battle, { type: "end_turn" })).not.toThrow();

    expect(battle.phase).toBe("finished");
    expect(battle.player.health).toBeLessThanOrEqual(0);
    expect(battle.enemyBattlefield.filter(Boolean)).toHaveLength(5);
    expect(battle.enemyBattlefield.some((entry) => entry?.definitionId === "token_imp")).toBe(false);
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
      usePermanentAction(battle, {
        type: "use_permanent_action",
        permanentId: "missing_permanent",
        source: "ability",
        action: "attack",
        abilityId: "missing_attack",
      }),
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
    const leaderTarget = battle.enemyBattlefield.find((entry) => entry?.enemyActorId === "enemy_actor_1");

    if (!leaderTarget) {
      throw new Error("Expected an enemy leader target.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: attackCard.instanceId });
    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: leaderTarget.instanceId,
    });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: roundTwoDefend.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.player.health).toBe(startingHealth - 8);
    expect(battle.battlefield[0]?.health).toBe(2);
    expect(battle.battlefield[0]?.block).toBe(0);
  });

  it("enemy damage stops at a defending permanent with halt", () => {
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
    expect(battle.player.health).toBe(startingHealth - 3);
  });

  it("enemy damage flows through a defending creature without halt by default", () => {
    const battle = createTestBattle({
      cardDefinitions: {
        ...TEST_CARD_DEFINITIONS,
        trainee: {
          id: "trainee",
          name: "Trainee",
          cardTypes: ["creature"],
          cost: 2,
          onPlay: [],
          power: 2,
          health: 10,
          abilities: [],
        },
      },
      playerDeck: ["trainee", "defend", "attack", "attack", "defend"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 25,
        behavior: [
          { attackAmount: 10 },
          { attackAmount: 25 },
        ],
      },
    });
    const startingHealth = battle.player.health;

    const traineeCard = battle.player.hand[0];
    const defendCard = battle.player.hand[1];

    if (!traineeCard || !defendCard) {
      throw new Error("Expected round one cards were missing.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: traineeCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: defendCard.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    const traineePermanent = battle.battlefield[0];
    const roundTwoDefend = battle.player.hand.find((card) => card.definitionId === "defend");

    if (!traineePermanent || !roundTwoDefend) {
      throw new Error("Expected round two state was missing.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: traineePermanent.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: roundTwoDefend.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.battlefield[0]).toBeNull();
    expect(battle.player.graveyard.map((card) => card.definitionId)).toEqual(["trainee"]);
    expect(battle.player.health).toBe(startingHealth - 11);
  });

  it("enemy damage with trample spills through a defending permanent into player health", () => {
    const battle = createTestBattle({
      playerDeck: ["guardian", "defend", "attack", "attack", "defend"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 25,
        behavior: [
          { attackAmount: 10 },
          { attackAmount: 25, overflowPolicy: "trample" },
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
    expect(battle.player.health).toBe(startingHealth - 11);
  });

  it("makes attack cards target enemy battlefield permanents when they exist", () => {
    const battle = createTestBattle({
      playerDeck: ["attack", "defend", "attack", "defend", "attack"],
      enemy: {
        name: "Enemy Brute",
        health: 30,
        basePower: 1,
        startingTokens: ["enemy_brute"],
        behavior: [{ attackAmount: 0 }],
      },
    });

    const attackCard = battle.player.hand.find((card) => card.definitionId === "attack");
    const enemyPermanent = battle.enemyBattlefield.find((entry) => entry?.definitionId === "enemy_brute");

    if (!attackCard || !enemyPermanent) {
      throw new Error("Expected both an attack card and an enemy permanent.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: attackCard.instanceId });

    expect(battle.pendingTargetRequest).toBeTruthy();
    expect(battle.pendingTargetRequest?.selector.zone).toBe("enemy_battlefield");

    const attackTarget = getLegalActions(battle).find(
      (action) => action.type === "choose_target" && action.targetPermanentId === enemyPermanent.instanceId,
    );

    if (!attackTarget || attackTarget.type !== "choose_target") {
      throw new Error("Expected the enemy permanent to be a legal attack target.");
    }

    applyBattleAction(battle, attackTarget);

    expect(enemyPermanent.health).toBe(2);
    expect(battle.pendingTargetRequest).toBeNull();
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

    const leaderTarget = battle.enemyBattlefield.find((entry) => entry?.enemyActorId === "enemy_actor_1");

    if (!leaderTarget) {
      throw new Error("Expected an enemy leader target.");
    }

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: leaderTarget.instanceId,
    });

    expect(battle.phase).toBe("finished");
    expect(getEnemyHealth(battle)).toBe(0);
    expect(battle.log.at(-1)).toEqual({
      type: "battle_finished",
      turnNumber: 1,
      winner: "player",
      playerHealth: battle.player.health,
      enemyHealth: getEnemyHealth(battle),
      permanents: [],
    });
  });

  it("battle continues while enemy creature tokens remain after the leader dies", () => {
    const battle = createTestBattle({
      playerDeck: ["attack", "attack", "defend", "defend", "attack"],
      enemy: {
        name: "Belzaphor, Swarm of the Pit",
        health: 6,
        basePower: 3,
        startingTokens: ["token_imp"],
        behavior: [{ attackAmount: 3 }],
      },
    });

    const leader = battle.enemyBattlefield.find((entry) => entry?.enemyActorId === "enemy_actor_1");
    const token = battle.enemyBattlefield.find((entry) => entry?.definitionId === "token_imp");
    const firstAttackCard = battle.player.hand.find((card) => card.definitionId === "attack");
    const secondAttackCard = battle.player.hand.find(
      (card) => card.definitionId === "attack" && card.instanceId !== firstAttackCard?.instanceId,
    );

    if (!leader || !token || !firstAttackCard || !secondAttackCard) {
      throw new Error("Expected the leader, token, and two attack cards to be available.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: firstAttackCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: leader.instanceId,
    });

    expect(battle.phase).toBe("player_action");
    expect(battle.enemyBattlefield.some((entry) => entry?.definitionId === "token_imp")).toBe(true);
    expect(battle.enemyBattlefield.some((entry) => entry?.enemyActorId === "enemy_actor_1")).toBe(false);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: secondAttackCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: token.instanceId,
    });

    expect(battle.phase).toBe("finished");
    expect(battle.log.at(-1)?.type).toBe("battle_finished");
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
      enemyHealth: getEnemyHealth(battle),
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
      summoningSicknessPolicy: "disabled",
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

  it("returns a chosen graveyard card to hand with resurrect", () => {
    const battle = createTestBattle({
      cardDefinitions: {
        ...TEST_CARD_DEFINITIONS,
        ...RESURRECT_TEST_DEFINITIONS,
      },
      playerDeck: ["guardian", "resurrect", "attack", "defend", "attack"],
      enemy: {
        name: "Ravaging Demon",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const resurrectCard = battle.player.hand.find((card) => card.definitionId === "resurrect");

    if (!guardianCard || !resurrectCard) {
      throw new Error("Expected Guardian and Resurrect in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    const guardianPermanent = battle.battlefield[0];

    if (!guardianPermanent) {
      throw new Error("Expected Guardian on battlefield.");
    }

    destroyPermanent(battle, guardianPermanent.instanceId);

    expect(battle.player.graveyard.map((card) => card.instanceId)).toContain(guardianCard.instanceId);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: resurrectCard.instanceId,
    });

    expect(battle.pendingTargetRequest?.targetKind).toBe("card");
    expect(battle.pendingTargetRequest?.selector.zone).toBe("graveyard");

    const chooseCardAction = getLegalActions(battle).find(
      (action): action is Extract<typeof action, { type: "choose_card" }> =>
        action.type === "choose_card" &&
        action.targetCardInstanceId === guardianCard.instanceId,
    );

    if (!chooseCardAction) {
      throw new Error("Expected a choose_card action for the graveyard card.");
    }

    applyBattleAction(battle, chooseCardAction);

    expect(battle.pendingTargetRequest).toBeNull();
    expect(battle.player.graveyard.map((card) => card.instanceId)).not.toContain(guardianCard.instanceId);
    expect(battle.player.hand.map((card) => card.instanceId)).toContain(guardianCard.instanceId);
  });

  it("records internal rules events separately from the battle log", () => {
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
      },
    });

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const defendCard = battle.player.hand.find((card) => card.definitionId === "defend");

    if (!guardianCard || !defendCard) {
      throw new Error("Expected opening hand cards were missing.");
    }

    expect(battle.rules.map((event) => event.type)).toEqual([
      "permanent_entered",
      "card_drawn",
      "card_drawn",
      "card_drawn",
      "card_drawn",
      "card_drawn",
    ]);

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

    expect(
      battle.rules.filter((event) =>
        event.type === "card_played" ||
        event.type === "permanent_entered" ||
        event.type === "permanent_left_battlefield" ||
        event.type === "permanent_died",
      ),
    ).toEqual([
      {
        type: "permanent_entered",
        turnNumber: 1,
        permanentId: "enemy_leader_1_1",
        sourceCardInstanceId: "enemy_leader_1_1",
        definitionId: "enemy_leader",
        controllerId: "enemy",
        slotIndex: 0,
      },
      {
        type: "card_played",
        turnNumber: 1,
        cardInstanceId: guardianCard.instanceId,
        definitionId: "guardian",
        controllerId: "player",
      },
      {
        type: "permanent_entered",
        turnNumber: 1,
        permanentId: "guardian_1",
        sourceCardInstanceId: guardianCard.instanceId,
        definitionId: "guardian",
        controllerId: "player",
        slotIndex: 0,
      },
      {
        type: "card_played",
        turnNumber: 1,
        cardInstanceId: defendCard.instanceId,
        definitionId: "defend",
        controllerId: "player",
      },
      {
        type: "card_played",
        turnNumber: 2,
        cardInstanceId: roundTwoDefend.instanceId,
        definitionId: "defend",
        controllerId: "player",
      },
      {
        type: "permanent_left_battlefield",
        turnNumber: 2,
        permanentId: "guardian_1",
        sourceCardInstanceId: guardianCard.instanceId,
        definitionId: "guardian",
        controllerId: "player",
        slotIndex: 0,
      },
      {
        type: "permanent_died",
        turnNumber: 2,
        permanentId: "guardian_1",
        sourceCardInstanceId: guardianCard.instanceId,
        definitionId: "guardian",
        controllerId: "player",
        slotIndex: 0,
      },
    ]);

    expect(battle.log.map((event) => event.type)).toContain("permanent_destroyed");
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

    const leaderTarget = battle.enemyBattlefield.find((entry) => entry?.enemyActorId === "enemy_actor_1");

    if (!leaderTarget) {
      throw new Error("Expected an enemy leader target.");
    }

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: leaderTarget.instanceId,
    });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: roundTwoDefend.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    expect(formatBattleLog(battle)).toMatchInlineSnapshot(`
      [
        "turn 1: battle created",
        "turn 1: summoned enemy_leader as enemy_leader_1_1 into slot 1",
        "turn 1: start turn, drew 5, energy 3, enemy intent attack 15",
        "turn 1: player drew guardian",
        "turn 1: player drew defend",
        "turn 1: player drew attack",
        "turn 1: player drew attack",
        "turn 1: player drew defend",
        "turn 1: played guardian",
        "turn 1: summoned guardian as guardian_1 into slot 1",
        "turn 1: played defend",
        "turn 1: cast defend",
        "turn 1: player gained 7 block",
        "turn 1: end turn",
        "turn 1: enemy resolved attack 15",
        "turn 1: enemy_intent dealt 7 damage to player",
        "turn 1: enemy_intent dealt 8 damage to player",
        "turn 2: start turn, drew 1, energy 3, enemy intent attack 15",
        "turn 2: player drew defend",
        "turn 2: permanent guardian_1 used defend",
        "turn 2: played attack",
        "turn 2: cast attack",
        "turn 2: card dealt 6 damage to permanent enemy_leader_1_1",
        "turn 2: played defend",
        "turn 2: cast defend",
        "turn 2: player gained 7 block",
        "turn 2: end turn",
        "turn 2: enemy resolved attack 15",
        "turn 2: enemy_intent dealt 7 damage to player",
        "turn 2: enemy_intent dealt 8 damage to permanent guardian_1",
        "turn 3: start turn, drew 2, energy 3, enemy intent attack 15",
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
        "slot 1: Guardian, hp=10/10, block=0, acted=no, tapped=no, defending=no, blockingFor=none",
        "slot 2: empty",
        "slot 3: empty",
        "slot 4: empty",
        "slot 5: empty",
      ],
      enemyBattlefield: [
        "slot 1: Ravaging Demon, hp=30/30, block=0, acted=no, tapped=no, defending=no, blockingFor=none",
        "slot 2: empty",
        "slot 3: empty",
        "slot 4: empty",
        "slot 5: empty",
      ],
      blockingQueue: [],
    });
  });

  it("lets creature attacks target enemy permanents and respects full heal recovery policy", () => {
    const battle = createTestBattle({
      summoningSicknessPolicy: "disabled",
      playerDeck: ["guardian", "defend", "attack", "defend", "attack"],
      enemy: {
        name: "Enemy Husk",
        health: 30,
        basePower: 1,
        startingTokens: ["enemy_husk"],
        behavior: [{ attackAmount: 0 }],
      },
    });

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    if (!guardianCard) {
      throw new Error("Expected Guardian in opening hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: guardianCard.instanceId });

    const guardianPermanent = battle.battlefield[0];
    const enemyPermanent = battle.enemyBattlefield.find((entry) => entry?.definitionId === "enemy_husk");

    if (!guardianPermanent || !enemyPermanent) {
      throw new Error("Expected both the Guardian and an enemy husk on the field.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardianPermanent.instanceId,
      source: "rules",
      action: "attack",
    });

    const attackTarget = battle.pendingTargetRequest
      ? getLegalActions(battle).find(
          (action) => action.type === "choose_target" && action.targetPermanentId === enemyPermanent.instanceId,
        )
      : null;

    if (!attackTarget || attackTarget.type !== "choose_target") {
      throw new Error("Expected the enemy husk to be a legal attack target.");
    }

    applyBattleAction(battle, attackTarget);

    expect(enemyPermanent.health).toBe(2);

    applyBattleAction(battle, { type: "end_turn" });

    expect(enemyPermanent.health).toBe(6);
  });

  it("keeps damage on enemy permanents with none recovery policy", () => {
    const battle = createTestBattle({
      summoningSicknessPolicy: "disabled",
      playerDeck: ["guardian", "defend", "attack", "defend", "attack"],
      enemy: {
        name: "Enemy Shade",
        health: 30,
        basePower: 1,
        startingTokens: ["enemy_shade"],
        behavior: [{ attackAmount: 0 }],
      },
    });

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    if (!guardianCard) {
      throw new Error("Expected Guardian in opening hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: guardianCard.instanceId });

    const guardianPermanent = battle.battlefield[0];
    const enemyPermanent = battle.enemyBattlefield.find((entry) => entry?.definitionId === "enemy_shade");

    if (!guardianPermanent || !enemyPermanent) {
      throw new Error("Expected both the Guardian and an enemy shade on the field.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardianPermanent.instanceId,
      source: "rules",
      action: "attack",
    });

    const attackTarget = battle.pendingTargetRequest
      ? getLegalActions(battle).find(
          (action) => action.type === "choose_target" && action.targetPermanentId === enemyPermanent.instanceId,
        )
      : null;

    if (!attackTarget || attackTarget.type !== "choose_target") {
      throw new Error("Expected the enemy shade to be a legal attack target.");
    }

    applyBattleAction(battle, attackTarget);

    expect(enemyPermanent.health).toBe(2);

    applyBattleAction(battle, { type: "end_turn" });

    expect(enemyPermanent.health).toBe(2);
  });

  it("stuns the enemy so their action is cancelled for the turn", () => {
    const battle = createTestBattle({
      playerDeck: ["stunning_rebuke", "defend", "attack", "defend", "attack"],
      enemy: {
        name: "Stunned Opponent",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    const stunCard = battle.player.hand.find((card) => card.definitionId === "stunning_rebuke");

    if (!stunCard) {
      throw new Error("Expected Stunning Rebuke in opening hand.");
    }

    const startingHealth = battle.player.health;

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: stunCard.instanceId,
    });

    const enemyLeader = battle.enemyBattlefield.find((entry) => entry?.enemyActorId === "enemy_actor_1");

    expect(enemyLeader?.intentLabel).toBe("Stunned");

    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.player.health).toBe(startingHealth);
    expect((battle.enemies[0]?.stunnedThisTurn ?? false)).toBe(false);
    expect(battle.log.some((event) => event.type === "enemy_stunned")).toBe(true);
  });
});
