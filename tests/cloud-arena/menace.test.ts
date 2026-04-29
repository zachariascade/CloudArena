import { describe, expect, it } from "vitest";

import { applyBattleAction } from "../../src/cloud-arena/core/engine.js";
import type { CardDefinition } from "../../src/cloud-arena/core/types.js";
import { createTestBattle, TEST_CARD_DEFINITIONS } from "./helpers.js";

const MENACE_DEMON_DEFINITION: CardDefinition = {
  id: "menace_demon",
  name: "Menace Demon",
  cardTypes: ["creature"],
  cost: 0,
  onPlay: [],
  playableInPlayerDecks: false,
  power: 0,
  health: 0,
  keywords: ["menace"],
  abilities: [],
};

const FREE_BLOCKER_DEFINITION: CardDefinition = {
  id: "free_blocker",
  name: "Free Blocker",
  cardTypes: ["creature"],
  cost: 0,
  onPlay: [],
  power: 1,
  health: 5,
  abilities: [],
};

describe("menace keyword", () => {
  it("a single blocker does not reduce damage from a menace attacker", () => {
    const battle = createTestBattle({
      cardDefinitions: { ...TEST_CARD_DEFINITIONS, menace_demon: MENACE_DEMON_DEFINITION },
      playerDeck: ["guardian", "defend", "attack", "attack", "defend"],
      enemy: {
        name: "Menace Demon",
        health: 30,
        basePower: 10,
        definitionId: "menace_demon",
        behavior: [{ attackAmount: 10 }],
      },
    });
    const startingHealth = battle.player.health;

    const guardianCard = battle.player.hand.find((c) => c.definitionId === "guardian");
    const defendCard = battle.player.hand.find((c) => c.definitionId === "defend");

    if (!guardianCard || !defendCard) throw new Error("Expected cards missing.");

    applyBattleAction(battle, { type: "play_card", cardInstanceId: guardianCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: defendCard.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    const guardian = battle.battlefield.find((p) => p?.definitionId === "guardian");

    if (!guardian) throw new Error("Expected guardian on battlefield.");

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardian.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.player.health).toBe(startingHealth - 13);
  });

  it("two blockers together do reduce damage from a menace attacker", () => {
    const battle = createTestBattle({
      cardDefinitions: { ...TEST_CARD_DEFINITIONS, menace_demon: MENACE_DEMON_DEFINITION, free_blocker: FREE_BLOCKER_DEFINITION },
      playerDeck: ["guardian", "free_blocker", "attack", "attack", "defend"],
      enemy: {
        name: "Menace Demon",
        health: 30,
        basePower: 10,
        definitionId: "menace_demon",
        behavior: [{ attackAmount: 10 }],
      },
    });
    const startingHealth = battle.player.health;

    const guardianCard = battle.player.hand.find((c) => c.definitionId === "guardian");
    const freeBlockerCard = battle.player.hand.find((c) => c.definitionId === "free_blocker");

    if (!guardianCard || !freeBlockerCard) throw new Error("Expected guardian and free_blocker in hand.");

    applyBattleAction(battle, { type: "play_card", cardInstanceId: guardianCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: freeBlockerCard.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    const guardian = battle.battlefield.find((p) => p?.definitionId === "guardian");
    const freeBlocker = battle.battlefield.find((p) => p?.definitionId === "free_blocker");

    if (!guardian || !freeBlocker) throw new Error("Expected both creatures on battlefield.");

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guardian.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: freeBlocker.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, { type: "end_turn" });

    expect(battle.player.health).toBe(startingHealth - 10);
  });
});
