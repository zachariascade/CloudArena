import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  destroyPermanent,
  getDerivedPermanentStat,
  getPermanentCounterCount,
  processTriggeredAbilities,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle } from "./helpers.js";

const TRIGGER_TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  offering_thrall: {
    id: "offering_thrall",
    name: "Offering Thrall",
    cardTypes: ["creature"],
    cost: 1,
    onPlay: [],
    power: 0,
    health: 4,
    abilities: [],
  },
  carrion_angel: {
    id: "carrion_angel",
    name: "Carrion Angel",
    cardTypes: ["creature"],
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    power: 3,
    health: 8,
    abilities: [
      {
        kind: "triggered",
        trigger: { event: "self_enters_battlefield" },
        effects: [
          {
            type: "sacrifice",
            selector: {
              zone: "battlefield",
              controller: "you",
              cardType: "permanent",
              relation: "another",
            },
            amount: 1,
            choice: "controller",
          },
        ],
      },
      {
        kind: "triggered",
        trigger: {
          event: "permanent_died",
          selector: {
            controller: "you",
            cardType: "permanent",
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
        ],
      },
    ],
  },
  guardian: {
    id: "guardian",
    name: "Guardian",
    cardTypes: ["creature"],
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    power: 4,
    health: 10,
    abilities: [
      {
        id: "guardian_apply_block",
        kind: "activated",
        activation: { type: "action", actionId: "apply_block" },
        effects: [{ type: "gain_block", target: "player", amount: { type: "constant", value: 3 } }],
      },
    ],
  },
  reliquary_shard: {
    id: "reliquary_shard",
    name: "Reliquary Shard",
    cardTypes: ["artifact"],
    cost: 1,
    onPlay: [],
    power: 0,
    health: 1,
    abilities: [],
  },
  graveyard_hymn: {
    id: "graveyard_hymn",
    name: "Graveyard Hymn",
    cardTypes: ["creature"],
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    power: 2,
    health: 2,
    abilities: [
      {
        kind: "triggered",
        trigger: {
          event: "permanent_died",
          selector: {
            relation: "self",
          },
        },
        effects: [
          {
            type: "add_counter",
            target: {
              zone: "battlefield",
              cardType: "creature",
            },
            powerDelta: 1,
            healthDelta: 1,
          },
        ],
      },
    ],
  },
  archive_sage: {
    id: "archive_sage",
    name: "Archive Sage",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 2,
    health: 4,
    abilities: [
      {
        kind: "triggered",
        trigger: { event: "self_enters_battlefield" },
        effects: [
          {
            type: "draw_card",
            target: "self",
            amount: { type: "constant", value: 1 },
          },
        ],
      },
    ],
  },
  farewell_sentinel: {
    id: "farewell_sentinel",
    name: "Farewell Sentinel",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 2,
    health: 3,
    abilities: [
      {
        kind: "triggered",
        trigger: {
          event: "permanent_left_battlefield",
          selector: {
            relation: "self",
          },
        },
        effects: [
          {
            type: "deal_damage",
            target: "enemy",
            amount: { type: "constant", value: 2 },
          },
        ],
      },
    ],
  },
  mourning_verse: {
    id: "mourning_verse",
    name: "Mourning Verse",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [],
    abilities: [
      {
        kind: "triggered",
        trigger: {
          event: "card_discarded",
          selector: {
            relation: "self",
          },
        },
        effects: [
          {
            type: "deal_damage",
            target: "enemy",
            amount: { type: "constant", value: 1 },
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

describe("cloud arena trigger resolution", () => {
  it("resolves enter triggers and chained death triggers deterministically", () => {
    const battle = createTestBattle({
      cardDefinitions: TRIGGER_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "offering_thrall",
        "carrion_angel",
        "archive_sage",
        "farewell_sentinel",
        "mourning_verse",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Trigger Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const thrallCard = battle.player.hand.find((card) => card.definitionId === "offering_thrall");
    const angelCard = battle.player.hand.find((card) => card.definitionId === "carrion_angel");

    if (!thrallCard || !angelCard) {
      throw new Error("Expected trigger test permanents in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: thrallCard.instanceId,
    });

    expect(battle.battlefield.filter(Boolean)).toHaveLength(1);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: angelCard.instanceId,
    });

    const permanents = battle.battlefield.filter((permanent) => permanent !== null);

    expect(permanents).toHaveLength(1);
    expect(permanents[0]?.definitionId).toBe("carrion_angel");
    expect(getPermanentCounterCount(permanents[0]!, "+1/+1")).toBe(2);
    expect(getDerivedPermanentStat(battle, permanents[0]!, "power")).toBe(4);
    expect(battle.player.graveyard.map((card) => card.definitionId)).toEqual(["offering_thrall"]);
    expect(
      battle.rules
        .filter((event) =>
          event.type === "card_played" ||
          (event.type === "permanent_entered" && event.definitionId !== "enemy_leader") ||
          event.type === "permanent_left_battlefield" ||
          event.type === "permanent_died" ||
          event.type === "counter_added",
        )
        .map((event) => event.type),
    ).toEqual([
      "card_played",
      "permanent_entered",
      "card_played",
      "permanent_entered",
      "permanent_left_battlefield",
      "permanent_died",
      "counter_added",
      "counter_added",
    ]);
    expect(battle.rulesCursor).toBe(battle.rules.length);
  });

  it("fires leave-battlefield and discard zone triggers", () => {
    const battle = createTestBattle({
      cardDefinitions: TRIGGER_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "farewell_sentinel",
        "mourning_verse",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Zone Change Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const sentinelCard = battle.player.hand.find((card) => card.definitionId === "farewell_sentinel");
    const verseCard = battle.player.hand.find((card) => card.definitionId === "mourning_verse");

    if (!sentinelCard || !verseCard) {
      throw new Error("Expected farewell_sentinel and mourning_verse in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: sentinelCard.instanceId,
    });

    const sentinelPermanent = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "farewell_sentinel",
    );

    if (!sentinelPermanent) {
      throw new Error("Expected farewell_sentinel on the battlefield.");
    }

    destroyPermanent(battle, sentinelPermanent.instanceId);
    processTriggeredAbilities(battle);

    expect(battle.enemy.health).toBe(28);
    expect(
      battle.rules.some((event) => event.type === "permanent_left_battlefield"),
    ).toBe(true);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: verseCard.instanceId,
    });

    expect(battle.enemy.health).toBe(27);
    expect(
      battle.rules.some((event) => event.type === "card_discarded" && event.cardInstanceId === verseCard.instanceId),
    ).toBe(true);
  });

  it("buffs only creatures when it dies", () => {
    const battle = createTestBattle({
      cardDefinitions: TRIGGER_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "guardian",
        "reliquary_shard",
        "graveyard_hymn",
        "offering_thrall",
        "attack",
        "defend",
      ],
      enemy: {
        name: "Graveyard Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const shardCard = battle.player.hand.find((card) => card.definitionId === "reliquary_shard");
    const hymnCard = battle.player.hand.find((card) => card.definitionId === "graveyard_hymn");

    if (!guardianCard || !shardCard || !hymnCard) {
      throw new Error("Expected guardian, reliquary_shard, and graveyard_hymn in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: shardCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: hymnCard.instanceId,
    });

    const hymnPermanent = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "graveyard_hymn",
    );
    const guardianPermanent = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "guardian",
    );
    const shardPermanent = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "reliquary_shard",
    );

    if (!hymnPermanent || !guardianPermanent || !shardPermanent) {
      throw new Error("Expected all permanents on the battlefield.");
    }

    destroyPermanent(battle, hymnPermanent.instanceId);
    processTriggeredAbilities(battle);

    expect(battle.player.graveyard.map((card) => card.definitionId)).toContain("graveyard_hymn");
    expect(getPermanentCounterCount(guardianPermanent, "+1/+1")).toBe(2);
    expect(getDerivedPermanentStat(battle, guardianPermanent, "power")).toBe(5);
    expect(getPermanentCounterCount(shardPermanent, "+1/+1")).toBe(0);
  });

  it("draws cards from an enter-the-battlefield trigger", () => {
    const battle = createTestBattle({
      cardDefinitions: TRIGGER_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "archive_sage",
        "attack",
        "defend",
        "attack",
        "defend",
        "offering_thrall",
      ],
      enemy: {
        name: "Draw Trigger Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const archiveSageCard = battle.player.hand.find((card) => card.definitionId === "archive_sage");

    if (!archiveSageCard) {
      throw new Error("Expected archive_sage in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: archiveSageCard.instanceId,
    });

    expect(
      battle.player.hand.map((card) => card.definitionId),
    ).toContain("offering_thrall");
    expect(
      battle.rules.filter((event) => event.type === "card_drawn").length,
    ).toBe(6);
  });
});
