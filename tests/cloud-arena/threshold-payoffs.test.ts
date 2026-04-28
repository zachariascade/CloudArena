import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  destroyPermanent,
  getLegalActions,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle } from "./helpers.js";

const THRESHOLD_TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  threshold_marshal: {
    id: "threshold_marshal",
    name: "Threshold Marshal",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 2,
    health: 4,
    abilities: [
      {
        id: "threshold_marshal_apply_block",
        kind: "activated",
        activation: { type: "action", actionId: "apply_block" },
        conditions: [
          {
            type: "threshold",
            selector: {
              zone: "battlefield",
              controller: "you",
              cardType: "creature",
            },
            value: 2,
          },
        ],
        effects: [
          {
            type: "gain_block",
            target: "player",
            amount: { type: "constant", value: 6 },
          },
        ],
      },
    ],
  },
  threshold_follower: {
    id: "threshold_follower",
    name: "Threshold Follower",
    cardTypes: ["creature"],
    cost: 1,
    onPlay: [],
    power: 1,
    health: 2,
    abilities: [],
  },
  graveyard_choir: {
    id: "graveyard_choir",
    name: "Graveyard Choir",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 2,
    health: 3,
    abilities: [
      {
        kind: "triggered",
        trigger: { event: "self_enters_battlefield" },
        conditions: [
          {
            type: "threshold",
            selector: {
              zone: "graveyard",
              controller: "you",
              cardType: "creature",
            },
            value: 1,
          },
        ],
        effects: [
          {
            type: "gain_block",
            target: "player",
            amount: { type: "constant", value: 4 },
          },
        ],
      },
    ],
  },
  fodder: {
    id: "fodder",
    name: "Fodder",
    cardTypes: ["creature"],
    cost: 1,
    onPlay: [],
    power: 0,
    health: 1,
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

describe("cloud arena threshold payoffs", () => {
  it("hides activated threshold payoffs until the battlefield count is met", () => {
    const battle = createTestBattle({
      summoningSicknessPolicy: "disabled",
      cardDefinitions: THRESHOLD_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "threshold_marshal",
        "threshold_follower",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Threshold Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const marshalCard = battle.player.hand.find((card) => card.definitionId === "threshold_marshal");
    const followerCard = battle.player.hand.find((card) => card.definitionId === "threshold_follower");

    if (!marshalCard || !followerCard) {
      throw new Error("Expected threshold cards in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: marshalCard.instanceId,
    });

    const marshal = battle.battlefield.find((permanent) => permanent?.definitionId === "threshold_marshal");

    if (!marshal) {
      throw new Error("Expected threshold_marshal on battlefield.");
    }

    expect(
      getLegalActions(battle).some(
        (action) =>
          action.type === "use_permanent_action" &&
          action.permanentId === marshal.instanceId &&
          action.action === "apply_block",
      ),
    ).toBe(false);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: followerCard.instanceId,
    });

    expect(
      getLegalActions(battle).some(
        (action) =>
          action.type === "use_permanent_action" &&
          action.permanentId === marshal.instanceId &&
          action.action === "apply_block",
      ),
    ).toBe(true);

    const applyBlockAction = getLegalActions(battle).find(
      (action) =>
        action.type === "use_permanent_action" &&
        action.permanentId === marshal.instanceId &&
        action.action === "apply_block",
    );

    if (!applyBlockAction || applyBlockAction.type !== "use_permanent_action") {
      throw new Error("Expected threshold_marshal apply_block ability to become legal.");
    }

    applyBattleAction(battle, applyBlockAction);

    expect(battle.player.block).toBe(6);
    expect(battle.player.energy).toBe(7);
  });

  it("resolves graveyard threshold payoffs when a card enters the battlefield", () => {
    const battle = createTestBattle({
      cardDefinitions: THRESHOLD_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "fodder",
        "graveyard_choir",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Threshold Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const fodderCard = battle.player.hand.find((card) => card.definitionId === "fodder");
    const choirCard = battle.player.hand.find((card) => card.definitionId === "graveyard_choir");

    if (!fodderCard || !choirCard) {
      throw new Error("Expected fodder and graveyard_choir in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: fodderCard.instanceId,
    });

    const fodderPermanent = battle.battlefield.find((permanent) => permanent?.definitionId === "fodder");

    if (!fodderPermanent) {
      throw new Error("Expected fodder on battlefield.");
    }

    destroyPermanent(battle, fodderPermanent.instanceId);

    expect(battle.player.graveyard.map((card) => card.definitionId)).toContain("fodder");

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: choirCard.instanceId,
    });

    expect(battle.player.block).toBe(4);
  });
});
