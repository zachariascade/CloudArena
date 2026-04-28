import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  createBattle,
  type CardDefinitionLibrary,
  getLegalActions,
  getDerivedPermanentStat,
  getPermanentCounterCount,
} from "../../src/cloud-arena/index.js";

describe("cloud arena prototype card definitions", () => {
  it("supports a sacrifice-on-play seraph that grows on creature deaths", () => {
    const cardDefs: CardDefinitionLibrary = {
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
              {
                type: "restore_health",
                target: "self",
              },
            ],
          },
        ],
      },
      sacrificial_bolt: {
        id: "sacrificial_bolt",
        name: "Sacrificial Bolt",
        cardTypes: ["instant"],
        cost: 0,
        onPlay: [],
        spellEffects: [
          {
            type: "deal_damage",
            target: {
              zone: "battlefield",
              controller: "you",
              cardType: "creature",
            },
            targeting: {
              prompt: "Choose a creature to strike",
            },
            amount: { type: "constant", value: 12 },
          },
        ],
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

    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions: cardDefs,
      playerDeck: [
        "test_guardian",
        "test_seraph",
        "test_guardian",
        "sacrificial_bolt",
        "attack",
        "defend",
      ],
      enemy: {
        name: "Prototype Dummy",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "test_guardian");
    const seraphCard = battle.player.hand.find((card) => card.definitionId === "test_seraph");
    const boltCard = battle.player.hand.find((card) => card.definitionId === "sacrificial_bolt");

    if (!guardianCard || !seraphCard || !boltCard) {
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

    const guardian = battle.battlefield.find((permanent) => permanent?.definitionId === "test_guardian");
    const targetAction = getLegalActions(battle).find(
      (action) =>
        action.type === "choose_target" &&
        guardian !== null &&
        action.targetPermanentId === guardian?.instanceId,
    );

    if (!targetAction || targetAction.type !== "choose_target" || !guardian) {
      throw new Error("Expected a legal sacrifice target for test_seraph.");
    }

    applyBattleAction(battle, targetAction);

    const seraph = battle.battlefield.find((permanent) => permanent?.definitionId === "test_seraph");

    if (!seraph) {
      throw new Error("Expected test_seraph on battlefield.");
    }

    expect(getPermanentCounterCount(seraph, "+1/+1")).toBe(2);
    expect(getDerivedPermanentStat(battle, seraph, "power")).toBe(4);
    expect(battle.player.graveyard.map((card) => card.definitionId)).toContain("test_guardian");

    const secondGuardianCard = battle.player.hand.find((card) => card.definitionId === "test_guardian");

    if (!secondGuardianCard) {
      throw new Error("Expected a second test_guardian in hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: secondGuardianCard.instanceId,
    });

    const secondGuardian = battle.battlefield.find(
      (permanent) => permanent?.sourceCardInstanceId === secondGuardianCard.instanceId,
    );

    if (!secondGuardian) {
      throw new Error("Expected a second test_guardian on battlefield.");
    }

    seraph.health = 2;

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: boltCard.instanceId,
    });

    const boltTargetAction = getLegalActions(battle).find(
      (action) =>
        action.type === "choose_target" &&
        action.targetPermanentId === secondGuardian.instanceId,
    );

    if (!boltTargetAction || boltTargetAction.type !== "choose_target") {
      throw new Error("Expected a legal target for sacrificial_bolt.");
    }

    applyBattleAction(battle, boltTargetAction);

    expect(getPermanentCounterCount(seraph, "+1/+1")).toBe(4);
    expect(seraph.health).toBe(seraph.maxHealth);
  });

  it("supports card_played and spell_cast triggers", () => {
    const cardDefs: CardDefinitionLibrary = {
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

    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions: cardDefs,
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

  it("supports a static power modifier that scales with a subtype count", () => {
    const cardDefs: CardDefinitionLibrary = {
      test_captain: {
        id: "test_captain",
        name: "Test Captain",
        cardTypes: ["creature"],
        subtypes: ["Angel"],
        cost: 3,
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
      test_angel: {
        id: "test_angel",
        name: "Test Angel",
        cardTypes: ["creature"],
        subtypes: ["Angel"],
        cost: 2,
        onPlay: [],
        power: 2,
        health: 4,
        abilities: [],
      },
      attack: {
        id: "attack",
        name: "Attack",
        cardTypes: ["instant"],
        cost: 1,
        onPlay: [{ attackAmount: 6, target: "enemy" }],
      },
    };

    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions: cardDefs,
      playerDeck: [
        "test_captain",
        "test_angel",
        "attack",
        "attack",
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

    const captainCard = battle.player.hand.find((card) => card.definitionId === "test_captain");
    const angelCard = battle.player.hand.find((card) => card.definitionId === "test_angel");

    if (!captainCard || !angelCard) {
      throw new Error("Expected test_captain and test_angel in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: captainCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: angelCard.instanceId,
    });

    const captain = battle.battlefield.find((permanent) => permanent?.definitionId === "test_captain");

    if (!captain) {
      throw new Error("Expected test_captain on battlefield.");
    }

    // 2 Angels on battlefield; captain base power 2 + 2 = 4
    expect(getDerivedPermanentStat(battle, captain, "power")).toBe(4);
  });

  it("supports an enchantment that gives block on ETB and on each subsequent permanent", () => {
    const cardDefs: CardDefinitionLibrary = {
      test_garden: {
        id: "test_garden",
        name: "Test Garden",
        cardTypes: ["enchantment"],
        cost: 3,
        onPlay: [],
        power: 0,
        health: 5,
        abilities: [
          {
            kind: "triggered",
            trigger: { event: "self_enters_battlefield" },
            effects: [
              {
                type: "gain_block",
                target: "player",
                amount: { type: "constant", value: 10 },
              },
            ],
          },
          {
            kind: "triggered",
            trigger: {
              event: "permanent_enters_battlefield",
              selector: {
                zone: "battlefield",
                controller: "you",
                cardType: "permanent",
                relation: "another",
              },
            },
            effects: [
              {
                type: "gain_block",
                target: "player",
                amount: { type: "constant", value: 5 },
              },
            ],
          },
        ],
      },
      test_creature: {
        id: "test_creature",
        name: "Test Creature",
        cardTypes: ["creature"],
        cost: 2,
        onPlay: [],
        power: 4,
        health: 4,
        abilities: [],
      },
      attack: {
        id: "attack",
        name: "Attack",
        cardTypes: ["instant"],
        cost: 1,
        onPlay: [{ attackAmount: 6, target: "enemy" }],
      },
    };

    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions: cardDefs,
      playerDeck: [
        "test_garden",
        "test_creature",
        "attack",
        "attack",
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

    const gardenCard = battle.player.hand.find((card) => card.definitionId === "test_garden");
    const creatureCard = battle.player.hand.find((card) => card.definitionId === "test_creature");

    if (!gardenCard || !creatureCard) {
      throw new Error("Expected test_garden and test_creature in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: gardenCard.instanceId,
    });

    expect(battle.player.block).toBe(10);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: creatureCard.instanceId,
    });

    expect(battle.player.block).toBe(15);
  });

  it("supports equipping an artifact to boost a creature's stats", () => {
    const cardDefs: CardDefinitionLibrary = {
      test_forger: {
        id: "test_forger",
        name: "Test Forger",
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

    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions: cardDefs,
      playerDeck: [
        "test_forger",
        "test_blade",
        "attack",
        "attack",
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

    const forgerCard = battle.player.hand.find((card) => card.definitionId === "test_forger");

    if (!forgerCard) {
      throw new Error("Expected test_forger in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: forgerCard.instanceId,
    });

    const bladeCard = battle.player.hand.find((card) => card.definitionId === "test_blade");

    if (!bladeCard) {
      throw new Error("Expected test_blade in hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bladeCard.instanceId,
    });

    const forger = battle.battlefield.find((permanent) => permanent?.definitionId === "test_forger");
    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "test_blade");

    if (!forger || !blade) {
      throw new Error("Expected test_forger and test_blade on battlefield.");
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
        action.targetPermanentId === forger.instanceId,
    );

    if (!targetAction || targetAction.type !== "choose_target") {
      throw new Error("Expected a legal target for test_blade.");
    }

    applyBattleAction(battle, targetAction);

    expect(blade.attachedTo).toBe(forger.instanceId);
    expect(forger.attachments).toContain(blade.instanceId);
    expect(getDerivedPermanentStat(battle, forger, "power")).toBe(3);
    expect(forger.health).toBe(5);
    expect(forger.maxHealth).toBe(5);
  });
});
