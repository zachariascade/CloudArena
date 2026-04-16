import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  attachPermanentToTarget,
  canAttachPermanentToTarget,
  destroyPermanent,
  getLegalActions,
  isEquipmentPermanent,
  type BattleAction,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle } from "./helpers.js";

const ATTACHMENT_TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  angel_bearer: {
    id: "angel_bearer",
    name: "Angel Bearer",
    cardTypes: ["creature"],
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    power: 4,
    health: 10,
    abilities: [],
  },
  faithful_squire: {
    id: "faithful_squire",
    name: "Faithful Squire",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 1,
    health: 8,
    abilities: [{ id: "faithful_squire_apply_block", kind: "activated", activation: { type: "action", actionId: "apply_block" }, effects: [{ type: "gain_block", target: "player", amount: { type: "constant", value: 3 } }] }],
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

function createAttachmentBattle() {
  return createTestBattle({
    cardDefinitions: ATTACHMENT_TEST_CARD_DEFINITIONS,
    playerDeck: [
      "angel_bearer",
      "faithful_squire",
      "holy_blade",
      "attack",
      "defend",
    ],
    enemy: {
      name: "Attachment Dummy",
      health: 30,
      basePower: 12,
      behavior: [{ attackAmount: 12 }],
    },
  });
}

describe("cloud arena attachments", () => {
  it("tracks attachedTo and target attachment lists for equipment", () => {
    const battle = createAttachmentBattle();
    battle.player.energy = 10;

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "angel_bearer" || entry.definitionId === "holy_blade"
    )) {
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: card.instanceId,
      });
    }

    const angel = battle.battlefield.find((permanent) => permanent?.definitionId === "angel_bearer");
    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");

    if (!angel || !blade) {
      throw new Error("Expected angel and equipment on battlefield.");
    }

    expect(isEquipmentPermanent(battle, blade)).toBe(true);
    expect(canAttachPermanentToTarget(battle, blade, angel)).toBe(true);

    attachPermanentToTarget(battle, blade, angel);

    expect(blade.attachedTo).toBe(angel.instanceId);
    expect(angel.attachments).toEqual([blade.instanceId]);
    expect(battle.rules.at(-1)).toEqual({
      type: "attachment_attached",
      turnNumber: 1,
      attachmentId: blade.instanceId,
      targetPermanentId: angel.instanceId,
    });
  });

  it("detaches equipment cleanly when the equipped permanent is destroyed", () => {
    const battle = createAttachmentBattle();
    battle.player.energy = 10;

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "angel_bearer" || entry.definitionId === "holy_blade"
    )) {
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: card.instanceId,
      });
    }

    const angel = battle.battlefield.find((permanent) => permanent?.definitionId === "angel_bearer");
    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");

    if (!angel || !blade) {
      throw new Error("Expected angel and equipment on battlefield.");
    }

    attachPermanentToTarget(battle, blade, angel);
    destroyPermanent(battle, angel.instanceId);

    const survivingBlade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");

    if (!survivingBlade) {
      throw new Error("Expected equipment to remain on battlefield.");
    }

    expect(survivingBlade.attachedTo).toBeNull();
    expect(battle.player.graveyard.map((card) => card.definitionId)).toContain("angel_bearer");
  });

  it("exposes a targeted equip ability for battlefield equipment", () => {
    const battle = createAttachmentBattle();
    battle.player.energy = 10;

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "angel_bearer" || entry.definitionId === "holy_blade"
    )) {
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: card.instanceId,
      });
    }

    const angel = battle.battlefield.find((permanent) => permanent?.definitionId === "angel_bearer");
    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");

    if (!angel || !blade) {
      throw new Error("Expected angel and equipment on battlefield.");
    }

    const equipAction = getLegalActions(battle).find(
      (action) =>
        action.type === "use_permanent_action" &&
        action.permanentId === blade.instanceId &&
        action.action === "equip",
    ) as Extract<BattleAction, { type: "use_permanent_action" }> | undefined;

    if (!equipAction) {
      throw new Error("Expected an equip action for the equipment permanent.");
    }

    applyBattleAction(battle, equipAction);

    expect(battle.pendingTargetRequest).toBeTruthy();

    const targetAction = getLegalActions(battle)[0];

    if (!targetAction || targetAction.type !== "choose_target") {
      throw new Error("Expected a legal equip target to be available.");
    }

    applyBattleAction(battle, targetAction);

    expect(blade.attachedTo).toBe(angel.instanceId);
    expect(angel.attachments).toEqual([blade.instanceId]);
  });

  it("hides equip when there is no other permanent to attach to", () => {
    const battle = createTestBattle({
      cardDefinitions: ATTACHMENT_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "holy_blade",
        "attack",
        "defend",
      ],
      enemy: {
        name: "Attachment Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const bladeCard = battle.player.hand.find((card) => card.definitionId === "holy_blade");

    if (!bladeCard) {
      throw new Error("Expected holy_blade in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bladeCard.instanceId,
    });

    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");

    if (!blade) {
      throw new Error("Expected holy_blade on battlefield.");
    }

    expect(
      getLegalActions(battle).some(
        (action) =>
          action.type === "use_permanent_action" &&
          action.permanentId === blade.instanceId &&
          action.action === "equip",
      ),
    ).toBe(false);
  });
});
