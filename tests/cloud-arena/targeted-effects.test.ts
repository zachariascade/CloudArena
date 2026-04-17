import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  cardDefinitions,
  createBattle,
  getDerivedPermanentStat,
  getLegalActions,
  getPermanentCounterCount,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";

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
  forced_sacrifice: {
    id: "forced_sacrifice",
    name: "Forced Sacrifice",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [],
    spellEffects: [
      {
        type: "sacrifice",
        selector: {
          zone: "battlefield",
          controller: "you",
          cardType: "permanent",
        },
        targeting: {
          prompt: "Choose a permanent to sacrifice",
        },
        amount: 1,
        choice: "controller",
      },
    ],
  },
};

function createTargetedEffectsBattle() {
  return createBattle({
    seed: 1,
    cardDefinitions: {
      ...cardDefinitions,
      ...TARGETED_EFFECT_TEST_DEFINITIONS,
    },
    playerDeck: [
      "guardian",
      "sentinel",
      "sanctified_guide",
      "targeted_smite",
      "forced_sacrifice",
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
      cardDefinitions: {
        ...cardDefinitions,
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

    const smiteCard = battle.player.hand.find((card) => card.definitionId === "targeted_smite");

    if (!smiteCard) {
      throw new Error("Expected targeted_smite in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: smiteCard.instanceId,
    });

    expect(battle.pendingTargetRequest).toBeNull();
    expect(battle.player.discardPile.map((card) => card.definitionId)).toContain("targeted_smite");
    expect(getLegalActions(battle).some((action) => action.type === "end_turn")).toBe(true);
  });

  it("deals damage to the clicked creature and sacrifices the clicked permanent", () => {
    const battle = createTargetedEffectsBattle();
    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const sentinelCard = battle.player.hand.find((card) => card.definitionId === "sentinel");
    const smiteCard = battle.player.hand.find((card) => card.definitionId === "targeted_smite");
    const sacrificeCard = battle.player.hand.find(
      (card) => card.definitionId === "forced_sacrifice",
    );

    if (!guardianCard || !sentinelCard || !smiteCard || !sacrificeCard) {
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
      (action) => action.type === "choose_target" && action.targetPermanentId === sentinelPermanent.instanceId,
    );

    if (!sentinelTarget || sentinelTarget.type !== "choose_target") {
      throw new Error("Expected sentinel to be a legal smite target.");
    }

    applyBattleAction(battle, sentinelTarget);

    expect(
      battle.battlefield.find((permanent) => permanent?.instanceId === sentinelPermanent.instanceId)?.health,
    ).toBe(1);
    expect(battle.player.discardPile.map((card) => card.definitionId)).toContain("targeted_smite");

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: sacrificeCard.instanceId,
    });

    const sacrificeTargets = getLegalActions(battle);
    const guardianTarget = sacrificeTargets.find(
      (action) => action.type === "choose_target" && action.targetPermanentId === guardianPermanent.instanceId,
    );

    if (!guardianTarget || guardianTarget.type !== "choose_target") {
      throw new Error("Expected guardian to be a legal sacrifice target.");
    }

    applyBattleAction(battle, guardianTarget);

    expect(
      battle.battlefield.find((permanent) => permanent?.instanceId === guardianCard.instanceId),
    ).toBeUndefined();
    expect(battle.player.graveyard.map((card) => card.definitionId)).toContain("guardian");
    expect(battle.player.discardPile.map((card) => card.definitionId)).toContain("forced_sacrifice");
  });

  it("lets an attack target a specific enemy permanent", () => {
    const battle = createBattle({
      seed: 1,
      cardDefinitions: {
        ...cardDefinitions,
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

    const strikeCard = battle.player.hand.find((card) => card.definitionId === "targeted_strike");
    const targetToken = battle.enemyBattlefield.find((entry) => entry !== null);

    if (!strikeCard || !targetToken) {
      throw new Error("Expected targeted_strike and an enemy token in the opening state.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: strikeCard.instanceId,
    });

    expect(battle.pendingTargetRequest).toBeTruthy();
    expect(battle.pendingTargetRequest?.selector.zone).toBe("enemy_battlefield");

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: targetToken.instanceId,
    });

    expect(targetToken.health).toBe(0);
    expect(battle.pendingTargetRequest).toBeNull();
  });

  it("pauses a targeted permanent ability and resolves it onto the clicked creature", () => {
    const battle = createTargetedEffectsBattle();
    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const sentinelCard = battle.player.hand.find((card) => card.definitionId === "sentinel");
    const guideCard = battle.player.hand.find((card) => card.definitionId === "sanctified_guide");

    if (!guardianCard || !sentinelCard || !guideCard) {
      throw new Error("Expected guardian, sentinel, and sanctified_guide in opening hand.");
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
      (action) => action.type === "choose_target" && action.targetPermanentId === sentinelPermanent.instanceId,
    );
    const selfTarget = targetChoices.find(
      (action) => action.type === "choose_target" && action.targetPermanentId === guidePermanent.instanceId,
    );

    if (!sentinelTarget || sentinelTarget.type !== "choose_target") {
      throw new Error("Expected sentinel to be a legal target for the permanent ability.");
    }

    applyBattleAction(battle, sentinelTarget);

    expect(battle.pendingTargetRequest).toBeNull();
    expect(sentinelPermanent.health).toBe(5);
    expect(getPermanentCounterCount(sentinelPermanent, "+1/+1")).toBe(2);
    expect(getPermanentCounterCount(guidePermanent, "+1/+1")).toBe(0);
    expect(selfTarget).toBeUndefined();
    expect(getDerivedPermanentStat(battle, sentinelPermanent, "power")).toBe(5);
    expect(guidePermanent.hasActedThisTurn).toBe(true);
    expect(battle.player.discardPile.map((card) => card.definitionId)).not.toContain(
      "sanctified_guide",
    );
  });

  it("allows a permanent to target itself when its ability opts in", () => {
    const battle = createBattle({
      seed: 1,
      cardDefinitions: {
        ...cardDefinitions,
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

    const mirrorBlesserCard = battle.player.hand.find((card) => card.definitionId === "mirror_blesser");

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
      (action) => action.type === "choose_target" && action.targetPermanentId === mirrorBlesserPermanent.instanceId,
    );

    if (!selfTarget || selfTarget.type !== "choose_target") {
      throw new Error("Expected mirror_blesser to be allowed to target itself.");
    }

    applyBattleAction(battle, selfTarget);

    expect(battle.pendingTargetRequest).toBeNull();
    expect(getPermanentCounterCount(mirrorBlesserPermanent, "+1/+1")).toBe(2);
    expect(getDerivedPermanentStat(battle, mirrorBlesserPermanent, "power")).toBe(3);
  });
});
