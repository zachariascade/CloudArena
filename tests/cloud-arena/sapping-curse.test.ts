import { describe, expect, it } from "vitest";

import { sappingCurseCardDefinition } from "../../src/cloud-arena/cards/definitions/sapping-curse.js";
import {
  applyBattleAction,
  getDerivedPermanentStat,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { TEST_CARD_DEFINITIONS, createTestBattle } from "./helpers.js";

const SAPPING_CURSE_TEST_DEFINITIONS: CardDefinitionLibrary = {
  ...TEST_CARD_DEFINITIONS,
  sapping_curse: sappingCurseCardDefinition,
};

describe("sapping curse", () => {
  it("reduces an enemy creature's power for one full turn", () => {
    const battle = createTestBattle({
      cardDefinitions: SAPPING_CURSE_TEST_DEFINITIONS,
      playerDeck: ["sapping_curse"],
      enemy: {
        health: 30,
        basePower: 0,
        behavior: [{ attackAmount: 0 }],
        startingPermanents: ["enemy_brute"],
      },
    });

    battle.player.energy = 10;

    const curseCard = battle.player.hand.find((card) => card.definitionId === "sapping_curse");
    const enemyBrute = battle.enemyBattlefield.find(
      (permanent) => permanent?.definitionId === "enemy_brute",
    );

    if (!curseCard || !enemyBrute) {
      throw new Error("Expected sapping curse and an enemy brute on the battlefield.");
    }

    expect(getDerivedPermanentStat(battle, enemyBrute, "power")).toBe(4);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: curseCard.instanceId,
    });

    const targetAction = battle.pendingTargetRequest
      ? {
          type: "choose_target" as const,
          targetPermanentId: enemyBrute.instanceId,
        }
      : null;

    if (!targetAction) {
      throw new Error("Expected a target request after casting sapping curse.");
    }

    applyBattleAction(battle, targetAction);

    expect(getDerivedPermanentStat(battle, enemyBrute, "power")).toBe(1);

    applyBattleAction(battle, {
      type: "end_turn",
    });

    expect(battle.player.health).toBe(99);
    expect(getDerivedPermanentStat(battle, enemyBrute, "power")).toBe(4);
  });
});
