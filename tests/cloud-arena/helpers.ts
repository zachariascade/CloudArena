import {
  createBattle,
  formatEnemyIntent,
  type BattleEvent,
  type BattleState,
  type CardDefinitionLibrary,
  type CardDefinitionId,
  type EnemyCardDefinition,
  type EnemyBehaviorStep,
} from "../../src/cloud-arena/index.js";

export const TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  attack: {
    id: "attack",
    name: "Attack",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [{ attackAmount: 6, target: "enemy" }],
  },
  stunning_rebuke: {
    id: "stunning_rebuke",
    name: "Stunning Rebuke",
    cardTypes: ["instant"],
    cost: 2,
    onPlay: [],
    spellEffects: [
      {
        type: "stun",
        target: "enemy",
      },
    ],
  },
  defend: {
    id: "defend",
    name: "Defend",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [{ blockAmount: 7, target: "player" }],
  },
  defending_strike: {
    id: "defending_strike",
    name: "Defending Strike",
    cardTypes: ["instant"],
    cost: 2,
    onPlay: [
      { attackAmount: 4, target: "enemy" },
      { blockAmount: 4, target: "player" },
    ],
  },
  twin_strike: {
    id: "twin_strike",
    name: "Twin Strike",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [{ attackAmount: 3, attackTimes: 2, target: "enemy" }],
  },
  token_imp: {
    id: "token_imp",
    name: "Token Imp",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 2,
    health: 4,
    recoveryPolicy: "none",
    abilities: [],
  },
  enemy_husk: {
    id: "enemy_husk",
    name: "Demon Husk",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 2,
    health: 6,
    recoveryPolicy: "full_heal",
    abilities: [],
  },
  enemy_cocytus: {
    id: "enemy_cocytus",
    name: "Cocytus, Lake of Ice",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 0,
    health: 0,
    abilities: [],
  },
  enemy_brute: {
    id: "enemy_brute",
    name: "Demon Brute",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 4,
    health: 8,
    recoveryPolicy: "none",
    abilities: [],
  },
  enemy_shade: {
    id: "enemy_shade",
    name: "Enemy Shade",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 2,
    health: 6,
    recoveryPolicy: "none",
    abilities: [],
  },
  enemy_leader: {
    id: "enemy_leader",
    name: "Enemy Leader",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 0,
    health: 0,
    abilities: [],
  },
  enemy_targeted_smite: {
    id: "enemy_targeted_smite",
    name: "Enemy Targeted Smite",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [],
    spellEffects: [
      {
        type: "deal_damage",
        target: {
          zone: "enemy_battlefield",
          controller: "opponent",
          cardType: "permanent",
        },
        targeting: {
          prompt: "Choose an enemy token",
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
  guardian: {
    id: "guardian",
    name: "Guardian",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 4,
    health: 10,
    keywords: ["halt"],
    abilities: [
      {
        id: "guardian_apply_block",
        kind: "activated",
        activation: { type: "action", actionId: "apply_block" },
        effects: [{ type: "gain_block", target: "player", amount: { type: "constant", value: 3 } }],
      },
    ],
  },
  blade_dancer: {
    id: "blade_dancer",
    name: "Blade Dancer",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 6,
    health: 9,
    abilities: [
      {
        id: "blade_dancer_apply_block",
        kind: "activated",
        activation: { type: "action", actionId: "apply_block" },
        effects: [{ type: "gain_block", target: "player", amount: { type: "constant", value: 2 } }],
      },
    ],
  },
};

type CreateTestBattleInput = {
  cardDefinitions?: CardDefinitionLibrary;
  playerDeck: CardDefinitionId[];
  playerHealth?: number;
  summoningSicknessPolicy?: "enabled" | "disabled";
  enemy?: {
    name?: string;
    health?: number;
    basePower?: number;
    definitionId?: CardDefinitionId;
    behavior?: EnemyBehaviorStep[];
    cards?: EnemyCardDefinition[];
    startingTokens?: CardDefinitionId[];
    startingPermanents?: CardDefinitionId[];
    keywords?: string[];
  };
  seed?: number;
};

export function createTestBattle(input: CreateTestBattleInput): BattleState {
  return createBattle({
    seed: input.seed ?? 1,
    playerHealth: input.playerHealth ?? 100,
    cardDefinitions: input.cardDefinitions ?? TEST_CARD_DEFINITIONS,
    playerDeck: input.playerDeck,
    summoningSicknessPolicy: input.summoningSicknessPolicy ?? "enabled",
    enemy: {
      name: input.enemy?.name ?? "Test Enemy",
      health: input.enemy?.health ?? 30,
      basePower: input.enemy?.basePower ?? 12,
      definitionId: input.enemy?.definitionId,
      ...(input.enemy?.cards
        ? { cards: input.enemy.cards }
        : { behavior: input.enemy?.behavior ?? [{ attackAmount: 12 }] }),
      startingTokens: input.enemy?.startingTokens,
      startingPermanents: input.enemy?.startingPermanents,
    },
  });
}

export function getEnemyHealth(state: BattleState): number {
  const actor = state.enemies[0];
  if (!actor) return 0;
  const permanent = actor.permanentId
    ? state.enemyBattlefield.find((p) => p?.instanceId === actor.permanentId)
    : null;
  return permanent?.health ?? actor.health;
}

export function getEnemyBlock(state: BattleState): number {
  const actor = state.enemies[0];
  if (!actor) return 0;
  const permanent = actor.permanentId
    ? state.enemyBattlefield.find((p) => p?.instanceId === actor.permanentId)
    : null;
  return permanent?.block ?? actor.block;
}

export function getEnemyPermanent(state: BattleState) {
  const actor = state.enemies[0];
  if (!actor?.permanentId) return null;
  return state.enemyBattlefield.find((p) => p?.instanceId === actor.permanentId) ?? null;
}

export function requireCardInstanceId(state: BattleState, cardId: CardDefinitionId): string {
  const card = state.player.hand.find((entry) => entry.definitionId === cardId);

  if (!card) {
    throw new Error(`Expected ${cardId} in hand.`);
  }

  return card.instanceId;
}

export function requirePermanentId(state: BattleState): string {
  const permanent = state.battlefield.find((entry) => entry !== null);

  if (!permanent) {
    throw new Error("Expected a permanent on the battlefield.");
  }

  return permanent.instanceId;
}

export function formatBattleEvent(event: BattleEvent): string {
  switch (event.type) {
    case "battle_created":
      return `turn ${event.turnNumber}: battle created`;
    case "turn_started":
      return `turn ${event.turnNumber}: start turn, drew ${event.cardsDrawn}, energy ${event.energy}, enemy intent ${formatEnemyIntent(event.enemyIntent)}`;
    case "card_drawn":
      return `turn ${event.turnNumber}: player drew ${event.cardId}`;
    case "card_played":
      return `turn ${event.turnNumber}: played ${event.cardId}`;
    case "spell_cast":
      return `turn ${event.turnNumber}: cast ${event.cardId}`;
    case "enemy_card_played":
      return `turn ${event.turnNumber}: enemy played ${event.cardId}`;
    case "block_gained":
      return `turn ${event.turnNumber}: ${event.target}${event.targetId ? ` ${event.targetId}` : ""} gained ${event.amount} block`;
    case "energy_gained":
      return `turn ${event.turnNumber}: ${event.source}${event.sourceId ? ` ${event.sourceId}` : ""} gained ${event.amount} energy`;
    case "damage_dealt":
      return `turn ${event.turnNumber}: ${event.source}${event.sourceId ? ` ${event.sourceId}` : ""} dealt ${event.amount} damage to ${event.target}${event.targetId ? ` ${event.targetId}` : ""}`;
    case "permanent_summoned":
      return `turn ${event.turnNumber}: summoned ${event.definitionId} as ${event.permanentId} into slot ${event.slotIndex + 1}`;
    case "permanent_acted":
      return `turn ${event.turnNumber}: permanent ${event.permanentId} used ${event.action}`;
    case "enemy_intent_resolved":
      return `turn ${event.turnNumber}: enemy resolved ${formatEnemyIntent(event.intent)}`;
    case "enemy_power_gained":
      return `turn ${event.turnNumber}: enemy gained ${event.amount} power, base power now ${event.newBasePower}`;
    case "enemy_stunned":
      return `turn ${event.turnNumber}: enemy action was stunned and cancelled`;
    case "permanent_destroyed":
      return `turn ${event.turnNumber}: permanent ${event.permanentId} (${event.definitionId}) was destroyed`;
    case "permanent_sacrificed":
      return `turn ${event.turnNumber}: permanent ${event.permanentId} (${event.definitionId}) was sacrificed`;
    case "turn_ended":
      return `turn ${event.turnNumber}: end turn`;
    case "battle_finished":
      return `turn ${event.turnNumber}: battle finished, winner ${event.winner}, player hp ${event.playerHealth}, enemy hp ${event.enemyHealth}, permanents ${event.permanents.length > 0 ? event.permanents.map((permanent) => `${permanent.permanentId} ${permanent.health}/${permanent.maxHealth}`).join(", ") : "none"}`;
  }

  throw new Error(`Unhandled event ${(event as BattleEvent).type}`);
}

export function formatBattleLog(state: BattleState): string[] {
  return state.log.map(formatBattleEvent);
}
