import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  createBattle,
  getDerivedPermanentStat,
  getLegalActions,
  type BattleAction,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";

const ABILITY_COST_TEST_DEFINITIONS: CardDefinitionLibrary = {
  test_guardian: {
    id: "test_guardian",
    name: "Test Guardian",
    cardTypes: ["creature"],
    cost: 3,
    onPlay: [],
    power: 4,
    health: 4,
    keywords: ["halt"],
    abilities: [
      {
        id: "guardian_apply_block",
        kind: "activated",
        activation: { type: "action", actionId: "apply_block" },
        costs: [{ type: "energy", amount: 1 }],
        effects: [{ type: "gain_block", target: "player", amount: { type: "constant", value: 5 } }],
      },
    ],
  },
  test_blesser: {
    id: "test_blesser",
    name: "Test Blesser",
    cardTypes: ["creature"],
    cost: 3,
    onPlay: [],
    power: 2,
    health: 4,
    abilities: [
      {
        id: "bless_target",
        kind: "activated",
        activation: { type: "action", actionId: "bless_target" },
        costs: [{ type: "tap" }],
        targeting: {
          prompt: "Choose a creature to bless",
          allowSelfTarget: false,
        },
        effects: [
          {
            type: "add_counter",
            target: {
              zone: "battlefield",
              controller: "you",
              cardType: "creature",
            },
            powerDelta: 1,
            healthDelta: 1,
          },
        ],
      },
    ],
  },
  test_target_creature: {
    id: "test_target_creature",
    name: "Test Target Creature",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 4,
    health: 4,
    abilities: [],
  },
  test_energizer: {
    id: "test_energizer",
    name: "Test Energizer",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 1,
    health: 3,
    abilities: [
      {
        id: "gain_energy",
        kind: "activated",
        activation: { type: "action", actionId: "gain_energy" },
        costs: [{ type: "tap" }],
        effects: [{ type: "gain_energy", target: "player", amount: { type: "constant", value: 1 } }],
      },
    ],
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

describe("cloud arena ability costs", () => {
  it("lets activated abilities spend energy without tapping the permanent", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      summoningSicknessPolicy: "disabled",
      cardDefinitions: ABILITY_COST_TEST_DEFINITIONS,
      playerDeck: [
        "test_guardian",
        "attack",
        "defend",
        "attack",
        "defend",
      ],
      enemy: {
        name: "Cost Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "test_guardian");

    if (!guardianCard) {
      throw new Error("Expected test_guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    const guardian = battle.battlefield[0];

    if (!guardian) {
      throw new Error("Expected test_guardian on battlefield.");
    }

    const applyBlockAction = getLegalActions(battle).find(
      (action) =>
        action.type === "use_permanent_action" &&
        action.permanentId === guardian.instanceId &&
        action.action === "apply_block",
    );

    if (!applyBlockAction || applyBlockAction.type !== "use_permanent_action") {
      throw new Error("Expected test_guardian apply_block ability to be legal.");
    }

    applyBattleAction(battle, applyBlockAction);

    expect(battle.player.block).toBe(5);
    expect(battle.player.energy).toBe(6);
    expect(guardian.isTapped).toBe(false);
    expect(guardian.hasActedThisTurn).toBe(true);
    expect(getLegalActions(battle).some(
      (action) =>
        action.type === "use_permanent_action" &&
        action.permanentId === guardian.instanceId &&
        action.action === "apply_block",
    )).toBe(false);
  });

  it("keeps summoning sickness on by default for creature attacks and activated abilities", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions: ABILITY_COST_TEST_DEFINITIONS,
      playerDeck: [
        "test_guardian",
        "attack",
        "defend",
        "attack",
        "defend",
      ],
      enemy: {
        name: "Cost Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "test_guardian");

    if (!guardianCard) {
      throw new Error("Expected test_guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    const guardian = battle.battlefield[0];

    if (!guardian) {
      throw new Error("Expected test_guardian on battlefield.");
    }

    const legalActions = getLegalActions(battle).filter(
      (action): action is Extract<BattleAction, { type: "use_permanent_action" }> =>
        action.type === "use_permanent_action" && action.permanentId === guardian.instanceId,
    );

    expect(legalActions.some((action) => action.action === "attack")).toBe(false);
    expect(legalActions.some((action) => action.action === "apply_block")).toBe(false);
    expect(legalActions.some((action) => action.action === "defend")).toBe(true);
  });

  it("taps permanents when an activated ability pays a tap cost", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      summoningSicknessPolicy: "disabled",
      cardDefinitions: ABILITY_COST_TEST_DEFINITIONS,
      playerDeck: [
        "test_blesser",
        "test_target_creature",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Cost Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const blesserCard = battle.player.hand.find((card) => card.definitionId === "test_blesser");
    const targetCard = battle.player.hand.find((card) => card.definitionId === "test_target_creature");

    if (!blesserCard || !targetCard) {
      throw new Error("Expected test_blesser and test_target_creature in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: blesserCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: targetCard.instanceId,
    });

    const blesser = battle.battlefield.find((permanent) => permanent?.definitionId === "test_blesser");
    const target = battle.battlefield.find((permanent) => permanent?.definitionId === "test_target_creature");

    if (!blesser || !target) {
      throw new Error("Expected both permanents on the battlefield.");
    }

    const blessAction = getLegalActions(battle).find(
      (action) =>
        action.type === "use_permanent_action" &&
        action.permanentId === blesser.instanceId &&
        action.action === "bless_target",
    );

    if (!blessAction || blessAction.type !== "use_permanent_action") {
      throw new Error("Expected test_blesser bless_target ability to be legal.");
    }

    applyBattleAction(battle, blessAction);

    const targetAction = getLegalActions(battle).find(
      (action) =>
        action.type === "choose_target" &&
        action.targetPermanentId === target.instanceId,
    );

    if (!targetAction || targetAction.type !== "choose_target") {
      throw new Error("Expected a legal target for test_blesser.");
    }

    applyBattleAction(battle, targetAction);

    expect(blesser.isTapped).toBe(true);
    expect(getDerivedPermanentStat(battle, target, "power")).toBe(5);
    expect(target.health).toBe(5);
    expect(target.maxHealth).toBe(5);
    expect(
      getLegalActions(battle).some(
        (action) =>
          action.type === "use_permanent_action" &&
          action.permanentId === blesser.instanceId &&
          action.action === "bless_target",
      ),
    ).toBe(false);

    applyBattleAction(battle, { type: "end_turn" });

    const refreshedBlesser = battle.battlefield.find(
      (permanent) => permanent?.instanceId === blesser.instanceId,
    );

    expect(refreshedBlesser?.isTapped).toBe(false);
    expect(
      getLegalActions(battle).some(
        (action) =>
          action.type === "use_permanent_action" &&
          action.permanentId === blesser.instanceId &&
          action.action === "bless_target",
      ),
    ).toBe(true);
  });

  it("lets a tap-cost ability push energy to the player", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      summoningSicknessPolicy: "disabled",
      cardDefinitions: ABILITY_COST_TEST_DEFINITIONS,
      playerDeck: [
        "test_energizer",
        "attack",
        "defend",
        "attack",
        "defend",
      ],
      enemy: {
        name: "Cost Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const energizerCard = battle.player.hand.find((card) => card.definitionId === "test_energizer");

    if (!energizerCard) {
      throw new Error("Expected test_energizer in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: energizerCard.instanceId,
    });

    const energizer = battle.battlefield.find((permanent) => permanent?.definitionId === "test_energizer");

    if (!energizer) {
      throw new Error("Expected test_energizer on battlefield.");
    }

    battle.player.energy = 3;

    const gainEnergyAction = getLegalActions(battle).find(
      (action) =>
        action.type === "use_permanent_action" &&
        action.permanentId === energizer.instanceId &&
        action.action === "gain_energy",
    );

    if (!gainEnergyAction || gainEnergyAction.type !== "use_permanent_action") {
      throw new Error("Expected test_energizer gain_energy ability to be legal.");
    }

    applyBattleAction(battle, gainEnergyAction);

    expect(battle.player.energy).toBe(4);
    expect(energizer.isTapped).toBe(true);
    expect(
      getLegalActions(battle).some(
        (action) =>
          action.type === "use_permanent_action" &&
          action.permanentId === energizer.instanceId &&
          action.action === "gain_energy",
      ),
    ).toBe(false);
  });
});
