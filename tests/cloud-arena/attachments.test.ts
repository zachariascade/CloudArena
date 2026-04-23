import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  attachPermanentToTarget,
  canAttachPermanentToTarget,
  detachPermanent,
  destroyPermanent,
  getDerivedPermanentStat,
  getLegalActions,
  isEquipmentPermanent,
  permanentHasKeyword,
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
    power: 1,
    health: 1,
    abilities: [],
  },
  refresh_signet: {
    id: "refresh_signet",
    name: "Refresh Signet",
    cardTypes: ["artifact"],
    cost: 1,
    subtypes: ["Equipment"],
    onPlay: [],
    power: 0,
    health: 1,
    grantedKeywords: ["refresh"],
    abilities: [],
  },
  halt_buckler: {
    id: "halt_buckler",
    name: "Halt Buckler",
    cardTypes: ["artifact"],
    cost: 1,
    subtypes: ["Equipment"],
    onPlay: [],
    power: 0,
    health: 1,
    grantedKeywords: ["halt"],
    abilities: [],
  },
  relic_altar: {
    id: "relic_altar",
    name: "Relic Altar",
    cardTypes: ["artifact"],
    cost: 2,
    onPlay: [],
    power: 0,
    health: 4,
    abilities: [],
  },
  enemy_leader: {
    id: "enemy_leader",
    name: "Enemy Leader",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 0,
    health: 0,
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
    expect(getDerivedPermanentStat(battle, angel, "power")).toBe(5);
    expect(angel.health).toBe(11);
    expect(angel.maxHealth).toBe(11);
  });

  it("removes equipment bonuses when the equipment detaches", () => {
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
    expect(getDerivedPermanentStat(battle, angel, "power")).toBe(5);
    expect(angel.health).toBe(11);
    expect(angel.maxHealth).toBe(11);

    detachPermanent(battle, blade.instanceId);

    expect(blade.attachedTo).toBeNull();
    expect(angel.attachments).toEqual([]);
    expect(getDerivedPermanentStat(battle, angel, "power")).toBe(4);
    expect(angel.health).toBe(10);
    expect(angel.maxHealth).toBe(10);
  });

  it("grants refresh from equipped equipment and removes it on detach", () => {
    const battle = createTestBattle({
      cardDefinitions: ATTACHMENT_TEST_CARD_DEFINITIONS,
      playerDeck: ["angel_bearer", "refresh_signet", "attack", "defend"],
      enemy: {
        name: "Attachment Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "angel_bearer" || entry.definitionId === "refresh_signet"
    )) {
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: card.instanceId,
      });
    }

    const angel = battle.battlefield.find((permanent) => permanent?.definitionId === "angel_bearer");
    const signet = battle.battlefield.find((permanent) => permanent?.definitionId === "refresh_signet");

    if (!angel || !signet) {
      throw new Error("Expected angel and refresh signet on battlefield.");
    }

    expect(permanentHasKeyword(angel, "refresh")).toBe(false);
    attachPermanentToTarget(battle, signet, angel);
    expect(permanentHasKeyword(angel, "refresh")).toBe(true);
    detachPermanent(battle, signet.instanceId);
    expect(permanentHasKeyword(angel, "refresh")).toBe(false);
  });

  it("grants halt from equipped equipment and removes it on detach", () => {
    const battle = createTestBattle({
      cardDefinitions: ATTACHMENT_TEST_CARD_DEFINITIONS,
      playerDeck: ["angel_bearer", "halt_buckler", "attack", "defend"],
      enemy: {
        name: "Attachment Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "angel_bearer" || entry.definitionId === "halt_buckler"
    )) {
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: card.instanceId,
      });
    }

    const angel = battle.battlefield.find((permanent) => permanent?.definitionId === "angel_bearer");
    const buckler = battle.battlefield.find((permanent) => permanent?.definitionId === "halt_buckler");

    if (!angel || !buckler) {
      throw new Error("Expected angel and halt buckler on battlefield.");
    }

    expect(permanentHasKeyword(angel, "halt")).toBe(false);
    attachPermanentToTarget(battle, buckler, angel);
    expect(permanentHasKeyword(angel, "halt")).toBe(true);
    detachPermanent(battle, buckler.instanceId);
    expect(permanentHasKeyword(angel, "halt")).toBe(false);
  });

  it("lets equipped refresh restore a damaged creature at round reset", () => {
    const battle = createTestBattle({
      cardDefinitions: ATTACHMENT_TEST_CARD_DEFINITIONS,
      playerDeck: ["angel_bearer", "refresh_signet", "attack", "defend", "attack"],
      enemy: {
        name: "Measured Foe",
        health: 30,
        basePower: 4,
        behavior: [{ attackAmount: 4 }, { attackAmount: 4 }],
      },
    });

    battle.player.energy = 10;

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "angel_bearer" || entry.definitionId === "refresh_signet"
    )) {
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: card.instanceId,
      });
    }

    const angel = battle.battlefield.find((permanent) => permanent?.definitionId === "angel_bearer");
    const signet = battle.battlefield.find((permanent) => permanent?.definitionId === "refresh_signet");

    if (!angel || !signet) {
      throw new Error("Expected angel and refresh signet on battlefield.");
    }

    attachPermanentToTarget(battle, signet, angel);
    applyBattleAction(battle, { type: "end_turn" });
    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: angel.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, { type: "end_turn" });

    expect(angel.maxHealth).toBe(11);
    expect(angel.health).toBe(11);
  });

  it("lets equipped halt stop overflow damage to the player", () => {
    const battle = createTestBattle({
      cardDefinitions: ATTACHMENT_TEST_CARD_DEFINITIONS,
      playerDeck: ["angel_bearer", "halt_buckler", "attack", "defend", "attack"],
      enemy: {
        name: "Heavy Foe",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }, { attackAmount: 12 }],
      },
    });
    battle.player.energy = 10;

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "angel_bearer" || entry.definitionId === "halt_buckler"
    )) {
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: card.instanceId,
      });
    }

    const angel = battle.battlefield.find((permanent) => permanent?.definitionId === "angel_bearer");
    const buckler = battle.battlefield.find((permanent) => permanent?.definitionId === "halt_buckler");

    if (!angel || !buckler) {
      throw new Error("Expected angel and halt buckler on battlefield.");
    }

    attachPermanentToTarget(battle, buckler, angel);
    applyBattleAction(battle, { type: "end_turn" });
    const healthAfterFirstAttack = battle.player.health;
    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: angel.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.player.health).toBe(healthAfterFirstAttack);
  });

  it("does not allow equipment to attach to non-creature permanents", () => {
    const battle = createTestBattle({
      cardDefinitions: ATTACHMENT_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "angel_bearer",
        "holy_blade",
        "relic_altar",
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

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "holy_blade" || entry.definitionId === "relic_altar"
    )) {
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: card.instanceId,
      });
    }

    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");
    const altar = battle.battlefield.find((permanent) => permanent?.definitionId === "relic_altar");

    if (!blade || !altar) {
      throw new Error("Expected holy_blade and relic_altar on battlefield.");
    }

    expect(canAttachPermanentToTarget(battle, blade, altar)).toBe(false);
    expect(() => attachPermanentToTarget(battle, blade, altar)).toThrow(/cannot be attached/);
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

  it("offers only creatures as equip targets", () => {
    const battle = createTestBattle({
      cardDefinitions: ATTACHMENT_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "angel_bearer",
        "holy_blade",
        "relic_altar",
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

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "angel_bearer" ||
      entry.definitionId === "holy_blade" ||
      entry.definitionId === "relic_altar"
    )) {
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: card.instanceId,
      });
    }

    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");
    const angel = battle.battlefield.find((permanent) => permanent?.definitionId === "angel_bearer");
    const altar = battle.battlefield.find((permanent) => permanent?.definitionId === "relic_altar");

    if (!blade || !angel || !altar) {
      throw new Error("Expected holy_blade, angel_bearer, and relic_altar on battlefield.");
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

    expect(battle.pendingTargetRequest?.prompt).toBe("Choose a creature to equip");

    const targetActions = getLegalActions(battle).filter(
      (action): action is Extract<BattleAction, { type: "choose_target" }> => action.type === "choose_target",
    );

    expect(targetActions).toHaveLength(1);
    expect(targetActions[0]?.targetPermanentId).toBe(angel.instanceId);
    expect(targetActions.some((action) => action.targetPermanentId === altar.instanceId)).toBe(false);
  });
});
