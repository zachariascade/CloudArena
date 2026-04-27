import {
  formatEnemyIntent,
  getCardDefinitionFromLibrary,
  getEnemyPlanStepAtIndexFromInput,
  getActivatedAbilities,
  formatAbilityCosts,
  hasCardType,
  isPermanentCardDefinition,
  type ActivatedAbility,
  type BattleEvent,
  type CardDefinitionLibrary,
  type CardDefinitionId,
  type CardInstance,
  type EnemyIntent,
  type SimulationActionRecord,
  type SimulationTrace,
} from "../../../../src/cloud-arena/index.js";
import { summarizeCardDefinition } from "../../../../src/cloud-arena/card-summary.js";

export type TraceViewerStepCommand = "first" | "previous" | "next" | "last";

export type TraceViewerCardSnapshot = {
  instanceId: string;
  definitionId: CardDefinitionId;
  name: string;
  cost: number;
  effectSummary: string;
};

export type TraceViewerPermanentSnapshot = {
  instanceId: string;
  sourceCardInstanceId: string;
  definitionId: CardDefinitionId;
  name: string;
  isCreature: boolean;
  power: number;
  health: number;
  maxHealth: number;
  block: number;
  hasActedThisTurn: boolean;
  isTapped: boolean;
  isDefending: boolean;
  slotIndex: number;
  actions: ActivatedAbility[];
};

export type TraceViewerStepViewModel = {
  stepIndex: number;
  turnNumber: number;
  actionRecord: SimulationActionRecord | null;
  player: {
    health: number;
    maxHealth: number;
    block: number;
    energy: number;
    hand: TraceViewerCardSnapshot[];
    drawPile: TraceViewerCardSnapshot[];
    drawPileCount: number;
    discardPile: TraceViewerCardSnapshot[];
    graveyard: TraceViewerCardSnapshot[];
  };
  enemy: {
    name: string;
    health: number;
    maxHealth: number;
    block: number;
    intent: EnemyIntent;
    intentLabel: string;
  };
  battlefield: Array<TraceViewerPermanentSnapshot | null>;
  blockingQueue: string[];
  visibleLog: BattleEvent[];
  currentEvents: BattleEvent[];
};

export type TraceViewerEventGroup = {
  turnNumber: number;
  events: Array<{
    event: BattleEvent;
    isCurrentEvent: boolean;
  }>;
};

type TraceViewerReplayState = {
  turnNumber: number;
  cardDefinitions: CardDefinitionLibrary;
  player: {
    health: number;
    maxHealth: number;
    block: number;
    energy: number;
    drawPile: CardInstance[];
    hand: CardInstance[];
    discardPile: CardInstance[];
    graveyard: CardInstance[];
  };
  enemy: {
    name: string;
    health: number;
    maxHealth: number;
    block: number;
    intent: EnemyIntent;
    intentLabel: string;
  };
  battlefield: Array<TraceViewerPermanentSnapshot | null>;
  blockingQueue: string[];
  drawCountThisTurn: number;
  enemyStunnedThisTurn: boolean;
};

function cloneCards(cards: CardInstance[]): CardInstance[] {
  return cards.map((card) => ({ ...card }));
}

function cloneBattlefield(
  battlefield: Array<TraceViewerPermanentSnapshot | null>,
): Array<TraceViewerPermanentSnapshot | null> {
  return battlefield.map((permanent) =>
    permanent
      ? {
          ...permanent,
          actions: permanent.actions.map((ability) => ({ ...ability })),
        }
      : null,
  );
}

function createSeededRandom(seed: number): () => number {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

function shuffleCards(cards: CardInstance[], seed: number): CardInstance[] {
  const random = createSeededRandom(seed);
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    const next = shuffled[swapIndex];

    shuffled[index] = next!;
    shuffled[swapIndex] = current!;
  }

  return shuffled;
}

function createDeckInstances(deck: CardDefinitionId[]): CardInstance[] {
  return deck.map((definitionId, index) => ({
    instanceId: `card_${index + 1}`,
    definitionId,
  }));
}

function toCardSnapshot(
  cardDefinitions: CardDefinitionLibrary,
  card: CardInstance,
): TraceViewerCardSnapshot {
  const definition = getCardDefinitionFromLibrary(cardDefinitions, card.definitionId);

  return {
    instanceId: card.instanceId,
    definitionId: card.definitionId,
    name: definition.name,
    cost: definition.cost,
    effectSummary: summarizeCardDefinition(definition).join(" • "),
  };
}

function createInitialReplayState(trace: SimulationTrace): TraceViewerReplayState {
  const traceEnemy = trace.config.enemy;

  if (!traceEnemy) {
    throw new Error("Trace config must include a primary enemy.");
  }

  const initialEnemyPlan = getEnemyPlanStepAtIndexFromInput(traceEnemy, 0);
  const boardSize = Math.max(1, trace.finalSummary.battlefield.length);

  if (!initialEnemyPlan) {
    throw new Error("Trace enemy plan must include an initial step.");
  }

  return {
    turnNumber: 1,
    cardDefinitions: trace.config.cardDefinitions ?? {},
    player: {
      health: trace.config.playerHealth,
      maxHealth: trace.config.playerHealth,
      block: 0,
      energy: 0,
      drawPile: createDeckInstances(trace.config.playerDeck),
      hand: [],
      discardPile: [],
      graveyard: [],
    },
    enemy: {
      name: traceEnemy.name,
      health: traceEnemy.health,
      maxHealth: traceEnemy.health,
      block: 0,
      intent: initialEnemyPlan.intent,
      intentLabel: formatEnemyIntent(initialEnemyPlan.intent),
    },
    battlefield: Array.from({ length: boardSize }, () => null),
    blockingQueue: [],
    drawCountThisTurn: 0,
    enemyStunnedThisTurn: false,
  };
}

function applyDamageToBlockAndHealth(
  target: { block: number; health: number },
  amount: number,
): void {
  const damageToBlock = Math.min(target.block, amount);
  target.block -= damageToBlock;
  const remainingDamage = amount - damageToBlock;
  target.health = Math.max(0, target.health - remainingDamage);
}

function moveHandToDiscard(state: TraceViewerReplayState): void {
  if (state.player.hand.length === 0) {
    return;
  }

  state.player.discardPile.push(...state.player.hand);
  state.player.hand = [];
}

function drawMatchingCard(
  state: TraceViewerReplayState,
  trace: SimulationTrace,
  expectedDefinitionId: CardDefinitionId,
): CardInstance {
  if (state.player.drawPile.length === 0) {
    if (state.player.discardPile.length === 0) {
      throw new Error(`Trace tried to draw ${expectedDefinitionId} with no cards remaining.`);
    }

    state.player.drawPile = shuffleCards(
      state.player.discardPile,
      trace.config.seed + state.turnNumber + state.drawCountThisTurn,
    );
    state.player.discardPile = [];
  }

  const exactTopCard = state.player.drawPile[0];

  if (!exactTopCard) {
    throw new Error(`Trace could not draw expected card ${expectedDefinitionId}.`);
  }

  let nextCard = state.player.drawPile.shift();

  if (!nextCard) {
    throw new Error(`Trace could not draw expected card ${expectedDefinitionId}.`);
  }

  if (nextCard.definitionId !== expectedDefinitionId) {
    const matchingIndex = state.player.drawPile.findIndex(
      (card) => card.definitionId === expectedDefinitionId,
    );

    if (matchingIndex === -1) {
      // If the replay trace and deck ordering drift apart, keep the viewer moving
      // by accepting the actual top card instead of hard-failing the whole page.
      // This preserves the trace viewer for layout/debugging even when the exact
      // hidden draw order changes slightly.
      state.player.hand.push(nextCard);
      state.drawCountThisTurn += 1;
      return nextCard;
    }

    const [matchingCard] = state.player.drawPile.splice(matchingIndex, 1);

    if (!matchingCard) {
      throw new Error(`Trace could not recover expected card ${expectedDefinitionId}.`);
    }

    // The replay trace only records the drawn definition id, not the exact duplicate
    // instance that was drawn. When duplicate cards exist after a reshuffle, prefer
    // consuming a matching hidden card so the visible hand/log reconstruction can
    // continue instead of depending on inaccessible hidden-order details.
    state.player.drawPile.unshift(nextCard);
    nextCard = matchingCard;
  }

  state.player.hand.push(nextCard);
  state.drawCountThisTurn += 1;
  return nextCard;
}

function findCardInstance(
  cards: CardInstance[],
  cardInstanceId: string,
): CardInstance | undefined {
  return cards.find((card) => card.instanceId === cardInstanceId);
}

function removeFirstCardByDefinition(
  cards: CardInstance[],
  definitionId: CardDefinitionId,
): CardInstance | null {
  const cardIndex = cards.findIndex((card) => card.definitionId === definitionId);

  if (cardIndex === -1) {
    return null;
  }

  const [card] = cards.splice(cardIndex, 1);
  return card ?? null;
}

function removeCardFromHand(
  state: TraceViewerReplayState,
  cardInstanceId: string,
  fallbackCardId: CardDefinitionId,
): CardInstance {
  const handIndex = state.player.hand.findIndex((card) => card.instanceId === cardInstanceId);

  if (handIndex !== -1) {
    const [card] = state.player.hand.splice(handIndex, 1);
    return card!;
  }

  const fallbackIndex = state.player.hand.findIndex((card) => card.definitionId === fallbackCardId);

  if (fallbackIndex === -1) {
    const [firstCard] = state.player.hand.splice(0, 1);

    if (firstCard) {
      return firstCard;
    }

    return {
      instanceId: cardInstanceId,
      definitionId: fallbackCardId,
    };
  }

  const [card] = state.player.hand.splice(fallbackIndex, 1);
  return card!;
}

function createPermanentFromCard(
  cardDefinitions: CardDefinitionLibrary,
  card: CardInstance,
  slotIndex: number,
): TraceViewerPermanentSnapshot {
  const definition = getCardDefinitionFromLibrary(cardDefinitions, card.definitionId);

  if (!isPermanentCardDefinition(definition)) {
    throw new Error(`Card ${card.definitionId} is not a permanent card.`);
  }

  const cardNumber = card.instanceId.replace(/^card_/, "");

  return {
    instanceId: `${card.definitionId}_${cardNumber}`,
    sourceCardInstanceId: card.instanceId,
    definitionId: definition.id,
    name: definition.name,
    isCreature: hasCardType(definition, "creature"),
    power: definition.power,
    health: definition.health,
    maxHealth: definition.health,
    block: 0,
    hasActedThisTurn: false,
    isTapped: false,
    isDefending: false,
    slotIndex,
    actions: getActivatedAbilities(definition.abilities).map((ability) => ({ ...ability })),
  };
}

function getActionDefinitionId(
  trace: SimulationTrace,
  actionRecord: SimulationActionRecord | undefined,
): CardDefinitionId | null {
  if (!actionRecord || actionRecord.action.type !== "play_card") {
    return null;
  }

  const index = Number(actionRecord.action.cardInstanceId.replace(/^card_/, "")) - 1;
  return trace.config.playerDeck[index] ?? null;
}

function matchesActionStart(
  trace: SimulationTrace,
  event: BattleEvent,
  actionRecord: SimulationActionRecord,
): boolean {
  if (actionRecord.action.type === "play_card") {
    return (
      event.type === "card_played" &&
      event.cardId === getActionDefinitionId(trace, actionRecord)
    );
  }

  if (actionRecord.action.type === "use_permanent_action") {
    return (
      event.type === "permanent_acted" &&
      event.permanentId === actionRecord.action.permanentId &&
      event.source === actionRecord.action.source &&
      event.action === actionRecord.action.action
    );
  }

  return event.type === "turn_ended";
}

function snapshotReplayState(
  state: TraceViewerReplayState,
  actionRecord: SimulationActionRecord | null,
  stepIndex: number,
  visibleLog: BattleEvent[],
  currentEvents: BattleEvent[],
): TraceViewerStepViewModel {
  return {
    stepIndex,
    turnNumber: state.turnNumber,
    actionRecord,
    player: {
      health: state.player.health,
      maxHealth: state.player.maxHealth,
      block: state.player.block,
      energy: state.player.energy,
      hand: state.player.hand.map((card) => toCardSnapshot(state.cardDefinitions, card)),
      drawPile: state.player.drawPile.map((card) => toCardSnapshot(state.cardDefinitions, card)),
      drawPileCount: state.player.drawPile.length,
      discardPile: state.player.discardPile.map((card) => toCardSnapshot(state.cardDefinitions, card)),
      graveyard: state.player.graveyard.map((card) => toCardSnapshot(state.cardDefinitions, card)),
    },
    enemy: {
      name: state.enemy.name,
      health: state.enemy.health,
      maxHealth: state.enemy.maxHealth,
      block: state.enemy.block,
      intent: { ...state.enemy.intent },
      intentLabel: state.enemyStunnedThisTurn ? "Stunned" : formatEnemyIntent(state.enemy.intent),
    },
    battlefield: cloneBattlefield(state.battlefield),
    blockingQueue: [...state.blockingQueue],
    visibleLog: [...visibleLog],
    currentEvents: [...currentEvents],
  };
}

function applyEvent(
  state: TraceViewerReplayState,
  trace: SimulationTrace,
  event: BattleEvent,
  actionRecord: SimulationActionRecord | undefined,
): void {
  switch (event.type) {
    case "battle_created":
      state.turnNumber = event.turnNumber;
      return;
    case "turn_started":
      if (event.turnNumber > 1) {
        state.player.block = 0;
        state.blockingQueue = [];
        moveHandToDiscard(state);

        state.battlefield.forEach((permanent) => {
          if (!permanent) {
            return;
          }

          permanent.block = 0;
          permanent.hasActedThisTurn = false;
          permanent.isTapped = false;
          permanent.isDefending = false;
        });
      }

      state.turnNumber = event.turnNumber;
      state.player.energy = event.energy;
      state.enemy.intent = event.enemyIntent;
      state.enemy.intentLabel = formatEnemyIntent(event.enemyIntent);
      state.enemyStunnedThisTurn = false;
      state.drawCountThisTurn = 0;
      return;
    case "card_drawn":
      drawMatchingCard(state, trace, event.cardId);
      return;
    case "card_played": {
      const playedInstanceId =
        actionRecord?.action.type === "play_card" ? actionRecord.action.cardInstanceId : null;
      const card = removeCardFromHand(
        state,
        playedInstanceId ?? "unknown_card",
        event.cardId,
      );
      const definition = getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId);
      state.player.energy = Math.max(0, state.player.energy - definition.cost);

      if (!isPermanentCardDefinition(definition)) {
        state.player.discardPile.push(card);
      }
      return;
    }
    case "spell_cast":
      return;
    case "enemy_card_played":
      return;
    case "block_gained":
      if (event.target === "player") {
        state.player.block += event.amount;
      } else if (event.target === "enemy") {
        state.enemy.block += event.amount;
      } else if (event.target === "permanent" && event.targetId) {
        const permanent = state.battlefield.find((entry) => entry?.instanceId === event.targetId);
        if (permanent) {
          permanent.block += event.amount;
        }
      }
      return;
    case "energy_gained":
      if (event.target === "player") {
        state.player.energy += event.amount;
      }
      return;
    case "damage_dealt":
      if (event.target === "player") {
        applyDamageToBlockAndHealth(state.player, event.amount);
      } else if (event.target === "enemy") {
        applyDamageToBlockAndHealth(state.enemy, event.amount);
      } else if (event.target === "permanent" && event.targetId) {
        const permanent = state.battlefield.find((entry) => entry?.instanceId === event.targetId);
        if (permanent) {
          applyDamageToBlockAndHealth(permanent, event.amount);
        }
      }
      return;
    case "permanent_summoned": {
      const playedDefinitionId = getActionDefinitionId(trace, actionRecord);
      const sourceCardInstanceId =
        actionRecord?.action.type === "play_card" && playedDefinitionId === event.definitionId
          ? actionRecord.action.cardInstanceId
          : undefined;
      const sourceCard =
        sourceCardInstanceId
          ? findCardInstance(state.player.discardPile, sourceCardInstanceId) ??
            findCardInstance(state.player.hand, sourceCardInstanceId) ??
            {
              instanceId: sourceCardInstanceId,
              definitionId: event.definitionId,
            }
          : removeFirstCardByDefinition(state.player.hand, event.definitionId) ??
            removeFirstCardByDefinition(state.player.discardPile, event.definitionId) ??
            {
              instanceId: `card_${event.slotIndex + 1}`,
              definitionId: event.definitionId,
            };
      const permanent = createPermanentFromCard(state.cardDefinitions, sourceCard, event.slotIndex);
      permanent.instanceId = event.permanentId;
      state.battlefield[event.slotIndex] = permanent;
      return;
    }
    case "permanent_acted": {
      const permanent = state.battlefield.find((entry) => entry?.instanceId === event.permanentId);
      if (!permanent) {
        return;
      }

      if (event.action === "attack") {
        permanent.hasActedThisTurn = true;
        permanent.isDefending = false;
        state.blockingQueue = state.blockingQueue.filter((id) => id !== permanent.instanceId);
      } else if (event.source === "rules" && event.action === "defend") {
        permanent.hasActedThisTurn = true;
        permanent.isDefending = true;
        if (!state.blockingQueue.includes(permanent.instanceId)) {
          state.blockingQueue.push(permanent.instanceId);
        }
      } else if (event.source === "ability") {
        const sourceDefinition = getCardDefinitionFromLibrary(
          state.cardDefinitions,
          permanent.definitionId,
        );
        const sourceAbility =
          getActivatedAbilities(sourceDefinition.abilities).find(
            (ability) => ability.id === event.abilityId,
          ) ?? null;

        if (sourceAbility?.costs?.some((cost) => cost.type === "tap")) {
          permanent.isTapped = true;
        }
        permanent.hasActedThisTurn = true;
      }
      return;
    }
    case "enemy_intent_resolved":
      state.enemy.block = 0;
      return;
    case "enemy_stunned":
      state.enemy.intentLabel = "Stunned";
      state.enemyStunnedThisTurn = true;
      return;
    case "permanent_destroyed": {
      const battlefieldIndex = state.battlefield.findIndex(
        (entry) => entry?.instanceId === event.permanentId,
      );

      if (battlefieldIndex === -1) {
        return;
      }

      const permanent = state.battlefield[battlefieldIndex];

      if (permanent) {
        state.player.graveyard.push({
          instanceId: permanent.sourceCardInstanceId,
          definitionId: permanent.definitionId,
        });
      }

      state.battlefield[battlefieldIndex] = null;
      state.blockingQueue = state.blockingQueue.filter((id) => id !== event.permanentId);
      return;
    }
    case "turn_ended":
      return;
    case "battle_finished":
      return;
  }
}

export function buildTraceStepViewModels(
  trace: SimulationTrace,
): TraceViewerStepViewModel[] {
  const replayState = createInitialReplayState(trace);
  const viewModels: TraceViewerStepViewModel[] = [];
  let eventIndex = 0;

  const firstActionRecord = trace.actionHistory[0] ?? null;

  while (
    eventIndex < trace.log.length &&
    (!firstActionRecord || !matchesActionStart(trace, trace.log[eventIndex]!, firstActionRecord))
  ) {
    applyEvent(replayState, trace, trace.log[eventIndex]!, undefined);
    eventIndex += 1;
  }

  viewModels.push(
    snapshotReplayState(
      replayState,
      null,
      0,
      trace.log.slice(0, eventIndex),
      trace.log.slice(0, eventIndex),
    ),
  );

  for (let actionIndex = 0; actionIndex < trace.actionHistory.length; actionIndex += 1) {
    const stepIndex = actionIndex + 1;
    const actionRecord = trace.actionHistory[actionIndex]!;
    const nextActionRecord = trace.actionHistory[actionIndex + 1];

    while (
      eventIndex < trace.log.length &&
      !matchesActionStart(trace, trace.log[eventIndex]!, actionRecord)
    ) {
      applyEvent(replayState, trace, trace.log[eventIndex]!, undefined);
      eventIndex += 1;
    }

    const currentEventStart = eventIndex;

    while (eventIndex < trace.log.length) {
      const event = trace.log[eventIndex]!;

      if (
        eventIndex > currentEventStart &&
        nextActionRecord &&
        matchesActionStart(trace, event, nextActionRecord)
      ) {
        break;
      }

      applyEvent(replayState, trace, event, actionRecord);
      eventIndex += 1;
    }

    viewModels.push(
      snapshotReplayState(
        replayState,
        actionRecord,
        stepIndex,
        trace.log.slice(0, eventIndex),
        trace.log.slice(currentEventStart, eventIndex),
      ),
    );
  }

  return viewModels;
}

export function getTraceViewerStepCount(trace: SimulationTrace): number {
  return trace.actionHistory.length + 1;
}

export function clampTraceViewerStepIndex(
  trace: SimulationTrace,
  stepIndex: number,
): number {
  const maxStepIndex = Math.max(0, getTraceViewerStepCount(trace) - 1);
  return Math.max(0, Math.min(stepIndex, maxStepIndex));
}

export function getTraceViewerStepIndexAfterCommand(
  trace: SimulationTrace,
  currentStepIndex: number,
  command: TraceViewerStepCommand,
): number {
  const maxStepIndex = Math.max(0, getTraceViewerStepCount(trace) - 1);

  switch (command) {
    case "first":
      return 0;
    case "previous":
      return Math.max(0, currentStepIndex - 1);
    case "next":
      return Math.min(maxStepIndex, currentStepIndex + 1);
    case "last":
      return maxStepIndex;
  }
}

export function getTraceViewerCurrentActionRecord(
  trace: SimulationTrace,
  stepIndex: number,
): SimulationActionRecord | null {
  const clampedIndex = clampTraceViewerStepIndex(trace, stepIndex);

  if (clampedIndex === 0) {
    return null;
  }

  return trace.actionHistory[clampedIndex - 1] ?? null;
}

export function formatTraceActionRecord(
  record: SimulationActionRecord | null,
): string {
  if (!record) {
    return "Opening state";
  }

  if (record.action.type === "play_card") {
    return `Play ${record.action.cardInstanceId}`;
  }

  if (record.action.type === "use_permanent_action") {
    return `${record.action.permanentId} ${record.action.action}`;
  }

  return "End turn";
}

export function formatTraceEvent(event: BattleEvent): string {
  switch (event.type) {
    case "battle_created":
      return `Turn ${event.turnNumber}: battle created`;
    case "turn_started":
      return `Turn ${event.turnNumber}: start turn, drew ${event.cardsDrawn}, energy ${event.energy}, enemy intent ${formatEnemyIntent(event.enemyIntent)}`;
    case "card_drawn":
      return `Turn ${event.turnNumber}: player drew ${event.cardId}`;
    case "card_played":
      return `Turn ${event.turnNumber}: played ${event.cardId}`;
    case "spell_cast":
      return `Turn ${event.turnNumber}: cast ${event.cardId}`;
    case "enemy_card_played":
      return `Turn ${event.turnNumber}: enemy played ${event.cardId}`;
    case "block_gained":
      return `Turn ${event.turnNumber}: ${event.target}${event.targetId ? ` ${event.targetId}` : ""} gained ${event.amount} block`;
    case "energy_gained":
      return `Turn ${event.turnNumber}: ${event.source}${event.sourceId ? ` ${event.sourceId}` : ""} gained ${event.amount} energy`;
    case "damage_dealt":
      return `Turn ${event.turnNumber}: ${event.source}${event.sourceId ? ` ${event.sourceId}` : ""} dealt ${event.amount} damage to ${event.target}${event.targetId ? ` ${event.targetId}` : ""}`;
    case "permanent_summoned":
      return `Turn ${event.turnNumber}: summoned ${event.definitionId} as ${event.permanentId} into slot ${event.slotIndex + 1}`;
    case "permanent_acted":
      return `Turn ${event.turnNumber}: permanent ${event.permanentId} used ${event.action}`;
    case "enemy_intent_resolved":
      return `Turn ${event.turnNumber}: enemy resolved ${formatEnemyIntent(event.intent)}`;
    case "enemy_power_gained":
      return `Turn ${event.turnNumber}: enemy gained ${event.amount} power (now ${event.newBasePower})`;
    case "enemy_stunned":
      return `Turn ${event.turnNumber}: enemy action was stunned and cancelled`;
    case "permanent_destroyed":
      return `Turn ${event.turnNumber}: permanent ${event.permanentId} (${event.definitionId}) was destroyed`;
    case "counter_added":
      return `Turn ${event.turnNumber}: permanent ${event.permanentId} gained ${event.amount} ${event.counter} counter`;
    case "counter_removed":
      return `Turn ${event.turnNumber}: permanent ${event.permanentId} lost ${event.amount} ${event.counter} counter`;
    case "turn_ended":
      return `Turn ${event.turnNumber}: end turn`;
    case "battle_finished":
      return `Turn ${event.turnNumber}: battle finished, winner ${event.winner}, player hp ${event.playerHealth}, enemy hp ${event.enemyHealth}, permanents ${event.permanents.length > 0 ? event.permanents.map((permanent) => `${permanent.permanentId} ${permanent.health}/${permanent.maxHealth}`).join(", ") : "none"}`;
  }

  throw new Error(`Unhandled trace event ${(event as BattleEvent).type}`);
}

export function groupTraceEventsByTurn(
  visibleLog: BattleEvent[],
  currentEvents: BattleEvent[],
): TraceViewerEventGroup[] {
  const groups: TraceViewerEventGroup[] = [];

  for (const event of visibleLog) {
    const existingGroup = groups[groups.length - 1];

    if (!existingGroup || existingGroup.turnNumber !== event.turnNumber) {
      groups.push({
        turnNumber: event.turnNumber,
        events: [
          {
            event,
            isCurrentEvent: currentEvents.includes(event),
          },
        ],
      });
      continue;
    }

    existingGroup.events.push({
      event,
      isCurrentEvent: currentEvents.includes(event),
    });
  }

  return groups;
}
