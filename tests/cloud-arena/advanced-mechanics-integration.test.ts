import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  createBattle,
  destroyPermanent,
  getDerivedPermanentStat,
  getLegalActions,
  getPermanentCounterCount,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";

const ADVANCED_MECHANICS_DEFINITIONS: CardDefinitionLibrary = {
  test_guardian: {
    id: "test_guardian",
    name: "Test Guardian",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 4,
    health: 4,
    abilities: [],
  },
  test_seraph: {
    id: "test_seraph",
    name: "Test Seraph",
    cardTypes: ["creature"],
    subtypes: ["Angel"],
    cost: 2,
    onPlay: [],
    power: 3,
    health: 8,
    preSummonEffects: [
      {
        type: "sacrifice",
        selector: {
          zone: "battlefield",
          controller: "you",
          cardType: "creature",
          relation: "another",
        },
        targeting: {
          prompt: "Choose a creature to sacrifice",
        },
        amount: 1,
        choice: "controller",
      },
    ],
    abilities: [
      {
        kind: "triggered",
        trigger: {
          event: "permanent_died",
          selector: {
            controller: "you",
            cardType: "creature",
            relation: "another",
          },
        },
        effects: [
          {
            type: "add_counter",
            target: "self",
            powerDelta: 1,
            healthDelta: 1,
          },
        ],
      },
    ],
  },
  test_captain: {
    id: "test_captain",
    name: "Test Captain",
    cardTypes: ["creature"],
    subtypes: ["Angel"],
    cost: 2,
    onPlay: [],
    power: 2,
    health: 3,
    abilities: [
      {
        kind: "static",
        modifier: {
          target: "self",
          stat: "power",
          operation: "add",
          value: {
            type: "count",
            selector: {
              zone: "battlefield",
              subtype: "Angel",
            },
          },
        },
      },
    ],
  },
  test_disciple: {
    id: "test_disciple",
    name: "Test Disciple",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 2,
    health: 4,
    abilities: [],
  },
  test_blade: {
    id: "test_blade",
    name: "Test Blade",
    cardTypes: ["artifact"],
    subtypes: ["Equipment"],
    cost: 1,
    onPlay: [],
    power: 1,
    health: 1,
  },
  attack: {
    id: "attack",
    name: "Attack",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [{ attackAmount: 6, target: "enemy" }],
  },
};

describe("cloud arena advanced mechanics integration", () => {
  it("handles chained triggers, static scaling, attachments, and choices together", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions: ADVANCED_MECHANICS_DEFINITIONS,
      playerDeck: [
        "test_guardian",
        "test_seraph",
        "test_captain",
        "test_disciple",
        "test_blade",
      ],
      enemy: {
        name: "Integration Dummy",
        health: 50,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 12;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "test_guardian");
    const seraphCard = battle.player.hand.find((card) => card.definitionId === "test_seraph");
    const captainCard = battle.player.hand.find((card) => card.definitionId === "test_captain");
    const discipleCard = battle.player.hand.find((card) => card.definitionId === "test_disciple");

    if (!guardianCard || !seraphCard || !captainCard || !discipleCard) {
      throw new Error("Expected advanced mechanics cards in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: seraphCard.instanceId,
    });

    expect(battle.pendingTargetRequest).toBeTruthy();

    const sacrificedGuardian = battle.battlefield.find((permanent) => permanent?.definitionId === "test_guardian");
    const seraphTarget = battle.pendingTargetRequest
      ? getLegalActions(battle).find(
          (action) =>
            action.type === "choose_target" &&
            sacrificedGuardian !== null &&
            action.targetPermanentId === sacrificedGuardian?.instanceId,
        )
      : undefined;

    if (!sacrificedGuardian || !seraphTarget || seraphTarget.type !== "choose_target") {
      throw new Error("Expected test_seraph to request a sacrifice target.");
    }

    applyBattleAction(battle, seraphTarget);

    const seraph = battle.battlefield.find((permanent) => permanent?.definitionId === "test_seraph");

    if (!seraph) {
      throw new Error("Expected test_seraph on battlefield.");
    }

    expect(getPermanentCounterCount(seraph, "+1/+1")).toBe(2);
    expect(getDerivedPermanentStat(battle, seraph, "power")).toBe(4);
    expect(battle.player.graveyard.map((card) => card.definitionId)).toEqual(["test_guardian"]);
    expect(
      battle.rules.findIndex(
        (event) =>
          event.type === "permanent_left_battlefield" &&
          event.definitionId === "test_guardian",
      ),
    ).toBeLessThan(
      battle.rules.findIndex(
        (event) =>
          event.type === "permanent_entered" &&
          event.definitionId === "test_seraph",
      ),
    );

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: captainCard.instanceId,
    });

    const captain = battle.battlefield.find((permanent) => permanent?.definitionId === "test_captain");

    if (!captain) {
      throw new Error("Expected test_captain on battlefield.");
    }

    // Angels: seraph + captain = 2; captain power = 2 + 2 = 4
    expect(getDerivedPermanentStat(battle, captain, "power")).toBe(4);

    destroyPermanent(battle, seraph.instanceId);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: discipleCard.instanceId,
    });

    const disciple = battle.battlefield.find((permanent) => permanent?.definitionId === "test_disciple");
    const bladeCard = battle.player.hand.find((card) => card.definitionId === "test_blade");

    if (!disciple || !bladeCard) {
      throw new Error("Expected test_disciple on battlefield and test_blade in hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bladeCard.instanceId,
    });

    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "test_blade");

    if (!blade) {
      throw new Error("Expected test_blade on battlefield.");
    }

    const equipAction = getLegalActions(battle).find(
      (action) =>
        action.type === "use_permanent_action" &&
        action.permanentId === blade.instanceId &&
        action.action === "equip",
    );

    if (!equipAction || equipAction.type !== "use_permanent_action") {
      throw new Error("Expected equip action for test_blade.");
    }

    applyBattleAction(battle, equipAction);

    const targetAction = getLegalActions(battle).find(
      (action) =>
        action.type === "choose_target" &&
        action.targetPermanentId === disciple.instanceId,
    );

    if (!targetAction || targetAction.type !== "choose_target") {
      throw new Error("Expected a legal equip target to be available.");
    }

    applyBattleAction(battle, targetAction);

    expect(blade.attachedTo).toBe(disciple.instanceId);
    expect(disciple.attachments).toContain(blade.instanceId);
    // disciple base power 2 + blade power 1 = 3
    expect(getDerivedPermanentStat(battle, disciple, "power")).toBe(3);
    expect(battle.rules.some((event) => event.type === "attachment_attached")).toBe(true);
    expect(battle.rulesCursor).toBe(battle.rules.length);
  });
});
