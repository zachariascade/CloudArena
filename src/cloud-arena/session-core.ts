import type {
  CloudArenaActionOption,
  CloudArenaCreateSessionRequest,
  CloudArenaSessionActionRecord,
  CloudArenaSessionScenarioId,
  CloudArenaSessionSnapshot,
} from "./api-contract.js";
import { summarizeCardDefinition } from "./card-summary.js";
import {
  applyBattleAction,
} from "./core/engine.js";
import {
  createBattle,
} from "./core/create-battle.js";
import {
  formatEnemyIntent,
} from "./core/enemy-intent.js";
import {
  getActivatedAbilities,
} from "./core/activated-abilities.js";
import {
  getDerivedPermanentStat,
} from "./core/derived-stats.js";
import {
  summarizePermanentCounters,
} from "./core/counters.js";
import {
  getPrimaryEnemyPermanent,
  permanentAttacksAllEnemyPermanents,
} from "./core/permanents.js";
import {
  getLegalActions,
} from "./actions/legal-actions.js";
import {
  getScenarioPreset,
  type CloudArenaScenarioPreset,
} from "./scenarios/index.js";
import {
  getCardDefinitionFromLibrary,
  hasCardType,
} from "./cards/definitions.js";
import type {
  BattleAction,
  BattleState,
  CreateBattleEnemyInput,
} from "./core/types.js";

export type CloudArenaSessionRecord = {
  id: string;
  scenarioId: CloudArenaSessionScenarioId;
  deckId: string | null;
  seed: number;
  shuffleDeck: boolean;
  createdAt: string;
  resetSource: {
    scenarioId: CloudArenaSessionScenarioId;
    deckId: string | null;
    seed: number;
  };
  actionHistory: CloudArenaSessionActionRecord[];
  state: BattleState;
  playerDeck: string[];
};

export type CloudArenaResolvedPlayerDeck = {
  deckId: string | null;
  cards: string[];
};

export class CloudArenaInvalidActionError extends Error {
  constructor(action: BattleAction) {
    super(`Illegal Cloud Arena action: ${JSON.stringify(action)}`);
    this.name = "CloudArenaInvalidActionError";
  }
}

export class CloudArenaFinishedBattleError extends Error {
  constructor(sessionId: string) {
    super(`Cloud Arena session "${sessionId}" is already finished and cannot accept new actions.`);
    this.name = "CloudArenaFinishedBattleError";
  }
}

function toActionKey(action: BattleAction): string {
  return JSON.stringify(action);
}

export function normalizeBattleAction(action: BattleAction): BattleAction {
  if (action.type !== "use_permanent_action") {
    return action;
  }

  if (action.source) {
    return action;
  }

  if (action.action === "attack" || action.action === "defend") {
    return {
      type: "use_permanent_action",
      permanentId: action.permanentId,
      source: "rules",
      action: action.action,
    };
  }

  return {
    type: "use_permanent_action",
    permanentId: action.permanentId,
    source: "ability",
    action: action.action,
    abilityId: action.abilityId,
  };
}

export function resolveCloudArenaSessionScenario(
  request: CloudArenaCreateSessionRequest = {},
): CloudArenaScenarioPreset {
  return getScenarioPreset(request.scenarioId ?? "demon_pack");
}

export function createScenarioBattle(
  scenario: CloudArenaScenarioPreset,
  playerDeck: string[],
  seed: number,
  shuffleDeck: boolean,
): BattleState {
  const [primaryEnemy] = scenario.enemies;

  if (!primaryEnemy || !primaryEnemy.cards) {
    throw new Error(`Scenario "${scenario.id}" must define at least one enemy preset with cards.`);
  }

  const battleEnemies: CreateBattleEnemyInput[] = scenario.enemies.map((enemy) => {
    const baseEnemy = {
      definitionId: enemy.definitionId,
      name: enemy.name,
      health: enemy.health,
      basePower: enemy.basePower,
      leaderDefinitionId: enemy.definitionId,
      startingTokens: enemy.startingTokens,
    };

    if (enemy.cards) {
      return {
        ...baseEnemy,
        cards: enemy.cards,
      };
    }

    if (enemy.behavior) {
      return {
        ...baseEnemy,
        behavior: enemy.behavior,
      };
    }

    throw new Error(`Scenario "${scenario.id}" enemy "${enemy.name}" must define cards or behavior.`);
  });

  return createBattle({
    seed,
    playerHealth: scenario.playerHealth,
    playerDeck,
    shuffleDeck,
    enemies: battleEnemies,
  });
}

export function createCloudArenaSessionRecord(input: {
  createdAt: string;
  id: string;
  playerDeck: CloudArenaResolvedPlayerDeck;
  request?: CloudArenaCreateSessionRequest;
  scenario: CloudArenaScenarioPreset;
}): CloudArenaSessionRecord {
  const request = input.request ?? {};
  const seed = request.seed ?? 1;
  const shuffleDeck = request.shuffleDeck ?? false;

  return {
    id: input.id,
    scenarioId: input.scenario.id,
    deckId: input.playerDeck.deckId,
    seed,
    shuffleDeck,
    createdAt: input.createdAt,
    resetSource: {
      scenarioId: input.scenario.id,
      deckId: input.playerDeck.deckId,
      seed,
    },
    actionHistory: [],
    state: createScenarioBattle(input.scenario, input.playerDeck.cards, seed, shuffleDeck),
    playerDeck: [...input.playerDeck.cards],
  };
}

function toCardSnapshot(
  state: BattleState,
  card: BattleState["player"]["hand"][number],
) {
  const definition = getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId);

  return {
    instanceId: card.instanceId,
    definitionId: card.definitionId,
    name: definition.name,
    cost: definition.cost,
    effectSummary: summarizeCardDefinition(definition).join(" • "),
  };
}

function createActionOption(
  state: BattleState,
  action: BattleAction,
): CloudArenaActionOption {
  switch (action.type) {
    case "play_card": {
      const card = state.player.hand.find(
        (entry) => entry.instanceId === action.cardInstanceId,
      );
      const name = card
        ? getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId).name
        : action.cardInstanceId;

      return {
        action,
        label: `Play ${name}`,
        source: "hand",
      };
    }
    case "choose_target": {
      const permanent = state.battlefield.find(
        (entry) => entry?.instanceId === action.targetPermanentId,
      ) ?? state.enemyBattlefield.find((entry) => entry?.instanceId === action.targetPermanentId);
      const name = permanent?.name ?? action.targetPermanentId;

      return {
        action,
        label: `Target ${name}`,
        source: "battlefield",
      };
    }
    case "choose_card": {
      const card = state.player.graveyard.find(
        (entry) => entry.instanceId === action.targetCardInstanceId,
      );
      const name = card
        ? getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId).name
        : action.targetCardInstanceId;

      return {
        action,
        label: `Return ${name} to hand`,
        source: "hand",
      };
    }
    case "use_permanent_action": {
      const permanent = state.battlefield.find(
        (entry) => entry?.instanceId === action.permanentId,
      );
      const name = permanent?.name ?? action.permanentId;
      const attacksAllEnemyPermanents =
        action.action === "attack" && permanent
          ? permanentAttacksAllEnemyPermanents(state, permanent)
          : false;
      const verb =
        action.source === "rules"
          ? action.action === "attack"
            ? attacksAllEnemyPermanents
              ? "Attack all with"
              : "Attack with"
            : "Defend with"
          : action.action === "attack"
            ? attacksAllEnemyPermanents
              ? "Attack all with"
              : "Attack with"
            : action.action === "apply_block"
              ? "Apply block with"
              : "Use ability on";

      return {
        action,
        label: `${verb} ${name}`,
        source: "battlefield",
      };
    }
    case "end_turn":
      return {
        action,
        label: "End turn",
        source: "turn",
      };
  }
}

function getLegalActionOptions(state: BattleState): CloudArenaActionOption[] {
  if (state.phase === "finished") {
    return [];
  }

  return getLegalActions(state).map((action) => createActionOption(state, action));
}

export function validateCloudArenaBattleAction(state: BattleState, action: BattleAction): void {
  const legalActionKeys = new Set(getLegalActions(state).map(toActionKey));
  const normalizedAction = normalizeBattleAction(action);

  if (!legalActionKeys.has(toActionKey(normalizedAction))) {
    throw new CloudArenaInvalidActionError(normalizedAction);
  }
}

export function buildCloudArenaSessionSnapshot(
  record: CloudArenaSessionRecord,
): CloudArenaSessionSnapshot {
  const { state } = record;
  const legalActions = getLegalActionOptions(state);
  const primaryEnemyPermanent = getPrimaryEnemyPermanent(state);
  const pendingHandCard =
    state.pendingTargetRequest?.context.pendingCardPlay ??
    state.pendingTargetRequest?.context.pendingCardPreview ??
    null;

  return {
    sessionId: record.id,
    scenarioId: record.scenarioId,
    deckId: record.deckId,
    status: state.phase === "finished" ? "finished" : "active",
    turnNumber: state.turnNumber,
    phase: state.phase,
    seed: record.seed,
    createdAt: record.createdAt,
    resetSource: {
      ...record.resetSource,
    },
    player: {
      health: state.player.health,
      maxHealth: state.player.maxHealth,
      block: state.player.block,
      energy: state.player.energy,
      hand: state.player.hand.map((card) => toCardSnapshot(state, card)),
      drawPile: state.player.drawPile.map((card) => toCardSnapshot(state, card)),
      drawPileCount: state.player.drawPile.length,
      discardPile: state.player.discardPile.map((card) => toCardSnapshot(state, card)),
      graveyard: state.player.graveyard.map((card) => toCardSnapshot(state, card)),
    },
    enemy: {
      name: primaryEnemyPermanent?.name ?? state.enemy.name,
      health: primaryEnemyPermanent?.health ?? state.enemy.health,
      maxHealth: primaryEnemyPermanent?.maxHealth ?? state.enemy.maxHealth,
      block: primaryEnemyPermanent?.block ?? state.enemy.block,
      leaderDefinitionId: state.enemy.leaderDefinitionId,
      currentCardId: state.enemy.currentCardId ?? state.enemy.currentCard?.id ?? null,
      intent: { ...state.enemy.intent },
      intentLabel: primaryEnemyPermanent?.intentLabel ?? (state.enemy.stunnedThisTurn ? "Stunned" : formatEnemyIntent(state.enemy.intent)),
      intentQueueLabels: primaryEnemyPermanent?.intentQueueLabels ?? [...state.enemy.intentQueueLabels],
    },
    creatureBattlefieldSlotCount: state.playerCreatureSlotCount,
    nonCreatureBattlefieldSlotCount: state.playerNonCreatureSlotCount,
    battlefield: state.battlefield.map((permanent) =>
      permanent
        ? {
            instanceId: permanent.instanceId,
            sourceCardInstanceId: permanent.sourceCardInstanceId,
            definitionId: permanent.definitionId,
            name: permanent.name,
            controllerId: permanent.controllerId,
            isCreature: hasCardType(
              getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId),
              "creature",
            ),
            power: getDerivedPermanentStat(state, permanent, "power"),
            health: permanent.health,
            maxHealth: permanent.maxHealth,
            block: permanent.block,
            counters: summarizePermanentCounters(permanent.counters),
            attachments: [...(permanent.attachments ?? [])],
            attachedTo: permanent.attachedTo ?? null,
            hasActedThisTurn: permanent.hasActedThisTurn,
            isTapped: permanent.isTapped,
            isDefending: permanent.isDefending,
            blockingTargetPermanentId: permanent.blockingTargetPermanentId,
            slotIndex: permanent.slotIndex,
            intentLabel: permanent.intentLabel ?? null,
            intentQueueLabels: permanent.intentQueueLabels ?? null,
            actions: getActivatedAbilities(permanent.abilities).map((ability) => ({ ...ability })),
          }
        : null,
    ),
    enemyBattlefield: state.enemyBattlefield.map((permanent) =>
      permanent
        ? {
            instanceId: permanent.instanceId,
            sourceCardInstanceId: permanent.sourceCardInstanceId,
            definitionId: permanent.definitionId,
            name: permanent.name,
            controllerId: permanent.controllerId,
            isCreature: hasCardType(
              getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId),
              "creature",
            ),
            power: getDerivedPermanentStat(state, permanent, "power"),
            health: permanent.health,
            maxHealth: permanent.maxHealth,
            block: permanent.block,
            counters: summarizePermanentCounters(permanent.counters),
            attachments: [...(permanent.attachments ?? [])],
            attachedTo: permanent.attachedTo ?? null,
            hasActedThisTurn: permanent.hasActedThisTurn,
            isTapped: permanent.isTapped,
            isDefending: permanent.isDefending,
            blockingTargetPermanentId: permanent.blockingTargetPermanentId,
            slotIndex: permanent.slotIndex,
            intentLabel: permanent.intentLabel ?? null,
            intentQueueLabels: permanent.intentQueueLabels ?? null,
            actions: getActivatedAbilities(permanent.abilities).map((ability) => ({ ...ability })),
          }
        : null,
    ),
    pendingTargetRequest: state.pendingTargetRequest
      ? {
          id: state.pendingTargetRequest.id,
          prompt: state.pendingTargetRequest.prompt,
          optional: state.pendingTargetRequest.optional,
          targetKind: state.pendingTargetRequest.targetKind,
          selector: { ...state.pendingTargetRequest.selector },
          context: {
            abilitySourcePermanentId: state.pendingTargetRequest.context.abilitySourcePermanentId,
            sourceCardInstanceId: state.pendingTargetRequest.context.sourceCardInstanceId,
            defendingPermanentId: state.pendingTargetRequest.context.defendingPermanentId,
            pendingCardPlay: pendingHandCard
              ? toCardSnapshot(state, {
                  instanceId: pendingHandCard.cardInstanceId,
                  definitionId: pendingHandCard.definitionId,
                })
              : undefined,
            pendingCardPlayHandIndex: pendingHandCard?.handIndex,
          },
        }
      : null,
    blockingQueue: [...state.blockingQueue],
    legalActions,
    actionHistory: record.actionHistory.map((entry) => ({
      action: { ...entry.action },
      turnNumber: entry.turnNumber,
      phase: entry.phase,
    })),
    log: [...state.log],
  };
}

export function resetCloudArenaSessionRecord(record: CloudArenaSessionRecord): void {
  const scenario = getScenarioPreset(record.scenarioId);

  record.actionHistory = [];
  record.state = createScenarioBattle(scenario, record.playerDeck, record.seed, record.shuffleDeck);
}

export function applyCloudArenaSessionAction(
  record: CloudArenaSessionRecord,
  action: BattleAction,
): void {
  if (record.state.phase === "finished") {
    throw new CloudArenaFinishedBattleError(record.id);
  }

  const normalizedAction = normalizeBattleAction(action);
  validateCloudArenaBattleAction(record.state, normalizedAction);

  record.actionHistory.push({
    action: { ...normalizedAction },
    turnNumber: record.state.turnNumber,
    phase: record.state.phase,
  });
  applyBattleAction(record.state, normalizedAction);
}
