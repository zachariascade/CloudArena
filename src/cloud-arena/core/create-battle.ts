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
  createPermanentForEnemyActor,
  syncEnemyLeaderPermanentFromState,
  summonPermanentFromCard,
} from "./permanents.js";
import { processTriggeredAbilities } from "./triggers.js";
import type {
  BattleState,
  CardDefinitionId,
  CardInstance,
  CreateBattleInput,
  CreateBattleEnemyInput,
  EnemyActorState,
} from "./types.js";

function toCardInstances(deck: CardDefinitionId[]): CardInstance[] {
  return deck.map((definitionId, index) => ({
    instanceId: `card_${index + 1}`,
    definitionId,
  }));
}

function createEnemyActorState(input: {
  id: string;
  definitionId: CardDefinitionId | null;
  name: string;
  health: number;
  basePower: number;
  behavior: EnemyActorState["behavior"];
  cards: EnemyActorState["cards"];
  intent: EnemyActorState["intent"];
  currentCard: EnemyActorState["currentCard"];
}): EnemyActorState {
  return {
    id: input.id,
    definitionId: input.definitionId,
    name: input.name,
    health: input.health,
    maxHealth: input.health,
    block: 0,
    basePower: input.basePower,
    intent: input.intent,
    intentQueueLabels: [],
    behavior: input.behavior,
    cards: input.cards,
    behaviorIndex: 0,
    currentCardId: input.currentCard?.id ?? null,
    currentCard: input.currentCard,
    permanentId: null,
    stunnedThisTurn: false,
  };
}

function toCreateBattleEnemies(input: CreateBattleInput): CreateBattleEnemyInput[] {
  if (input.enemies && input.enemies.length > 0) {
    return input.enemies;
  }

  if (input.enemy) {
    return [input.enemy];
  }

  throw new Error("Battle must include at least one enemy definition.");
}

function getRequiredEnemyDefinitionId(enemy: CreateBattleEnemyInput): CardDefinitionId {
  const definitionId = enemy.definitionId ?? enemy.leaderDefinitionId;

  if (!definitionId) {
    throw new Error(`Enemy "${enemy.name}" must define a definitionId or leaderDefinitionId.`);
  }

  return definitionId;
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
  const battleEnemies = toCreateBattleEnemies(input);
  const primaryBattleEnemy = battleEnemies[0];
  const playerCreatureSlotCount = LEAN_V1_CREATURE_SLOT_COUNT;
  const playerNonCreatureSlotCount = LEAN_V1_NON_CREATURE_SLOT_COUNT;
  const enemyCreatureSlotCount = LEAN_V1_CREATURE_SLOT_COUNT;
  const enemyNonCreatureSlotCount = LEAN_V1_NON_CREATURE_SLOT_COUNT;

  if (!primaryBattleEnemy) {
    throw new Error("Battle must include at least one enemy definition.");
  }

  const initialEnemyPlan = getEnemyPlanStepAtIndexFromInput(primaryBattleEnemy, 0);
  const enemyBehavior =
    "behavior" in primaryBattleEnemy && primaryBattleEnemy.behavior ? primaryBattleEnemy.behavior : [];
  const enemyCards =
    "cards" in primaryBattleEnemy && primaryBattleEnemy.cards ? primaryBattleEnemy.cards : [];

  if (!initialEnemyPlan) {
    throw new Error("Enemy must include at least one behavior step or enemy card.");
  }

  const enemyActors: EnemyActorState[] = battleEnemies.map((enemyEntry, index) => {
        const isPrimaryEnemy = index === 0;
        return createEnemyActorState({
          id: `enemy_actor_${index + 1}`,
          definitionId: enemyEntry.definitionId ?? enemyEntry.leaderDefinitionId ?? null,
          name: enemyEntry.name,
          health: enemyEntry.health,
          basePower: enemyEntry.basePower,
          behavior: isPrimaryEnemy ? enemyBehavior : [],
          cards: isPrimaryEnemy ? enemyCards : [],
          intent: isPrimaryEnemy ? initialEnemyPlan.intent : {},
          currentCard: isPrimaryEnemy ? initialEnemyPlan.card : null,
        });
      });

  const primaryEnemyActor = enemyActors[0];

  if (!primaryEnemyActor) {
    throw new Error("Battle must include at least one enemy actor.");
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
      name: primaryEnemyActor.name,
      health: primaryEnemyActor.health,
      maxHealth: primaryEnemyActor.maxHealth,
      block: 0,
      basePower: primaryEnemyActor.basePower,
      leaderDefinitionId: primaryEnemyActor.definitionId,
      intent: primaryEnemyActor.intent,
      intentQueueLabels: [],
      behavior: enemyBehavior,
      cards: enemyCards,
      behaviorIndex: 0,
      currentCardId: primaryEnemyActor.currentCardId,
      currentCard: primaryEnemyActor.currentCard,
      leaderPermanentId: null,
      stunnedThisTurn: false,
    },
    enemies: enemyActors,
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

  const enemyLeaderPermanent = createPermanentForEnemyActor(state, primaryEnemyActor, {
    isLeader: true,
  });
  state.enemy.leaderPermanentId = enemyLeaderPermanent.instanceId;
  primaryEnemyActor.permanentId = enemyLeaderPermanent.instanceId;
  state.nextEnemyTokenIndex += 1;
  state.enemy.currentCard = primeEnemyCardForTurn(state, state.enemy.currentCard);
  state.enemy.intentQueueLabels = getEnemyIntentQueueLabels(state.enemy, 2);
  primaryEnemyActor.currentCard = state.enemy.currentCard;
  primaryEnemyActor.currentCardId = state.enemy.currentCardId ?? state.enemy.currentCard?.id ?? null;
  primaryEnemyActor.intentQueueLabels = [...state.enemy.intentQueueLabels];
  syncEnemyLeaderPermanentFromState(
    state,
    formatEnemyIntent(state.enemy.intent),
    state.enemy.intentQueueLabels,
  );

  for (const [index, enemyEntry] of battleEnemies.slice(1).entries()) {
    const actor = enemyActors[index + 1];

    if (!actor) {
      continue;
    }

    actor.definitionId = getRequiredEnemyDefinitionId(enemyEntry);
    const permanent = createPermanentForEnemyActor(state, actor, {
      isLeader: false,
    });
    actor.permanentId = permanent.instanceId;

    state.nextEnemyTokenIndex += 1;
  }

  const startingEnemyPermanents = battleEnemies.flatMap((enemyEntry) => enemyEntry.startingPermanents ?? []);

  for (const permanentCardId of startingEnemyPermanents) {
    summonPermanentFromCard(
      state,
      {
        instanceId: `card_${state.turnNumber}_${state.nextEnemyTokenIndex}`,
        definitionId: permanentCardId,
      },
      "enemy",
    );
    state.nextEnemyTokenIndex += 1;
  }

  const startingEnemyTokens = battleEnemies.flatMap((enemyEntry) => enemyEntry.startingTokens ?? []);

  for (const tokenCardId of startingEnemyTokens) {
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
