import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  getDerivedPermanentStat,
  getPermanentCounterCount,
  resolveEffect,
  resolveEffects,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle } from "./helpers.js";

const EFFECT_TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  angel_host: {
    id: "angel_host",
    name: "Angel Host",
    cardTypes: ["creature"],
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    power: 4,
    health: 10,
    abilities: [],
  },
  altar_keeper: {
    id: "altar_keeper",
    name: "Altar Keeper",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 1,
    health: 8,
    abilities: [{ id: "altar_keeper_apply_block", kind: "activated", activation: { type: "action", actionId: "apply_block" }, effects: [{ type: "gain_block", target: "player", amount: { type: "constant", value: 3 } }] }],
  },
  lorekeeper: {
    id: "lorekeeper",
    name: "Lorekeeper",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 1,
    health: 4,
    abilities: [
      {
        id: "lorekeeper_study",
        kind: "activated",
        activation: { type: "action", actionId: "study" },
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
  vision_surge: {
    id: "vision_surge",
    name: "Vision Surge",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [],
    spellEffects: [
      {
        type: "draw_card",
        target: "player",
        amount: { type: "constant", value: 2 },
      },
    ],
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
  defend: {
    id: "defend",
    name: "Defend",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [{ blockAmount: 7, target: "player" }],
  },
  attack: {
    id: "attack",
    name: "Attack",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [{ attackAmount: 6, target: "enemy" }],
  },
  banner_blessing: {
    id: "banner_blessing",
    name: "Banner Blessing",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [],
    spellEffects: [
      {
        type: "add_counter",
        target: {
          zone: "battlefield",
          cardType: "permanent",
        },
        powerDelta: 1,
        healthDelta: 1,
      },
    ],
  },
  banner_purge: {
    id: "banner_purge",
    name: "Banner Purge",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [],
    spellEffects: [
      {
        type: "remove_counter",
        target: {
          zone: "battlefield",
          cardType: "permanent",
        },
        counter: "+1/+1",
        stat: "power",
        amount: { type: "constant", value: 1 },
      },
      {
        type: "remove_counter",
        target: {
          zone: "battlefield",
          cardType: "permanent",
        },
        counter: "+1/+1",
        stat: "health",
        amount: { type: "constant", value: 1 },
      },
    ],
  },
};

function createEffectBattle() {
  return createTestBattle({
    cardDefinitions: EFFECT_TEST_CARD_DEFINITIONS,
    playerDeck: [
      "angel_host",
      "altar_keeper",
      "holy_blade",
      "banner_blessing",
      "banner_purge",
    ],
    enemy: {
      name: "Effect Dummy",
      health: 30,
      basePower: 12,
      behavior: [{ attackAmount: 12 }],
    },
  });
}

function createDrawEffectBattle() {
  return createTestBattle({
    cardDefinitions: EFFECT_TEST_CARD_DEFINITIONS,
    playerDeck: [
      "vision_surge",
      "lorekeeper",
      "angel_host",
      "altar_keeper",
      "holy_blade",
      "attack",
      "defend",
      "attack",
      "defend",
    ],
    enemy: {
      name: "Draw Dummy",
      health: 30,
      basePower: 12,
      behavior: [{ attackAmount: 12 }],
    },
  });
}

describe("cloud arena effect primitives", () => {
  it("adds counters and emits counter_added rules events", () => {
    const battle = createEffectBattle();
    battle.player.energy = 10;

    const angelCard = battle.player.hand.find((card) => card.definitionId === "angel_host");

    if (!angelCard) {
      throw new Error("Expected angel_host in hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: angelCard.instanceId });

    const angelPermanent = battle.battlefield[0];

    if (!angelPermanent) {
      throw new Error("Expected angel_host on battlefield.");
    }

    resolveEffect(
      battle,
      {
        type: "add_counter",
        target: "self",
        powerDelta: 2,
      },
      { abilitySourcePermanentId: angelPermanent.instanceId },
    );

    expect(getPermanentCounterCount(angelPermanent, "+2/+0", "power")).toBe(1);
    expect(getDerivedPermanentStat(battle, angelPermanent, "power")).toBe(6);
    expect(battle.rules.at(-1)).toMatchObject({
      type: "counter_added",
      turnNumber: 1,
      permanentId: angelPermanent.instanceId,
      counter: "+2/+0",
      stat: "power",
      amount: 2,
      sourceKind: "permanent",
      sourceId: angelPermanent.instanceId,
    });
  });

  it("sacrifices matching permanents through the shared destroy path", () => {
    const battle = createEffectBattle();
    battle.player.energy = 10;

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "angel_host" || entry.definitionId === "altar_keeper"
    )) {
      applyBattleAction(battle, { type: "play_card", cardInstanceId: card.instanceId });
    }

    expect(battle.battlefield.filter(Boolean)).toHaveLength(2);

    resolveEffect(battle, {
      type: "sacrifice",
      selector: {
        zone: "battlefield",
        controller: "you",
        cardType: "permanent",
      },
      amount: 1,
      choice: "controller",
    });

    expect(battle.battlefield.filter(Boolean)).toHaveLength(1);
    expect(battle.player.graveyard).toHaveLength(1);
    expect(battle.rules.some((event) => event.type === "permanent_died")).toBe(true);
  });

  it("supports damage, block, summon, and attach primitives", () => {
    const battle = createEffectBattle();
    battle.player.energy = 10;

    const angelCard = battle.player.hand.find((card) => card.definitionId === "angel_host");

    if (!angelCard) {
      throw new Error("Expected angel_host in hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: angelCard.instanceId });

    const angelPermanent = battle.battlefield[0];

    if (!angelPermanent) {
      throw new Error("Expected angel_host on battlefield.");
    }

    resolveEffects(
      battle,
      [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 5 },
        },
        {
          type: "deal_damage",
          target: "enemy",
          amount: { type: "constant", value: 4 },
        },
        {
          type: "summon_permanent",
          cardId: "altar_keeper",
        },
        {
          type: "attach_from_hand",
          selector: {
            zone: "hand",
            controller: "you",
            cardType: "equipment",
          },
          target: "self",
          optional: true,
          cost: "free",
        },
      ],
      { abilitySourcePermanentId: angelPermanent.instanceId },
    );

    expect(battle.player.block).toBe(5);
    expect(battle.enemy.health).toBe(26);
    expect(battle.battlefield.filter(Boolean)).toHaveLength(3);
    expect(angelPermanent.attachments).toHaveLength(1);
    expect(
      battle.rules.some((event) => event.type === "attachment_attached"),
    ).toBe(true);
  });

  it("lets instant spells add and remove counters from battlefield permanents", () => {
    const battle = createEffectBattle();
    battle.player.energy = 10;

    const angelCard = battle.player.hand.find((card) => card.definitionId === "angel_host");
    const altarKeeperCard = battle.player.hand.find((card) => card.definitionId === "altar_keeper");
    const blessingCard = battle.player.hand.find((card) => card.definitionId === "banner_blessing");
    const purgeCard = battle.player.hand.find((card) => card.definitionId === "banner_purge");

    if (!angelCard || !altarKeeperCard || !blessingCard || !purgeCard) {
      throw new Error("Expected test cards in hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: angelCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: altarKeeperCard.instanceId });
    applyBattleAction(battle, { type: "play_card", cardInstanceId: blessingCard.instanceId });

    const battlefieldPermanents = battle.battlefield.filter(
      (permanent): permanent is NonNullable<typeof permanent> => permanent !== null,
    );

    expect(battlefieldPermanents).toHaveLength(2);
    expect(battlefieldPermanents.every((permanent) => getPermanentCounterCount(permanent, "+1/+1") === 2)).toBe(true);
    expect(getDerivedPermanentStat(battle, battlefieldPermanents[0]!, "power")).toBe(5);
    expect(getDerivedPermanentStat(battle, battlefieldPermanents[1]!, "power")).toBe(2);
    expect(battle.player.discardPile.map((card) => card.definitionId)).toContain("banner_blessing");

    applyBattleAction(battle, { type: "play_card", cardInstanceId: purgeCard.instanceId });

    expect(battlefieldPermanents.every((permanent) => getPermanentCounterCount(permanent, "+1/+1") === 0)).toBe(true);
    expect(battle.player.discardPile.map((card) => card.definitionId)).toContain("banner_purge");
  });

  it("draws cards from an instant spell and a permanent activated ability", () => {
    const battle = createDrawEffectBattle();
    battle.player.energy = 10;

    const visionSurgeCard = battle.player.hand.find((card) => card.definitionId === "vision_surge");
    const lorekeeperCard = battle.player.hand.find((card) => card.definitionId === "lorekeeper");
    const nextDrawCard = battle.player.drawPile[0];

    if (!visionSurgeCard || !lorekeeperCard || !nextDrawCard) {
      throw new Error("Expected draw-effect cards and a future draw in the battle setup.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: visionSurgeCard.instanceId });

    expect(battle.player.hand.map((card) => card.definitionId)).toContain(nextDrawCard.definitionId);
    expect(battle.player.discardPile.map((card) => card.definitionId)).toContain("vision_surge");
    expect(battle.rules.filter((event) => event.type === "card_drawn").length).toBe(7);

    applyBattleAction(battle, { type: "play_card", cardInstanceId: lorekeeperCard.instanceId });

    const lorekeeperPermanent = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "lorekeeper",
    );

    if (!lorekeeperPermanent) {
      throw new Error("Expected lorekeeper on the battlefield.");
    }

    const drawPileBefore = battle.player.drawPile.length;
    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: lorekeeperPermanent.instanceId,
      source: "ability",
      action: "study",
      abilityId: "lorekeeper_study",
    });

    expect(battle.player.hand.length).toBe(6);
    expect(battle.player.drawPile.length).toBe(drawPileBefore - 1);
  });
});
