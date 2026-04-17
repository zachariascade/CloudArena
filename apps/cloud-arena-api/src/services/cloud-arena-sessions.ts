import { randomUUID } from "node:crypto";

import type {
  CloudArenaActionOption,
  CloudArenaCreateSessionRequest,
  CloudArenaSessionActionRecord,
  CloudArenaSessionScenarioId,
  CloudArenaSessionSnapshot,
} from "../../../../src/cloud-arena/api-contract.js";
import {
  applyBattleAction,
  buildBattleSummary,
  createBattle,
  formatActivatedAbilityLabel,
  formatEnemyIntent,
  getDerivedPermanentStat,
  getCardDefinitionFromLibrary,
  getActivatedAbilities,
  getLegalActions,
  getScenarioPreset,
  hasCardType,
  isPermanentCardDefinition,
  summarizePermanentCounters,
  type BattleAction,
  type BattleEvent,
  type BattleState,
  type CloudArenaScenarioPreset,
} from "../../../../src/cloud-arena/index.js";

type CloudArenaSessionRecord = {
  id: string;
  scenarioId: CloudArenaSessionScenarioId;
  seed: number;
  shuffleDeck: boolean;
  createdAt: string;
  resetSource: {
    scenarioId: CloudArenaSessionScenarioId;
    seed: number;
  };
  actionHistory: CloudArenaSessionActionRecord[];
  state: BattleState;
};

export class CloudArenaSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Cloud Arena session "${sessionId}" was not found.`);
    this.name = "CloudArenaSessionNotFoundError";
  }
}

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

function normalizeBattleAction(action: BattleAction): BattleAction {
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

function resolveScenario(
  request: CloudArenaCreateSessionRequest = {},
): CloudArenaScenarioPreset {
  return getScenarioPreset(request.scenarioId ?? "mixed_guardian");
}

function createScenarioBattle(
  scenario: CloudArenaScenarioPreset,
  seed: number,
  shuffleDeck: boolean,
): BattleState {
  return createBattle({
    seed,
    playerHealth: scenario.playerHealth,
    playerDeck: scenario.deck,
    shuffleDeck,
    enemy: scenario.enemy,
  });
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
    effectSummary:
      isPermanentCardDefinition(definition)
        ? [
            ...(hasCardType(definition, "creature") ? [`Attack ${definition.power}`, "Defend"] : []),
            ...getActivatedAbilities(definition.abilities)
              .map((ability) =>
                formatActivatedAbilityLabel(
                  state,
                  {
                    instanceId: `preview_${definition.id}`,
                    sourceCardInstanceId: `preview_${definition.id}`,
                    definitionId: definition.id,
                    name: definition.name,
                    power: definition.power,
                    health: definition.health,
                    maxHealth: definition.health,
                    block: 0,
                    recoveryPolicy: definition.recoveryPolicy ?? "none",
                    counters: [],
                    modifiers: [],
                    attachments: [],
                    attachedTo: null,
                    abilities: definition.abilities ? definition.abilities.map((abilityEntry) => ({ ...abilityEntry })) : [],
                    disabledAbilityIds: [],
                    disabledRulesActions: [],
                    hasActedThisTurn: false,
                    isTapped: false,
                    isDefending: false,
                    slotIndex: 0,
                  },
                  ability,
                ),
              ),
          ]
            .join(" • ")
        : definition.onPlay
            .map((effect) => {
              if (typeof effect.attackAmount === "number" && effect.attackAmount > 0) {
                const hits = effect.attackTimes && effect.attackTimes > 1
                  ? ` x${effect.attackTimes}`
                  : "";
                return `Attack ${effect.attackAmount}${hits}`;
              }

              if (typeof effect.blockAmount === "number" && effect.blockAmount > 0) {
                return `Defend ${effect.blockAmount}`;
              }

              if (effect.summonSelf) {
                return "Summon";
              }

              return "Effect";
            })
            .join(" • "),
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
    case "use_permanent_action": {
      const permanent = state.battlefield.find(
        (entry) => entry?.instanceId === action.permanentId,
      );
      const name = permanent?.name ?? action.permanentId;
      const verb =
        action.source === "rules"
          ? action.action === "attack"
            ? "Attack with"
            : "Defend with"
          : action.action === "attack"
            ? "Attack with"
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

function parseCardInstanceIndex(instanceId: string): number {
  const parsed = Number(instanceId.replace(/^card_/, ""));
  return Number.isInteger(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function reconstructPlayerDeck(state: BattleState): string[] {
  const cardMap = new Map<string, string>();
  const ownedCards = [
    ...state.player.drawPile,
    ...state.player.hand,
    ...state.player.discardPile,
    ...state.player.graveyard,
    ...state.battlefield.flatMap((permanent) =>
      permanent?.controllerId === "player"
        ? [{
            instanceId: permanent.sourceCardInstanceId,
            definitionId: permanent.definitionId,
          }]
        : [],
    ),
  ];

  for (const card of ownedCards) {
    cardMap.set(card.instanceId, card.definitionId);
  }

  return [...cardMap.entries()]
    .sort(([leftId], [rightId]) => parseCardInstanceIndex(leftId) - parseCardInstanceIndex(rightId))
    .map(([, definitionId]) => definitionId);
}

function getLegalActionOptions(state: BattleState): CloudArenaActionOption[] {
  if (state.phase === "finished") {
    return [];
  }

  return getLegalActions(state).map((action) => createActionOption(state, action));
}

function validateAction(state: BattleState, action: BattleAction): void {
  const legalActionKeys = new Set(getLegalActions(state).map(toActionKey));
  const normalizedAction = normalizeBattleAction(action);

  if (!legalActionKeys.has(toActionKey(normalizedAction))) {
    throw new CloudArenaInvalidActionError(normalizedAction);
  }
}

function buildSessionSnapshot(
  record: CloudArenaSessionRecord,
): CloudArenaSessionSnapshot {
  const { state } = record;
  const legalActions = getLegalActionOptions(state);

  return {
    sessionId: record.id,
    scenarioId: record.scenarioId,
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
      name: state.enemy.name,
      health: state.enemy.health,
      maxHealth: state.enemy.maxHealth,
      block: state.enemy.block,
      intent: { ...state.enemy.intent },
      intentLabel: formatEnemyIntent(state.enemy.intent),
    },
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
            slotIndex: permanent.slotIndex,
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
            slotIndex: permanent.slotIndex,
            actions: getActivatedAbilities(permanent.abilities).map((ability) => ({ ...ability })),
          }
        : null,
    ),
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

export type CloudArenaSessionService = {
  applyAction: (sessionId: string, action: BattleAction) => CloudArenaSessionSnapshot;
  createSession: (request?: CloudArenaCreateSessionRequest) => CloudArenaSessionSnapshot;
  getSession: (sessionId: string) => CloudArenaSessionSnapshot;
  resetSession: (sessionId: string) => CloudArenaSessionSnapshot;
};

export function createCloudArenaSessionService(): CloudArenaSessionService {
  const sessions = new Map<string, CloudArenaSessionRecord>();

  function createSessionRecord(
    request: CloudArenaCreateSessionRequest = {},
  ): CloudArenaSessionRecord {
    const scenario = resolveScenario(request);
    const seed = request.seed ?? 1;
    const shuffleDeck = request.shuffleDeck ?? false;

    return {
      id: randomUUID(),
      scenarioId: scenario.id,
      seed,
      shuffleDeck,
      createdAt: new Date().toISOString(),
      resetSource: {
        scenarioId: scenario.id,
        seed,
      },
      actionHistory: [],
      state: createScenarioBattle(scenario, seed, shuffleDeck),
    };
  }

  function requireSession(sessionId: string): CloudArenaSessionRecord {
    const session = sessions.get(sessionId);

    if (!session) {
      throw new CloudArenaSessionNotFoundError(sessionId);
    }

    return session;
  }

  function resetSessionRecord(record: CloudArenaSessionRecord): void {
    const scenario = getScenarioPreset(record.scenarioId);

    record.actionHistory = [];
    record.state = createScenarioBattle(scenario, record.seed, record.shuffleDeck);
  }

  return {
    createSession(request = {}) {
      const record = createSessionRecord(request);

      sessions.set(record.id, record);
      return buildSessionSnapshot(record);
    },

    getSession(sessionId) {
      return buildSessionSnapshot(requireSession(sessionId));
    },

    applyAction(sessionId, action) {
      const record = requireSession(sessionId);

      if (record.state.phase === "finished") {
        throw new CloudArenaFinishedBattleError(sessionId);
      }

      const normalizedAction = normalizeBattleAction(action);
      validateAction(record.state, normalizedAction);

      record.actionHistory.push({
        action: { ...normalizedAction },
        turnNumber: record.state.turnNumber,
        phase: record.state.phase,
      });
      applyBattleAction(record.state, normalizedAction);
      return buildSessionSnapshot(record);
    },

    resetSession(sessionId) {
      const record = requireSession(sessionId);
      resetSessionRecord(record);
      return buildSessionSnapshot(record);
    },
  };
}
