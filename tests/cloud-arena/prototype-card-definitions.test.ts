import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  cardDefinitions,
  createBattle,
  type CardDefinitionLibrary,
  getLegalActions,
  getDerivedPermanentStat,
  getPermanentCounterCount,
} from "../../src/cloud-arena/index.js";

describe("cloud arena prototype card definitions", () => {
  it("supports sacrificial_seraph in the default card library", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions,
      playerDeck: [
        "guardian",
        "sacrificial_seraph",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Prototype Dummy",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const seraphCard = battle.player.hand.find((card) => card.definitionId === "sacrificial_seraph");

    if (!guardianCard || !seraphCard) {
      throw new Error("Expected prototype cards in opening hand.");
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

    const guardian = battle.battlefield.find((permanent) => permanent?.definitionId === "guardian");
    const targetAction = getLegalActions(battle).find(
      (action) =>
        action.type === "choose_target" &&
        guardian !== null &&
        action.targetPermanentId === guardian?.instanceId,
    );

    if (!targetAction || targetAction.type !== "choose_target" || !guardian) {
      throw new Error("Expected a legal sacrifice target for sacrificial_seraph.");
    }

    applyBattleAction(battle, targetAction);

    const seraph = battle.battlefield.find((permanent) => permanent?.definitionId === "sacrificial_seraph");

    if (!seraph) {
      throw new Error("Expected sacrificial_seraph on battlefield.");
    }

    expect(getPermanentCounterCount(seraph, "+1/+1")).toBe(2);
    expect(getDerivedPermanentStat(battle, seraph, "power")).toBe(4);
    expect(battle.player.graveyard.map((card) => card.definitionId)).toContain("guardian");
  });

  it("supports card_played and spell_cast triggers", () => {
    const cardDefinitionsWithTriggers: CardDefinitionLibrary = {
      ...cardDefinitions,
      herald_of_release: {
        id: "herald_of_release",
        name: "Herald of Release",
        cardTypes: ["creature"],
        cost: 2,
        onPlay: [],
        power: 2,
        health: 2,
        abilities: [
          {
            kind: "triggered",
            trigger: { event: "card_played", selector: { relation: "self" } },
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
      release_blessing: {
        id: "release_blessing",
        name: "Release Blessing",
        cardTypes: ["instant"],
        cost: 1,
        onPlay: [],
        abilities: [
          {
            kind: "triggered",
            trigger: { event: "spell_cast", selector: { relation: "self" } },
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
    };

    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions: cardDefinitionsWithTriggers,
      playerDeck: [
        "herald_of_release",
        "release_blessing",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Trigger Dummy",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const heraldCard = battle.player.hand.find((card) => card.definitionId === "herald_of_release");
    const blessingCard = battle.player.hand.find((card) => card.definitionId === "release_blessing");

    if (!heraldCard || !blessingCard) {
      throw new Error("Expected trigger cards in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: heraldCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: blessingCard.instanceId,
    });

    const herald = battle.battlefield.find((permanent) => permanent?.definitionId === "herald_of_release");

    if (!herald) {
      throw new Error("Expected herald_of_release on battlefield.");
    }

    expect(getPermanentCounterCount(herald, "+1/+1")).toBe(2);
    expect(getDerivedPermanentStat(battle, herald, "power")).toBe(3);
    expect(battle.player.block).toBe(4);
    expect(battle.rules.some((event) => event.type === "card_played")).toBe(true);
    expect(battle.rules.some((event) => event.type === "spell_cast")).toBe(true);
  });

  it("supports choir_captain static scaling in the default card library", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions,
      playerDeck: [
        "choir_captain",
        "guardian",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Prototype Dummy",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const captainCard = battle.player.hand.find((card) => card.definitionId === "choir_captain");
    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");

    if (!captainCard || !guardianCard) {
      throw new Error("Expected choir_captain and guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: captainCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    const captain = battle.battlefield.find((permanent) => permanent?.definitionId === "choir_captain");

    if (!captain) {
      throw new Error("Expected choir_captain on battlefield.");
    }

    expect(getDerivedPermanentStat(battle, captain, "power")).toBe(4);
  });

  it("supports garden_of_earthly_delights in the default card library", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions,
      playerDeck: [
        "garden_of_earthly_delights",
        "guardian",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Prototype Dummy",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const gardenCard = battle.player.hand.find((card) => card.definitionId === "garden_of_earthly_delights");
    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");

    if (!gardenCard || !guardianCard) {
      throw new Error("Expected garden_of_earthly_delights and guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: gardenCard.instanceId,
    });

    expect(battle.player.block).toBe(3);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    expect(battle.player.block).toBe(4);
  });

  it("supports armory_disciple equipping holy_blade in the default card library", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions,
      playerDeck: [
        "armory_disciple",
        "holy_blade",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Prototype Dummy",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const discipleCard = battle.player.hand.find((card) => card.definitionId === "armory_disciple");

    if (!discipleCard) {
      throw new Error("Expected armory_disciple in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: discipleCard.instanceId,
    });

    const bladeCard = battle.player.hand.find((card) => card.definitionId === "holy_blade");

    if (!bladeCard) {
      throw new Error("Expected holy_blade in hand after playing armory_disciple.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bladeCard.instanceId,
    });

    const disciple = battle.battlefield.find((permanent) => permanent?.definitionId === "armory_disciple");
    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");

    if (!disciple || !blade) {
      throw new Error("Expected armory_disciple and holy_blade on battlefield.");
    }

    const equipAction = getLegalActions(battle).find(
      (action) =>
        action.type === "use_permanent_action" &&
        action.permanentId === blade.instanceId &&
        action.action === "equip",
    );

    if (!equipAction || equipAction.type !== "use_permanent_action") {
      throw new Error("Expected equip action for holy_blade.");
    }

    applyBattleAction(battle, equipAction);

    const targetAction = getLegalActions(battle).find(
      (action) =>
        action.type === "choose_target" &&
        action.targetPermanentId === disciple.instanceId,
    );

    if (!targetAction || targetAction.type !== "choose_target") {
      throw new Error("Expected a legal target for holy_blade.");
    }

    applyBattleAction(battle, targetAction);

    expect(blade.attachedTo).toBe(disciple.instanceId);
    expect(disciple.attachments).toContain(blade.instanceId);
    expect(getDerivedPermanentStat(battle, disciple, "power")).toBe(3);
    expect(disciple.health).toBe(5);
    expect(disciple.maxHealth).toBe(5);
  });
});
