import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  createBattle,
  cardDefinitions,
  getDerivedPermanentStat,
  getLegalActions,
} from "../../src/cloud-arena/index.js";

describe("cloud arena ability costs", () => {
  it("lets activated abilities spend energy without tapping the permanent", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions,
      playerDeck: [
        "guardian",
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

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");

    if (!guardianCard) {
      throw new Error("Expected guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    const guardian = battle.battlefield[0];

    if (!guardian) {
      throw new Error("Expected guardian on battlefield.");
    }

    const applyBlockAction = getLegalActions(battle).find(
      (action) =>
        action.type === "use_permanent_action" &&
        action.permanentId === guardian.instanceId &&
        action.action === "apply_block",
    );

    if (!applyBlockAction || applyBlockAction.type !== "use_permanent_action") {
      throw new Error("Expected guardian apply_block ability to be legal.");
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

  it("taps permanents when an activated ability pays a tap cost", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions,
      playerDeck: [
        "sanctified_guide",
        "guardian",
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

    const guideCard = battle.player.hand.find((card) => card.definitionId === "sanctified_guide");
    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");

    if (!guideCard || !guardianCard) {
      throw new Error("Expected Sanctified Guide and Guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guideCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    const guide = battle.battlefield.find((permanent) => permanent?.definitionId === "sanctified_guide");
    const guardian = battle.battlefield.find((permanent) => permanent?.definitionId === "guardian");

    if (!guide || !guardian) {
      throw new Error("Expected both permanents on the battlefield.");
    }

    const blessAction = getLegalActions(battle).find(
      (action) =>
        action.type === "use_permanent_action" &&
        action.permanentId === guide.instanceId &&
        action.action === "bless_target",
    );

    if (!blessAction || blessAction.type !== "use_permanent_action") {
      throw new Error("Expected Sanctified Guide blessing ability to be legal.");
    }

    applyBattleAction(battle, blessAction);

    const targetAction = getLegalActions(battle).find(
      (action) =>
        action.type === "choose_target" &&
        action.targetPermanentId === guardian.instanceId,
    );

    if (!targetAction || targetAction.type !== "choose_target") {
      throw new Error("Expected a legal target for Sanctified Guide.");
    }

    applyBattleAction(battle, targetAction);

    expect(guide.isTapped).toBe(true);
    expect(getDerivedPermanentStat(battle, guardian, "power")).toBe(5);
    expect(guardian.health).toBe(5);
    expect(guardian.maxHealth).toBe(5);
    expect(
      getLegalActions(battle).some(
        (action) =>
          action.type === "use_permanent_action" &&
          action.permanentId === guide.instanceId &&
          action.action === "bless_target",
      ),
    ).toBe(false);

    applyBattleAction(battle, { type: "end_turn" });

    const refreshedGuide = battle.battlefield.find(
      (permanent) => permanent?.instanceId === guide.instanceId,
    );

    expect(refreshedGuide?.isTapped).toBe(false);
    expect(
      getLegalActions(battle).some(
        (action) =>
          action.type === "use_permanent_action" &&
          action.permanentId === guide.instanceId &&
          action.action === "bless_target",
      ),
    ).toBe(true);
  });
});
