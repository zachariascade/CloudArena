import { randomUUID } from "node:crypto";

import type {
  CloudArenaActionOption,
  CloudArenaCreateSessionRequest,
  CloudArenaSessionScenarioId,
  CloudArenaSessionSnapshot,
} from "../../../../src/cloud-arcanum/api-contract.js";
import {
  applyBattleAction,
  createBattle,
  formatEnemyIntent,
  getCardDefinitionFromLibrary,
  getLegalActions,
  getScenarioPreset,
  type BattleAction,
  type BattleState,
  type CloudArenaScenarioPreset,
} from "../../../../src/cloud-arena/index.js";

type CloudArenaSessionRecord = {
  id: string;
  scenarioId: CloudArenaSessionScenarioId;
  seed: number;
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

function toActionKey(action: BattleAction): string {
  return JSON.stringify(action);
}

function resolveScenario(
  request: CloudArenaCreateSessionRequest = {},
): CloudArenaScenarioPreset {
  return getScenarioPreset(request.scenarioId ?? "mixed_guardian");
}

function createScenarioBattle(
  scenario: CloudArenaScenarioPreset,
  seed: number,
): BattleState {
  return createBattle({
    seed,
    playerHealth: scenario.playerHealth,
    playerDeck: scenario.deck,
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
      definition.type === "permanent"
        ? definition.actions
            .map((action) =>
              typeof action.attackAmount === "number" && action.attackAmount > 0
                ? `Attack ${action.attackAmount}`
                : typeof action.blockAmount === "number" && action.blockAmount > 0
                  ? `Defend ${action.blockAmount}`
                  : "Utility",
            )
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
    case "use_permanent_action": {
      const permanent = state.battlefield.find(
        (entry) => entry?.instanceId === action.permanentId,
      );
      const name = permanent?.name ?? action.permanentId;
      const verb = action.action === "attack" ? "Attack with" : "Defend with";

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

function buildSessionSnapshot(
  record: CloudArenaSessionRecord,
): CloudArenaSessionSnapshot {
  const { state } = record;
  const legalActions =
    state.phase === "finished"
      ? []
      : getLegalActions(state).map((action) => createActionOption(state, action));

  return {
    sessionId: record.id,
    scenarioId: record.scenarioId,
    status: state.phase === "finished" ? "finished" : "active",
    turnNumber: state.turnNumber,
    phase: state.phase,
    seed: record.seed,
    player: {
      health: state.player.health,
      maxHealth: state.player.maxHealth,
      block: state.player.block,
      energy: state.player.energy,
      hand: state.player.hand.map((card) => toCardSnapshot(state, card)),
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
            health: permanent.health,
            maxHealth: permanent.maxHealth,
            block: permanent.block,
            counters: { ...(permanent.counters ?? {}) },
            attachments: [...(permanent.attachments ?? [])],
            attachedTo: permanent.attachedTo ?? null,
            hasActedThisTurn: permanent.hasActedThisTurn,
            isDefending: permanent.isDefending,
            slotIndex: permanent.slotIndex,
            actions: permanent.actions.map((action) => ({ ...action })),
          }
        : null,
    ),
    blockingQueue: [...state.blockingQueue],
    legalActions,
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

  function requireSession(sessionId: string): CloudArenaSessionRecord {
    const session = sessions.get(sessionId);

    if (!session) {
      throw new CloudArenaSessionNotFoundError(sessionId);
    }

    return session;
  }

  return {
    createSession(request = {}) {
      const scenario = resolveScenario(request);
      const seed = request.seed ?? 1;
      const id = randomUUID();
      const record: CloudArenaSessionRecord = {
        id,
        scenarioId: scenario.id,
        seed,
        state: createScenarioBattle(scenario, seed),
      };

      sessions.set(id, record);
      return buildSessionSnapshot(record);
    },

    getSession(sessionId) {
      return buildSessionSnapshot(requireSession(sessionId));
    },

    applyAction(sessionId, action) {
      const record = requireSession(sessionId);
      const legalActions = getLegalActions(record.state);
      const legalActionKeys = new Set(legalActions.map(toActionKey));

      if (!legalActionKeys.has(toActionKey(action))) {
        throw new CloudArenaInvalidActionError(action);
      }

      applyBattleAction(record.state, action);
      return buildSessionSnapshot(record);
    },

    resetSession(sessionId) {
      const record = requireSession(sessionId);
      const scenario = getScenarioPreset(record.scenarioId);

      record.state = createScenarioBattle(scenario, record.seed);
      return buildSessionSnapshot(record);
    },
  };
}
