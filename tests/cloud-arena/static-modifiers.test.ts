import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  getDerivedPermanentActionAmount,
  getDerivedPermanentStat,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle } from "./helpers.js";

const STATIC_MODIFIER_CARD_DEFINITIONS: CardDefinitionLibrary = {
  angel_host: {
    id: "angel_host",
    name: "Angel Host",
    type: "permanent",
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    health: 10,
    actions: [{ attackAmount: 4 }],
  },
  angel_champion: {
    id: "angel_champion",
    name: "Angel Champion",
    type: "permanent",
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    health: 11,
    actions: [{ attackAmount: 5 }],
  },
  choir_captain: {
    id: "choir_captain",
    name: "Choir Captain",
    type: "permanent",
    cost: 3,
    subtypes: ["Angel"],
    onPlay: [],
    health: 9,
    actions: [{ attackAmount: 2 }],
    abilities: [
      {
        kind: "static",
        modifier: {
          target: "self",
          stat: "damage",
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

describe("cloud arena static modifiers", () => {
  it("recomputes permanent damage from static abilities based on board state", () => {
    const battle = createTestBattle({
      cardDefinitions: STATIC_MODIFIER_CARD_DEFINITIONS,
      playerDeck: [
        "choir_captain",
        "angel_host",
        "angel_champion",
        "attack",
        "defend",
      ],
      enemy: {
        name: "Static Dummy",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const captainCard = battle.player.hand.find((card) => card.definitionId === "choir_captain");
    const hostCard = battle.player.hand.find((card) => card.definitionId === "angel_host");
    const championCard = battle.player.hand.find((card) => card.definitionId === "angel_champion");

    if (!captainCard || !hostCard || !championCard) {
      throw new Error("Expected static modifier permanents in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: captainCard.instanceId,
    });

    const captain = battle.battlefield[0];

    if (!captain) {
      throw new Error("Expected choir_captain on battlefield.");
    }

    expect(getDerivedPermanentStat(battle, captain, "damage")).toBe(3);
    expect(getDerivedPermanentActionAmount(battle, captain, captain.actions[0]!)).toBe(3);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: hostCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: championCard.instanceId,
    });

    expect(getDerivedPermanentStat(battle, captain, "damage")).toBe(5);
    expect(getDerivedPermanentActionAmount(battle, captain, captain.actions[0]!)).toBe(5);

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: captain.instanceId,
      action: "attack",
    });

    expect(battle.enemy.health).toBe(35);
  });
});
