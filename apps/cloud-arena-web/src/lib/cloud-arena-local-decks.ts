import type {
  CloudArenaApiContractName,
  CloudArenaApiContracts,
  CloudArenaDeckListQuery,
  CloudArenaDeckWriteRequest,
  CloudArenaCardListQuery,
} from "../../../../src/cloud-arena/api-contract.js";
import {
  cloneCloudArenaSavedDeck,
  getCloudArenaDeckDetailByIdFromCollection,
  listCloudArenaCardSummaries,
  listCloudArenaDeckSummariesFromCollection,
  normalizeCloudArenaSavedDeckDraft,
  validateCloudArenaSavedDeckFile,
  validateCloudArenaSavedDeckDraft,
  type CloudArenaSavedDeck,
  type CloudArenaSavedDeckCollection,
} from "../../../../src/cloud-arena/index.js";

type CloudArenaApiResponse<TName extends CloudArenaApiContractName> =
  CloudArenaApiContracts[TName]["response"];

type BrowserStorageLike = {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

type CloudArenaLocalDeckStorePayload = {
  schemaVersion: 1;
  savedDecks: CloudArenaSavedDeck[];
  updatedAt: string;
};

type CloudArenaLocalDeckRepositoryOptions = {
  idGenerator?: () => string;
  now?: () => Date;
  storage?: BrowserStorageLike;
  storageKey?: string;
};

const CLOUD_ARENA_LOCAL_DECKS_STORAGE_KEY = "cloud-arena.local-decks.v1";

export class CloudArenaLocalDeckNotFoundError extends Error {
  constructor(deckId: string) {
    super(`Cloud Arena deck "${deckId}" was not found.`);
    this.name = "CloudArenaLocalDeckNotFoundError";
  }
}

export class CloudArenaLocalDeckValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudArenaLocalDeckValidationError";
  }
}

class MemoryStorage implements BrowserStorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function resolveDefaultStorage(): BrowserStorageLike {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }

  return new MemoryStorage();
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

function createCloudArenaLocalDeckId(existingDeckIds: Set<string>): string {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const candidate = `deck_${createRandomHex(6)}`;

    if (!existingDeckIds.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique Cloud Arena deck id.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseStoredPayload(raw: string | null): CloudArenaSavedDeckCollection {
  if (!raw) {
    return {
      issues: [],
      records: [],
    };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isRecord(parsed) || parsed.schemaVersion !== 1 || !Array.isArray(parsed.savedDecks)) {
      return {
        issues: [{ message: "Saved deck storage payload is not compatible." }],
        records: [],
      };
    }

    const records: CloudArenaSavedDeckCollection["records"] = [];
    const issues: CloudArenaSavedDeckCollection["issues"] = [];
    const seenDeckIds = new Set<string>();

    for (const [index, deck] of parsed.savedDecks.entries()) {
      const validation = validateCloudArenaSavedDeckFile(deck);

      if (!validation.deck) {
        issues.push(...validation.issues.map((issue) => ({
          file: `savedDecks[${index}]`,
          message: issue.message,
        })));
        continue;
      }

      if (seenDeckIds.has(validation.deck.id)) {
        issues.push({
          file: `savedDecks[${index}]`,
          message: `Deck id "${validation.deck.id}" appears more than once.`,
        });
        continue;
      }

      seenDeckIds.add(validation.deck.id);
      records.push({ data: validation.deck });
    }

    return {
      issues,
      records,
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);

    return {
      issues: [{ message: `Invalid saved deck storage JSON: ${detail}` }],
      records: [],
    };
  }
}

function createPayload(
  savedDecks: CloudArenaSavedDeck[],
  now: Date,
): CloudArenaLocalDeckStorePayload {
  return {
    schemaVersion: 1,
    savedDecks: savedDecks.map((deck) => cloneCloudArenaSavedDeck(deck)),
    updatedAt: now.toISOString(),
  };
}

function toDeckValidationError(issues: CloudArenaSavedDeckCollection["issues"]): CloudArenaLocalDeckValidationError {
  return new CloudArenaLocalDeckValidationError(
    issues.map((issue) => issue.message).join(" "),
  );
}

export class CloudArenaLocalDeckRepository {
  private readonly idGenerator: () => string;
  private readonly now: () => Date;
  private readonly storage: BrowserStorageLike;
  private readonly storageKey: string;

  constructor(options: CloudArenaLocalDeckRepositoryOptions = {}) {
    this.idGenerator = options.idGenerator ?? (() => createCloudArenaLocalDeckId(this.getExistingDeckIds()));
    this.now = options.now ?? (() => new Date());
    this.storage = options.storage ?? resolveDefaultStorage();
    this.storageKey = options.storageKey ?? CLOUD_ARENA_LOCAL_DECKS_STORAGE_KEY;
  }

  async listCloudArenaCards(
    query: CloudArenaCardListQuery = {},
  ): Promise<CloudArenaApiResponse<"cloudArenaCards">> {
    return {
      data: listCloudArenaCardSummaries(query),
    };
  }

  async listCloudArenaDecks(
    query: CloudArenaDeckListQuery = {},
  ): Promise<CloudArenaApiResponse<"cloudArenaDecks">> {
    return {
      data: listCloudArenaDeckSummariesFromCollection(this.loadCollection(), query),
    };
  }

  async getCloudArenaDeck(deckId: string): Promise<CloudArenaApiResponse<"cloudArenaDeckDetail">> {
    const deck = getCloudArenaDeckDetailByIdFromCollection(deckId, this.loadCollection());

    if (!deck) {
      throw new CloudArenaLocalDeckNotFoundError(deckId);
    }

    return {
      data: deck,
    };
  }

  async createCloudArenaDeck(
    body: CloudArenaDeckWriteRequest,
  ): Promise<CloudArenaApiResponse<"cloudArenaDeckDetail">> {
    const collection = this.loadCollection();
    const normalizedDraft = normalizeCloudArenaSavedDeckDraft(body);
    const issues = validateCloudArenaSavedDeckDraft(normalizedDraft);

    if (issues.length > 0) {
      throw toDeckValidationError(issues);
    }

    const deckId = this.idGenerator();
    const existingDeckIds = new Set(collection.records.map((record) => record.data.id));

    if (existingDeckIds.has(deckId)) {
      throw new CloudArenaLocalDeckValidationError(`Deck id "${deckId}" already exists.`);
    }

    const deck: CloudArenaSavedDeck = {
      id: deckId,
      ...normalizedDraft,
      cards: normalizedDraft.cards.map((entry) => ({ ...entry })),
      tags: [...normalizedDraft.tags],
    };

    this.saveDecks([...collection.records.map((record) => record.data), deck]);
    return this.getCloudArenaDeck(deck.id);
  }

  async updateCloudArenaDeck(
    deckId: string,
    body: CloudArenaDeckWriteRequest,
  ): Promise<CloudArenaApiResponse<"cloudArenaDeckDetail">> {
    const collection = this.loadCollection();
    const existingDeck = collection.records.find((record) => record.data.id === deckId);

    if (!existingDeck) {
      throw new CloudArenaLocalDeckNotFoundError(deckId);
    }

    const normalizedDraft = normalizeCloudArenaSavedDeckDraft(body);
    const issues = validateCloudArenaSavedDeckDraft(normalizedDraft);

    if (issues.length > 0) {
      throw toDeckValidationError(issues);
    }

    const deck: CloudArenaSavedDeck = {
      id: deckId,
      ...normalizedDraft,
      cards: normalizedDraft.cards.map((entry) => ({ ...entry })),
      tags: [...normalizedDraft.tags],
    };

    this.saveDecks(collection.records.map((record) =>
      record.data.id === deckId ? deck : record.data,
    ));

    return this.getCloudArenaDeck(deckId);
  }

  async deleteCloudArenaDeck(
    deckId: string,
  ): Promise<CloudArenaApiResponse<"cloudArenaDeckDelete">> {
    const collection = this.loadCollection();

    if (!collection.records.some((record) => record.data.id === deckId)) {
      throw new CloudArenaLocalDeckNotFoundError(deckId);
    }

    this.saveDecks(collection.records
      .filter((record) => record.data.id !== deckId)
      .map((record) => record.data));

    return {
      data: {
        deleted: true,
        deckId,
      },
    };
  }

  private getExistingDeckIds(): Set<string> {
    return new Set(this.loadCollection().records.map((record) => record.data.id));
  }

  private loadCollection(): CloudArenaSavedDeckCollection {
    return parseStoredPayload(this.storage.getItem(this.storageKey));
  }

  private saveDecks(decks: CloudArenaSavedDeck[]): void {
    const payload = createPayload(decks, this.now());

    if (payload.savedDecks.length === 0) {
      this.storage.removeItem(this.storageKey);
      return;
    }

    this.storage.setItem(this.storageKey, JSON.stringify(payload));
  }
}

export function createCloudArenaLocalDeckRepository(
  options: CloudArenaLocalDeckRepositoryOptions = {},
): CloudArenaLocalDeckRepository {
  return new CloudArenaLocalDeckRepository(options);
}
