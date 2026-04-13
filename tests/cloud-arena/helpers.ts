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
  guardian: {
    id: "guardian",
    name: "Guardian",
    cardTypes: ["creature"],
    cost: 2,
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
  enemy?: {
    name?: string;
    health?: number;
    basePower?: number;
    behavior?: EnemyBehaviorStep[];
    cards?: EnemyCardDefinition[];
  };
  seed?: number;
};

export function createTestBattle(input: CreateTestBattleInput): BattleState {
  return createBattle({
    seed: input.seed ?? 1,
    playerHealth: input.playerHealth ?? 100,
    cardDefinitions: input.cardDefinitions ?? TEST_CARD_DEFINITIONS,
    playerDeck: input.playerDeck,
    enemy: {
      name: input.enemy?.name ?? "Test Enemy",
      health: input.enemy?.health ?? 30,
      basePower: input.enemy?.basePower ?? 12,
      ...(input.enemy?.cards
        ? { cards: input.enemy.cards }
        : { behavior: input.enemy?.behavior ?? [{ attackAmount: 12 }] }),
    },
  });
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
    case "enemy_card_played":
      return `turn ${event.turnNumber}: enemy played ${event.cardId}`;
    case "block_gained":
      return `turn ${event.turnNumber}: ${event.target}${event.targetId ? ` ${event.targetId}` : ""} gained ${event.amount} block`;
    case "damage_dealt":
      return `turn ${event.turnNumber}: ${event.source}${event.sourceId ? ` ${event.sourceId}` : ""} dealt ${event.amount} damage to ${event.target}${event.targetId ? ` ${event.targetId}` : ""}`;
    case "permanent_summoned":
      return `turn ${event.turnNumber}: summoned ${event.definitionId} as ${event.permanentId} into slot ${event.slotIndex + 1}`;
    case "permanent_acted":
      return `turn ${event.turnNumber}: permanent ${event.permanentId} used ${event.action}`;
    case "enemy_intent_resolved":
      return `turn ${event.turnNumber}: enemy resolved ${formatEnemyIntent(event.intent)}`;
    case "permanent_destroyed":
      return `turn ${event.turnNumber}: permanent ${event.permanentId} (${event.definitionId}) was destroyed`;
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
