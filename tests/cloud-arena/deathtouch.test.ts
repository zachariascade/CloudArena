import { describe, expect, it } from "vitest";

import { applyBattleAction } from "../../src/cloud-arena/core/engine.js";
import type { CardDefinition } from "../../src/cloud-arena/core/types.js";
import { createTestBattle, TEST_CARD_DEFINITIONS } from "./helpers.js";

const DEATHTOUCH_ENEMY_DEFINITION: CardDefinition = {
  id: "deathtouch_enemy",
  name: "Viper Shade",
  cardTypes: ["creature"],
  cost: 0,
  onPlay: [],
  playableInPlayerDecks: false,
  power: 2,
  health: 4,
  keywords: ["deathtouch"],
  abilities: [],
};

const STURDY_CREATURE_DEFINITION: CardDefinition = {
  id: "sturdy_creature",
  name: "Sturdy Creature",
  cardTypes: ["creature"],
  cost: 0,
  onPlay: [],
  power: 3,
  health: 10,
  abilities: [],
};

describe("deathtouch keyword", () => {
  it("destroys a player creature that blocks a deathtouch enemy", () => {
    const battle = createTestBattle({
      cardDefinitions: {
        ...TEST_CARD_DEFINITIONS,
        deathtouch_enemy: DEATHTOUCH_ENEMY_DEFINITION,
        sturdy_creature: STURDY_CREATURE_DEFINITION,
      },
      playerDeck: ["sturdy_creature", "attack", "attack", "attack", "attack"],
      enemy: {
        name: "Viper Shade",
        health: 20,
        basePower: 2,
        definitionId: "deathtouch_enemy",
        behavior: [{ attackAmount: 2 }],
      },
    });

    const creatureCard = battle.player.hand.find((c) => c.definitionId === "sturdy_creature");
    if (!creatureCard) throw new Error("Expected sturdy_creature in hand.");

    applyBattleAction(battle, { type: "play_card", cardInstanceId: creatureCard.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    const creature = battle.battlefield.find((p) => p?.definitionId === "sturdy_creature");
    if (!creature) throw new Error("Expected sturdy_creature on battlefield.");

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: creature.instanceId,
      action: "defend",
    });
    applyBattleAction(battle, { type: "end_turn" });

    // The creature should be destroyed despite having 10 health
    const survivingCreature = battle.battlefield.find((p) => p?.definitionId === "sturdy_creature");
    expect(survivingCreature).toBeUndefined();
  });

  it("destroys a player creature that attacks a deathtouch enemy", () => {
    const battle = createTestBattle({
      cardDefinitions: {
        ...TEST_CARD_DEFINITIONS,
        deathtouch_enemy: DEATHTOUCH_ENEMY_DEFINITION,
        sturdy_creature: STURDY_CREATURE_DEFINITION,
      },
      playerDeck: ["sturdy_creature", "attack", "attack", "attack", "attack"],
      enemy: {
        name: "Viper Shade",
        health: 20,
        basePower: 2,
        definitionId: "deathtouch_enemy",
        behavior: [{ attackAmount: 0 }],
      },
    });

    const creatureCard = battle.player.hand.find((c) => c.definitionId === "sturdy_creature");
    if (!creatureCard) throw new Error("Expected sturdy_creature in hand.");

    applyBattleAction(battle, { type: "play_card", cardInstanceId: creatureCard.instanceId });
    applyBattleAction(battle, { type: "end_turn" });

    const creature = battle.battlefield.find((p) => p?.definitionId === "sturdy_creature");
    if (!creature) throw new Error("Expected sturdy_creature on battlefield.");

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: creature.instanceId,
      action: "attack",
    });

    // If the enemy is on the battlefield, need to choose target
    if (battle.pendingTargetRequest) {
      const enemyTarget = battle.enemyBattlefield.find((p) => p !== null);
      if (enemyTarget) {
        applyBattleAction(battle, {
          type: "choose_target",
          targetPermanentId: enemyTarget.instanceId,
        });
      }
    }

    // The attacker should be destroyed by deathtouch
    const survivingCreature = battle.battlefield.find((p) => p?.definitionId === "sturdy_creature");
    expect(survivingCreature).toBeUndefined();
  });
});
