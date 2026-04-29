import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  createBattle,
  getDerivedPermanentStat,
  getLegalActions,
  getPermanentCounterCount,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { TEST_CARD_DEFINITIONS, createTestBattle } from "./helpers.js";

const TARGETED_EFFECT_TEST_DEFINITIONS: CardDefinitionLibrary = {
  sentinel: {
    id: "sentinel",
    name: "Sentinel",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 4,
    health: 4,
    abilities: [],
  },
  mirror_blesser: {
    id: "mirror_blesser",
    name: "Mirror Blesser",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 2,
    health: 3,
    abilities: [
      {
        kind: "activated",
        id: "echo_blessing",
        activation: {
          type: "action",
          actionId: "echo_blessing",
        },
        targeting: {
          prompt: "Choose a creature to bless",
          allowSelfTarget: true,
        },
        effects: [
          {
            type: "add_counter",
            target: {
              zone: "battlefield",
              controller: "you",
              cardType: "creature",
            },
            powerDelta: 1,
            healthDelta: 1,
          },
        ],
      },
    ],
  },
  sanctified_guide: {
    id: "sanctified_guide",
    name: "Sanctified Guide",
    cardTypes: ["creature"],
    cost: 3,
    onPlay: [],
    power: 2,
    health: 4,
    abilities: [
      {
        kind: "activated",
        id: "bless_target",
        activation: {
          type: "action",
          actionId: "bless_target",
        },
        targeting: {
          prompt: "Choose a creature to bless",
          allowSelfTarget: false,
        },
        effects: [
          {
            type: "add_counter",
            target: {
              zone: "battlefield",
              controller: "you",
              cardType: "creature",
            },
            powerDelta: 1,
            healthDelta: 1,
          },
        ],
      },
    ],
  },
  targeted_smite: {
    id: "targeted_smite",
    name: "Targeted Smite",
    cardTypes: ["instant"],
    cost: 1,
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
          prompt: "Choose a creature to smite",
        },
        amount: { type: "constant", value: 3 },
      },
    ],
  },
  targeted_strike: {
    id: "targeted_strike",
    name: "Targeted Strike",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [
      {
        attackAmount: 4,
        target: {
          zone: "enemy_battlefield",
          controller: "opponent",
          cardType: "permanent",
        },
        targeting: {
          prompt: "Choose an enemy to strike",
        },
      },
    ],
  },
  restorative_touch: {
    id: "restorative_touch",
    name: "Restorative Touch",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [],
    spellEffects: [
      {
        type: "add_counter",
        target: {
          zone: "battlefield",
          controller: "any",
          cardType: "permanent",
        },
        targeting: {
          prompt: "Choose a permanent to heal",
        },
        healthDelta: 3,
      },
    ],
  },
  hexproof_curse: {
    id: "hexproof_curse",
    name: "Hexproof Curse",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [],
    spellEffects: [
      {
        type: "add_counter",
        target: {
          zone: "enemy_battlefield",
          controller: "opponent",
          cardType: "creature",
        },
        targeting: {
          prompt: "Choose an enemy creature to weaken",
        },
        powerDelta: -3,
      },
    ],
  },
  hexproof_shade: {
    id: "hexproof_shade",
    name: "Hexproof Shade",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 3,
    health: 5,
    keywords: ["hexproof"],
    abilities: [],
  },
  hexproof_enemy_leader: {
    id: "hexproof_enemy_leader",
    name: "Hexproof Enemy Leader",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 0,
    health: 0,
    keywords: ["hexproof"],
    abilities: [],
  },
};

function createTargetedEffectsBattle() {
  return createBattle({
    seed: 1,
    summoningSicknessPolicy: "disabled",
    cardDefinitions: {
      ...TEST_CARD_DEFINITIONS,
      ...TARGETED_EFFECT_TEST_DEFINITIONS,
    },
    playerDeck: [
      "guardian",
      "sentinel",
      "sanctified_guide",
      "targeted_smite",
      "attack",
    ],
    enemy: {
      name: "Targeted Effects Dummy",
      health: 30,
      basePower: 12,
      behavior: [{ attackAmount: 12 }],
    },
  });
}

describe("cloud arena targeted effects", () => {
  it("fizzles a targeted spell when there are no legal battlefield targets", () => {
    const battle = createBattle({
      seed: 1,
      summoningSicknessPolicy: "disabled",
      cardDefinitions: {
        ...TEST_CARD_DEFINITIONS,
        ...TARGETED_EFFECT_TEST_DEFINITIONS,
      },
      playerDeck: ["targeted_smite"],
      enemy: {
        name: "Targeting Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const smiteCard = battle.player.hand.find(
      (card) => card.definitionId === "targeted_smite",
    );

    if (!smiteCard) {
      throw new Error("Expected targeted_smite in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: smiteCard.instanceId,
    });

    expect(battle.pendingTargetRequest).toBeNull();
    expect(
      battle.player.discardPile.map((card) => card.definitionId),
    ).toContain("targeted_smite");
    expect(
      getLegalActions(battle).some((action) => action.type === "end_turn"),
    ).toBe(true);
  });

  it("does not let a targeted debuff choose a hexproof enemy creature", () => {
    const battle = createTestBattle({
      cardDefinitions: {
        ...TEST_CARD_DEFINITIONS,
        ...TARGETED_EFFECT_TEST_DEFINITIONS,
      },
      playerDeck: ["hexproof_curse"],
      enemy: {
        name: "Hexproof Target",
        health: 30,
        basePower: 12,
        definitionId: "hexproof_enemy_leader",
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const curseCard = battle.player.hand.find((card) => card.definitionId === "hexproof_curse");
    const hexproofLeader = battle.enemyBattlefield.find(
      (permanent) => permanent?.definitionId === "hexproof_enemy_leader",
    );

    if (!curseCard || !hexproofLeader) {
      throw new Error("Expected a hexproof curse and hexproof enemy leader in the battle setup.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: curseCard.instanceId,
    });

    expect(battle.pendingTargetRequest).toBeNull();
    expect(battle.player.discardPile.map((card) => card.definitionId)).toContain("hexproof_curse");
    expect(getDerivedPermanentStat(battle, hexproofLeader, "power")).toBe(12);
  });

  it("deals damage to the clicked creature", () => {
    const battle = createTargetedEffectsBattle();
    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find(
      (card) => card.definitionId === "guardian",
    );
    const sentinelCard = battle.player.hand.find(
      (card) => card.definitionId === "sentinel",
    );
    const smiteCard = battle.player.hand.find(
      (card) => card.definitionId === "targeted_smite",
    );

    if (!guardianCard || !sentinelCard || !smiteCard) {
      throw new Error("Expected targeted effect cards in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: sentinelCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: smiteCard.instanceId,
    });

    const sentinelPermanent = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "sentinel",
    );
    const guardianPermanent = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "guardian",
    );

    if (!sentinelPermanent || !guardianPermanent) {
      throw new Error("Expected both permanents on the battlefield.");
    }

    const smiteTargets = getLegalActions(battle);
    const sentinelTarget = smiteTargets.find(
      (action) =>
        action.type === "choose_target" &&
        action.targetPermanentId === sentinelPermanent.instanceId,
    );

    if (!sentinelTarget || sentinelTarget.type !== "choose_target") {
      throw new Error("Expected sentinel to be a legal smite target.");
    }

    applyBattleAction(battle, sentinelTarget);

    expect(
      battle.battlefield.find(
        (permanent) => permanent?.instanceId === sentinelPermanent.instanceId,
      )?.health,
    ).toBe(1);
    expect(
      battle.player.discardPile.map((card) => card.definitionId),
    ).toContain("targeted_smite");

  });

  it("lets an attack target a specific enemy permanent", () => {
    const battle = createBattle({
      seed: 1,
      summoningSicknessPolicy: "disabled",
      cardDefinitions: {
        ...TEST_CARD_DEFINITIONS,
        ...TARGETED_EFFECT_TEST_DEFINITIONS,
      },
      playerDeck: ["targeted_strike", "attack"],
      enemy: {
        name: "Targeting Dummy",
        health: 30,
        basePower: 12,
        startingTokens: ["token_imp"],
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const strikeCard = battle.player.hand.find(
      (card) => card.definitionId === "targeted_strike",
    );
    const targetToken = battle.enemyBattlefield.find(
      (entry): entry is NonNullable<typeof entry> =>
        entry !== null && entry.definitionId === "token_imp",
    );

    if (!strikeCard || !targetToken) {
      throw new Error(
        "Expected targeted_strike and an enemy token in the opening state.",
      );
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: strikeCard.instanceId,
    });

    expect(battle.pendingTargetRequest).toBeTruthy();
    expect(battle.pendingTargetRequest?.selector.zone).toBe(
      "enemy_battlefield",
    );

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: targetToken.instanceId,
    });

    expect(targetToken.health).toBe(0);
    expect(battle.pendingTargetRequest).toBeNull();
  });

  it("heals a permanent from either side of the battlefield", () => {
    const battle = createBattle({
      seed: 1,
      cardDefinitions: {
        ...TEST_CARD_DEFINITIONS,
        ...TARGETED_EFFECT_TEST_DEFINITIONS,
      },
      playerDeck: ["guardian", "restorative_touch"],
      enemy: {
        name: "Targeting Dummy",
        health: 30,
        basePower: 12,
        startingTokens: ["token_imp"],
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const healCard = battle.player.hand.find(
      (card) => card.definitionId === "restorative_touch",
    );
    const guardianCard = battle.player.hand.find(
      (card) => card.definitionId === "guardian",
    );
    const targetToken = battle.enemyBattlefield.find(
      (entry): entry is NonNullable<typeof entry> =>
        entry !== null && entry.definitionId === "token_imp",
    );

    if (!healCard || !guardianCard || !targetToken) {
      throw new Error(
        "Expected guardian, restorative_touch, and an enemy token in the opening state.",
      );
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: healCard.instanceId,
    });

    expect(battle.pendingTargetRequest).toBeTruthy();
    expect(battle.pendingTargetRequest?.selector.controller).toBe("any");

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: targetToken.instanceId,
    });

    expect(targetToken.maxHealth).toBe(7);
    expect(targetToken.health).toBe(7);
    expect(battle.pendingTargetRequest).toBeNull();
    expect(
      battle.player.discardPile.map((card) => card.definitionId),
    ).toContain("restorative_touch");
  });

  it("pauses a targeted permanent ability and resolves it onto the clicked creature", () => {
    const battle = createTargetedEffectsBattle();
    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find(
      (card) => card.definitionId === "guardian",
    );
    const sentinelCard = battle.player.hand.find(
      (card) => card.definitionId === "sentinel",
    );
    const guideCard = battle.player.hand.find(
      (card) => card.definitionId === "sanctified_guide",
    );

    if (!guardianCard || !sentinelCard || !guideCard) {
      throw new Error(
        "Expected guardian, sentinel, and sanctified_guide in opening hand.",
      );
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: sentinelCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guideCard.instanceId,
    });

    const guidePermanent = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "sanctified_guide",
    );
    const sentinelPermanent = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "sentinel",
    );

    if (!guidePermanent || !sentinelPermanent) {
      throw new Error("Expected both permanents on the battlefield.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: guidePermanent.instanceId,
      source: "ability",
      action: "bless_target",
      abilityId: "bless_target",
    });

    expect(battle.pendingTargetRequest).toBeTruthy();

    const targetChoices = getLegalActions(battle);
    const sentinelTarget = targetChoices.find(
      (action) =>
        action.type === "choose_target" &&
        action.targetPermanentId === sentinelPermanent.instanceId,
    );
    const selfTarget = targetChoices.find(
      (action) =>
        action.type === "choose_target" &&
        action.targetPermanentId === guidePermanent.instanceId,
    );

    if (!sentinelTarget || sentinelTarget.type !== "choose_target") {
      throw new Error(
        "Expected sentinel to be a legal target for the permanent ability.",
      );
    }

    applyBattleAction(battle, sentinelTarget);

    expect(battle.pendingTargetRequest).toBeNull();
    expect(sentinelPermanent.health).toBe(5);
    expect(getPermanentCounterCount(sentinelPermanent, "+1/+1")).toBe(2);
    expect(getPermanentCounterCount(guidePermanent, "+1/+1")).toBe(0);
    expect(selfTarget).toBeUndefined();
    expect(getDerivedPermanentStat(battle, sentinelPermanent, "power")).toBe(5);
    expect(guidePermanent.hasActedThisTurn).toBe(true);
    expect(
      battle.player.discardPile.map((card) => card.definitionId),
    ).not.toContain("sanctified_guide");
  });

  it("allows a permanent to target itself when its ability opts in", () => {
    const battle = createBattle({
      seed: 1,
      summoningSicknessPolicy: "disabled",
      cardDefinitions: {
        ...TEST_CARD_DEFINITIONS,
        ...TARGETED_EFFECT_TEST_DEFINITIONS,
      },
      playerDeck: ["mirror_blesser"],
      enemy: {
        name: "Targeting Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const mirrorBlesserCard = battle.player.hand.find(
      (card) => card.definitionId === "mirror_blesser",
    );

    if (!mirrorBlesserCard) {
      throw new Error("Expected mirror_blesser in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: mirrorBlesserCard.instanceId,
    });

    const mirrorBlesserPermanent = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "mirror_blesser",
    );

    if (!mirrorBlesserPermanent) {
      throw new Error("Expected mirror_blesser to be on the battlefield.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: mirrorBlesserPermanent.instanceId,
      source: "ability",
      action: "echo_blessing",
      abilityId: "echo_blessing",
    });

    const targetChoices = getLegalActions(battle);
    const selfTarget = targetChoices.find(
      (action) =>
        action.type === "choose_target" &&
        action.targetPermanentId === mirrorBlesserPermanent.instanceId,
    );

    if (!selfTarget || selfTarget.type !== "choose_target") {
      throw new Error(
        "Expected mirror_blesser to be allowed to target itself.",
      );
    }

    applyBattleAction(battle, selfTarget);

    expect(battle.pendingTargetRequest).toBeNull();
    expect(getPermanentCounterCount(mirrorBlesserPermanent, "+1/+1")).toBe(2);
    expect(
      getDerivedPermanentStat(battle, mirrorBlesserPermanent, "power"),
    ).toBe(3);
  });
});
