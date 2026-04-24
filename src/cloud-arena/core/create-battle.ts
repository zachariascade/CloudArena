import {
  LEAN_V1_CREATURE_SLOT_COUNT,
  LEAN_V1_DEFAULT_TURN_ENERGY,
  LEAN_V1_HAND_SIZE,
  LEAN_V1_NON_CREATURE_SLOT_COUNT,
  LEAN_V1_STARTING_PLAYER_HEALTH,
} from "./constants.js";
import { cardDefinitions } from "../cards/definitions.js";
import { drawUpToHandSize, shuffleCards } from "./draw.js";
import { primeEnemyCardForTurn } from "./enemy-card-effects.js";
import {
  getEnemyIntentQueueLabels,
  getEnemyPlanStepAtIndexFromInput,
} from "./enemy-plan.js";
import { formatEnemyIntent } from "./enemy-intent.js";
import {
  cleanupDefeatedPermanents,
  createEnemyPermanent,
  createEnemyLeaderPermanent,
  syncEnemyLeaderPermanentFromState,
  summonPermanentFromCard,
} from "./permanents.js";
import { processTriggeredAbilities } from "./triggers.js";
import type {
  BattleState,
  CardDefinitionId,
  CardInstance,
  CreateBattleInput,
} from "./types.js";

function toCardInstances(deck: CardDefinitionId[]): CardInstance[] {
  return deck.map((definitionId, index) => ({
    instanceId: `card_${index + 1}`,
    definitionId,
  }));
}

export function createBattle(input: CreateBattleInput): BattleState {
  const seed = input.seed ?? 1;
  const playerHealth = input.playerHealth ?? LEAN_V1_STARTING_PLAYER_HEALTH;
  const resolvedCardDefinitions = input.cardDefinitions
    ? {
        enemy_leader: cardDefinitions.enemy_leader,
        ...input.cardDefinitions,
      }
    : cardDefinitions;
  const initialDrawPile = input.shuffleDeck
    ? shuffleCards(toCardInstances(input.playerDeck), seed).map((card, index) => ({
        ...card,
        instanceId: `card_${index + 1}`,
      }))
    : toCardInstances(input.playerDeck);
  const initialEnemyPlan = getEnemyPlanStepAtIndexFromInput(input.enemy, 0);
  const enemyBehavior = "behavior" in input.enemy && input.enemy.behavior ? input.enemy.behavior : [];
  const enemyCards = "cards" in input.enemy && input.enemy.cards ? input.enemy.cards : [];
  const enemyLineup = input.enemyLineup ?? [];
  const playerCreatureSlotCount = LEAN_V1_CREATURE_SLOT_COUNT;
  const playerNonCreatureSlotCount = LEAN_V1_NON_CREATURE_SLOT_COUNT;
  const enemyCreatureSlotCount = LEAN_V1_CREATURE_SLOT_COUNT;
  const enemyNonCreatureSlotCount = LEAN_V1_NON_CREATURE_SLOT_COUNT;

  if (!initialEnemyPlan) {
    throw new Error("Enemy must include at least one behavior step or enemy card.");
  }

  const state: BattleState = {
    turnNumber: 1,
    phase: "player_action",
    seed,
    nextCounterIndex: 1,
    nextEnemyTokenIndex: 1,
    nextTargetRequestIndex: 1,
    cardDefinitions: resolvedCardDefinitions,
    playerCreatureSlotCount,
    playerNonCreatureSlotCount,
    enemyCreatureSlotCount,
    enemyNonCreatureSlotCount,
    player: {
      health: playerHealth,
      maxHealth: playerHealth,
      block: 0,
      energy: LEAN_V1_DEFAULT_TURN_ENERGY,
      drawPile: initialDrawPile,
      hand: [],
      discardPile: [],
      graveyard: [],
    },
    enemy: {
      name: input.enemy.name,
      health: input.enemy.health,
      maxHealth: input.enemy.health,
      block: 0,
      basePower: input.enemy.basePower,
      leaderDefinitionId: input.enemy.leaderDefinitionId ?? null,
      intent: initialEnemyPlan.intent,
      intentQueueLabels: [],
      behavior: enemyBehavior,
      cards: enemyCards,
      behaviorIndex: 0,
      currentCardId: initialEnemyPlan.card?.id ?? null,
      currentCard: initialEnemyPlan.card,
      leaderPermanentId: null,
      stunnedThisTurn: false,
    },
    battlefield: Array.from({ length: playerCreatureSlotCount + playerNonCreatureSlotCount }, () => null),
    enemyBattlefield: Array.from({ length: enemyCreatureSlotCount + enemyNonCreatureSlotCount }, () => null),
    pendingTargetRequest: null,
    blockingQueue: [],
    log: [
      {
        type: "battle_created",
        turnNumber: 1,
      },
    ],
    rules: [],
    rulesCursor: 0,
    choices: [],
    temporaryCounters: [],
    scheduledEnemyCardEffects: [],
  };

  const enemyLeaderPermanent = createEnemyLeaderPermanent(state, {
    name: input.enemy.name,
    health: input.enemy.health,
    basePower: input.enemy.basePower,
    intent: initialEnemyPlan.intent,
    definitionId: input.enemy.leaderDefinitionId,
  });
  state.enemy.leaderPermanentId = enemyLeaderPermanent.instanceId;
  state.nextEnemyTokenIndex += 1;
  state.enemy.currentCard = primeEnemyCardForTurn(state, state.enemy.currentCard);
  state.enemy.intentQueueLabels = getEnemyIntentQueueLabels(state.enemy, 2);
  syncEnemyLeaderPermanentFromState(
    state,
    formatEnemyIntent(state.enemy.intent),
    state.enemy.intentQueueLabels,
  );

  for (const enemyEntry of enemyLineup.slice(1)) {
    createEnemyPermanent(state, enemyEntry);
    state.nextEnemyTokenIndex += 1;
  }

  const startingEnemyTokens = enemyLineup.flatMap((enemyEntry) => enemyEntry.startingTokens ?? []);

  for (const tokenCardId of startingEnemyTokens.length > 0 ? startingEnemyTokens : (input.enemy.startingTokens ?? [])) {
    summonPermanentFromCard(
      state,
      {
        instanceId: `card_${state.turnNumber}_${state.nextEnemyTokenIndex}`,
        definitionId: tokenCardId,
      },
      "enemy",
    );
    state.nextEnemyTokenIndex += 1;
  }

  const openingDraw = drawUpToHandSize(state, LEAN_V1_HAND_SIZE);
  cleanupDefeatedPermanents(state);
  processTriggeredAbilities(state);
  cleanupDefeatedPermanents(state);
  state.log.push({
    type: "turn_started",
    turnNumber: 1,
    cardsDrawn: openingDraw.count,
    energy: state.player.energy,
    enemyIntent: state.enemy.intent,
  });
  for (const card of openingDraw.cards) {
    state.log.push({
      type: "card_drawn",
      turnNumber: 1,
      cardId: card.definitionId,
    });
  }

  return state;
}
