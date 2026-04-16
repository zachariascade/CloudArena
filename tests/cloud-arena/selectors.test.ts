import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  findPermanentById,
  hasOpenBattlefieldSlot,
  getLegalActions,
  selectObjects,
  selectPermanents,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle } from "./helpers.js";

const SELECTOR_TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  angel_guardian: {
    id: "angel_guardian",
    name: "Angel Guardian",
    cardTypes: ["creature"],
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    power: 4,
    health: 10,
    abilities: [],
  },
  human_soldier: {
    id: "human_soldier",
    name: "Human Soldier",
    cardTypes: ["creature"],
    cost: 2,
    subtypes: ["Human"],
    onPlay: [],
    power: 1,
    health: 9,
    abilities: [{ id: "human_soldier_apply_block", kind: "activated", activation: { type: "action", actionId: "apply_block" }, effects: [{ type: "gain_block", target: "player", amount: { type: "constant", value: 3 } }] }],
  },
  holy_blade: {
    id: "holy_blade",
    name: "Holy Blade",
    cardTypes: ["artifact"],
    cost: 1,
    subtypes: ["Equipment"],
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

function createSelectorBattle() {
  return createTestBattle({
    cardDefinitions: SELECTOR_TEST_CARD_DEFINITIONS,
    playerDeck: [
      "angel_guardian",
      "human_soldier",
      "holy_blade",
      "attack",
      "defend",
    ],
    enemy: {
      name: "Selector Dummy",
      health: 30,
      basePower: 12,
      behavior: [{ attackAmount: 12 }],
    },
    seed: 1,
  });
}

describe("cloud arena selector helpers", () => {
  it("selects permanents by subtype and relation", () => {
    const battle = createTestBattle({
      playerDeck: [
        "guardian",
        "blade_dancer",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Selector Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.cardDefinitions = {
      ...battle.cardDefinitions,
      guardian: {
        ...battle.cardDefinitions.guardian,
        subtypes: ["Angel"],
      },
      blade_dancer: {
        ...battle.cardDefinitions.blade_dancer,
        subtypes: ["Human"],
      },
    };

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const bladeDancerCard = battle.player.hand.find((card) => card.definitionId === "blade_dancer");

    if (!guardianCard || !bladeDancerCard) {
      throw new Error("Expected permanents in opening hand.");
    }

    battle.player.energy = 10;
    applyBattleAction(battle, { type: "play_card", cardInstanceId: guardianCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: bladeDancerCard.instanceId });

    const guardianPermanent = battle.battlefield.find((permanent) => permanent?.definitionId === "guardian");

    if (!guardianPermanent) {
      throw new Error("Expected Guardian on battlefield.");
    }

    expect(
      selectPermanents(battle, {
        controller: "you",
        subtype: "Angel",
      }).map((permanent) => permanent.definitionId),
    ).toEqual(["guardian"]);

    expect(
      selectPermanents(
        battle,
        {
          controller: "you",
          relation: "another",
        },
        { abilitySourcePermanentId: guardianPermanent.instanceId },
      ).map((permanent) => permanent.definitionId),
    ).toEqual(["blade_dancer"]);

    expect(
      selectPermanents(
        battle,
        {
          relation: "self",
        },
        { abilitySourcePermanentId: guardianPermanent.instanceId },
      ).map((permanent) => permanent.definitionId),
    ).toEqual(["guardian"]);
  });

  it("selects hand objects including equipment-tagged cards", () => {
    const battle = createSelectorBattle();

    const equipmentInHand = selectObjects(battle, {
      zone: "hand",
      controller: "you",
      cardType: "equipment",
    });

    expect(equipmentInHand).toHaveLength(1);
    expect(equipmentInHand[0]?.kind).toBe("card");
    expect(equipmentInHand[0]?.definition.id).toBe("holy_blade");
  });

  it("finds permanents by id and detects open battlefield slots", () => {
    const battle = createTestBattle({
      playerDeck: [
        "guardian",
        "guardian",
        "guardian",
        "attack",
        "defend",
      ],
      enemy: {
        name: "Selector Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    for (const card of [...battle.player.hand].filter((entry) => entry.definitionId === "guardian")) {
      applyBattleAction(battle, { type: "play_card", cardInstanceId: card.instanceId });
    }

    const firstPermanent = battle.battlefield[0];

    if (!firstPermanent) {
      throw new Error("Expected permanent on battlefield.");
    }

    expect(findPermanentById(battle, firstPermanent.instanceId)?.instanceId).toBe(firstPermanent.instanceId);
    expect(hasOpenBattlefieldSlot(battle)).toBe(true);
  });

  it("does not expose permanent play actions when the battlefield is full", () => {
    const battle = createTestBattle({
      cardDefinitions: SELECTOR_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "angel_guardian",
        "human_soldier",
        "angel_guardian",
        "human_soldier",
        "holy_blade",
      ],
      enemy: {
        name: "Selector Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    for (const card of [...battle.player.hand]) {
      applyBattleAction(battle, { type: "play_card", cardInstanceId: card.instanceId });
    }

    expect(hasOpenBattlefieldSlot(battle)).toBe(false);
    expect(getLegalActions(battle).some((action) => action.type === "play_card")).toBe(false);
  });
});
