import type {
  CloudArenaActionRequest,
  CloudArenaApiContractName,
  CloudArenaApiContracts,
  CloudArenaCreateSessionRequest,
  CloudArenaDeckCardEntry,
} from "../../../../src/cloud-arena/api-contract.js";
import {
  buildCloudArenaSessionSnapshot,
  createCloudArenaSessionRecord,
  resolveCloudArenaSessionScenario,
  resetCloudArenaSessionRecord,
  applyCloudArenaSessionAction,
  type BattleAction,
  type CloudArenaResolvedPlayerDeck,
  type CloudArenaSessionRecord,
  type CloudArenaScenarioPreset,
} from "../../../../src/cloud-arena/index.js";

import {
  createCloudArenaLocalDeckRepository,
  type CloudArenaLocalDeckRepository,
} from "./cloud-arena-local-decks.js";

type CloudArenaApiResponse<TName extends CloudArenaApiContractName> =
  CloudArenaApiContracts[TName]["response"];

type CloudArenaLocalSessionServiceOptions = {
  deckRepository?: CloudArenaLocalDeckRepository;
  idGenerator?: () => string;
  now?: () => Date;
};

export class CloudArenaLocalSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Cloud Arena session "${sessionId}" was not found.`);
    this.name = "CloudArenaLocalSessionNotFoundError";
  }
}

function createRandomHex(bytes: number): string {
  const cryptoApi = globalThis.crypto;

  if (cryptoApi?.getRandomValues) {
    const values = new Uint8Array(bytes);
    cryptoApi.getRandomValues(values);
    return Array.from(values)
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
  }

  let result = "";

  for (let index = 0; index < bytes; index += 1) {
    result += Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  }

  return result;
}

function createLocalSessionId(): string {
  return `session_${createRandomHex(8)}`;
}

function expandDeckEntries(cards: CloudArenaDeckCardEntry[]): string[] {
  return cards.flatMap((entry) =>
    Array.from({ length: entry.quantity }, () => entry.cardId),
  );
}

export class CloudArenaLocalSessionService {
  private readonly deckRepository: CloudArenaLocalDeckRepository;
  private readonly idGenerator: () => string;
  private readonly now: () => Date;
  private readonly sessions = new Map<string, CloudArenaSessionRecord>();

  constructor(options: CloudArenaLocalSessionServiceOptions = {}) {
    this.deckRepository = options.deckRepository ?? createCloudArenaLocalDeckRepository();
    this.idGenerator = options.idGenerator ?? createLocalSessionId;
    this.now = options.now ?? (() => new Date());
  }

  async createCloudArenaSession(
    request: CloudArenaCreateSessionRequest = {},
  ): Promise<CloudArenaApiResponse<"cloudArenaSessions">> {
    const scenario = resolveCloudArenaSessionScenario(request);
    const playerDeck = await this.resolvePlayerDeck(request, scenario);
    const record = createCloudArenaSessionRecord({
      id: this.idGenerator(),
      createdAt: this.now().toISOString(),
      request,
      scenario,
      playerDeck,
    });

    this.sessions.set(record.id, record);

    return {
      data: buildCloudArenaSessionSnapshot(record),
    };
  }

  async getCloudArenaSession(
    sessionId: string,
  ): Promise<CloudArenaApiResponse<"cloudArenaSessionDetail">> {
    return {
      data: buildCloudArenaSessionSnapshot(this.requireSession(sessionId)),
    };
  }

  async applyCloudArenaAction(
    sessionId: string,
    body: CloudArenaActionRequest,
  ): Promise<CloudArenaApiResponse<"cloudArenaSessionActions">> {
    const record = this.requireSession(sessionId);

    applyCloudArenaSessionAction(record, body.action);

    return {
      data: buildCloudArenaSessionSnapshot(record),
    };
  }

  async resetCloudArenaSession(
    sessionId: string,
  ): Promise<CloudArenaApiResponse<"cloudArenaSessionReset">> {
    const record = this.requireSession(sessionId);

    resetCloudArenaSessionRecord(record);

    return {
      data: buildCloudArenaSessionSnapshot(record),
    };
  }

  private requireSession(sessionId: string): CloudArenaSessionRecord {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new CloudArenaLocalSessionNotFoundError(sessionId);
    }

    return session;
  }

  private async resolvePlayerDeck(
    request: CloudArenaCreateSessionRequest,
    scenario: CloudArenaScenarioPreset,
  ): Promise<CloudArenaResolvedPlayerDeck> {
    if (!request.deckId) {
      return {
        deckId: null,
        cards: scenario.deck,
      };
    }

    const deck = await this.deckRepository.getCloudArenaDeck(request.deckId);

    return {
      deckId: deck.data.id,
      cards: expandDeckEntries(deck.data.cards),
    };
  }
}

export function createCloudArenaLocalSessionService(
  options: CloudArenaLocalSessionServiceOptions = {},
): CloudArenaLocalSessionService {
  return new CloudArenaLocalSessionService(options);
}
