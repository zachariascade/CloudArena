import { randomUUID } from "node:crypto";

import type {
  CloudArenaCreateSessionRequest,
  CloudArenaSessionSnapshot,
} from "../../../../src/cloud-arena/api-contract.js";
import {
  applyCloudArenaSessionAction,
  buildCloudArenaSessionSnapshot,
  createCloudArenaSessionRecord,
  resolveCloudArenaSessionScenario,
  resetCloudArenaSessionRecord,
  CloudArenaFinishedBattleError,
  CloudArenaInvalidActionError,
  type BattleAction,
  type CloudArenaResolvedPlayerDeck,
  type CloudArenaSessionRecord,
  type CloudArenaScenarioPreset,
} from "../../../../src/cloud-arena/index.js";
import {
  expandCloudArenaDeckSource,
  resolveCloudArenaDeckSourceByIdSync,
} from "./cloud-arena-decks.js";

export class CloudArenaSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Cloud Arena session "${sessionId}" was not found.`);
    this.name = "CloudArenaSessionNotFoundError";
  }
}

export {
  CloudArenaFinishedBattleError,
  CloudArenaInvalidActionError,
};

function resolvePlayerDeck(
  request: CloudArenaCreateSessionRequest,
  scenario: CloudArenaScenarioPreset,
): CloudArenaResolvedPlayerDeck {
  if (request.deckId) {
    const deck = resolveCloudArenaDeckSourceByIdSync(request.deckId);

    if (!deck) {
      throw new Error(`Cloud Arena deck "${request.deckId}" was not found.`);
    }

    return {
      deckId: deck.deckId,
      cards: expandCloudArenaDeckSource(deck),
    };
  }

  return {
    deckId: null,
    cards: scenario.deck,
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
    const scenario = resolveCloudArenaSessionScenario(request);

    return createCloudArenaSessionRecord({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      request,
      scenario,
      playerDeck: resolvePlayerDeck(request, scenario),
    });
  }

  function requireSession(sessionId: string): CloudArenaSessionRecord {
    const session = sessions.get(sessionId);

    if (!session) {
      throw new CloudArenaSessionNotFoundError(sessionId);
    }

    return session;
  }

  return {
    createSession(request = {}) {
      const record = createSessionRecord(request);

      sessions.set(record.id, record);
      return buildCloudArenaSessionSnapshot(record);
    },

    getSession(sessionId) {
      return buildCloudArenaSessionSnapshot(requireSession(sessionId));
    },

    applyAction(sessionId, action) {
      const record = requireSession(sessionId);

      applyCloudArenaSessionAction(record, action);
      return buildCloudArenaSessionSnapshot(record);
    },

    resetSession(sessionId) {
      const record = requireSession(sessionId);

      resetCloudArenaSessionRecord(record);
      return buildCloudArenaSessionSnapshot(record);
    },
  };
}
