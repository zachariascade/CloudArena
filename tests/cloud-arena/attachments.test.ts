import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  attachPermanentToTarget,
  canAttachPermanentToTarget,
  destroyPermanent,
  isEquipmentPermanent,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle } from "./helpers.js";

const ATTACHMENT_TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  angel_bearer: {
    id: "angel_bearer",
    name: "Angel Bearer",
    type: "permanent",
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    health: 10,
    actions: [{ attackAmount: 4 }],
  },
  faithful_squire: {
    id: "faithful_squire",
    name: "Faithful Squire",
    type: "permanent",
    cost: 2,
    onPlay: [],
    health: 8,
    actions: [{ blockAmount: 3 }],
  },
  holy_blade: {
    id: "holy_blade",
    name: "Holy Blade",
    type: "permanent",
    cost: 1,
    subtypes: ["Equipment"],
    onPlay: [],
    health: 1,
    actions: [],
  },
  attack: {
    id: "attack",
    name: "Attack",
    type: "instant",
    cost: 1,
    onPlay: [{ attackAmount: 6, target: "enemy" }],
  },
  defend: {
    id: "defend",
    name: "Defend",
    type: "instant",
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
});
