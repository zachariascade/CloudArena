import { randomBytes } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

import type {
  CloudArenaCardListQuery,
  CloudArenaCardSummary,
  CloudArenaDeckDetail,
  CloudArenaDeckListQuery,
  CloudArenaDeckSummary,
} from "../../../../src/cloud-arena/api-contract.js";
import {
  cloneCloudArenaSavedDeck,
  createCloudArenaDeckValidationIssue,
  expandCloudArenaDeckSource,
  expandCloudArenaSavedDeck,
  getCloudArenaDeckDetailByIdFromCollection,
  listCloudArenaCardSummaries as listSharedCloudArenaCardSummaries,
  listCloudArenaDeckSummariesFromCollection,
  normalizeCloudArenaSavedDeckDraft,
  resolveCloudArenaDeckSourceFromCollection,
  validateCloudArenaSavedDeckDraft,
  validateCloudArenaSavedDeckFile,
  type CloudArenaDeckValidationIssue,
  type CloudArenaResolvedDeckSource as SharedCloudArenaResolvedDeckSource,
  type CloudArenaSavedDeck,
  type CloudArenaSavedDeckCardEntry,
  type CloudArenaSavedDeckCollection as SharedCloudArenaSavedDeckCollection,
  type CloudArenaSavedDeckDraft,
  type CloudArenaSavedDeckRecord,
} from "../../../../src/cloud-arena/deck-content.js";

export type CloudArenaDeckStorageOptions = {
  workspaceRoot?: string;
};

export type LoadedCloudArenaSavedDeckRecord = CloudArenaSavedDeckRecord & {
  filePath: string;
  relativeFilePath: string;
};

export type LoadedCloudArenaSavedDeckCollection =
  SharedCloudArenaSavedDeckCollection<LoadedCloudArenaSavedDeckRecord>;

export type CloudArenaSavedDeckCollection = LoadedCloudArenaSavedDeckCollection;

export type CloudArenaResolvedDeckSource =
  | Extract<SharedCloudArenaResolvedDeckSource, { kind: "preset" }>
  | {
      kind: "saved";
      deckId: string;
      deck: CloudArenaSavedDeck;
      filePath: string;
      relativeFilePath: string;
    };

export type {
  CloudArenaDeckValidationIssue,
  CloudArenaSavedDeck,
  CloudArenaSavedDeckCardEntry,
  CloudArenaSavedDeckDraft,
};

export {
  expandCloudArenaDeckSource,
  expandCloudArenaSavedDeck,
};

const CLOUD_ARENA_SAVED_DECK_DIRECTORY_SEGMENTS = ["data", "cloud-arena", "decks"] as const;

export class CloudArenaSavedDeckNotFoundError extends Error {
  constructor(deckId: string) {
    super(`Cloud Arena deck "${deckId}" was not found.`);
    this.name = "CloudArenaSavedDeckNotFoundError";
  }
}

export class CloudArenaSavedDeckValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudArenaSavedDeckValidationError";
  }
}

function getCloudArenaDeckDirectory(workspaceRoot: string): string {
  return resolve(workspaceRoot, ...CLOUD_ARENA_SAVED_DECK_DIRECTORY_SEGMENTS);
}

function getCloudArenaDeckFilePath(workspaceRoot: string, deckId: string): string {
  return resolve(getCloudArenaDeckDirectory(workspaceRoot), `${deckId}.json`);
}

function createMissingDirectoryIssue(
  workspaceRoot: string,
  directory: string,
): CloudArenaDeckValidationIssue {
  return createCloudArenaDeckValidationIssue(relative(workspaceRoot, directory), "Directory not found.");
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await readdir(targetPath);
    return true;
  } catch {
    return false;
  }
}

function pathExistsSync(targetPath: string): boolean {
  return existsSync(targetPath);
}

async function readSavedDeckFile(
  workspaceRoot: string,
  filePath: string,
): Promise<{ deck: CloudArenaSavedDeck | null; issues: CloudArenaDeckValidationIssue[] }> {
  const relativeFilePath = relative(workspaceRoot, filePath);

  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const validation = validateCloudArenaSavedDeckFile(parsed);

    if (validation.deck === null) {
      return {
        deck: null,
        issues: validation.issues.map((issue) => ({
          file: relativeFilePath,
          message: issue.message,
        })),
      };
    }

    return {
      deck: validation.deck,
      issues: [],
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);

    return {
      deck: null,
      issues: [createCloudArenaDeckValidationIssue(relativeFilePath, `Invalid JSON: ${detail}`)],
    };
  }
}

function readSavedDeckFileSync(
  workspaceRoot: string,
  filePath: string,
): { deck: CloudArenaSavedDeck | null; issues: CloudArenaDeckValidationIssue[] } {
  const relativeFilePath = relative(workspaceRoot, filePath);

  try {
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const validation = validateCloudArenaSavedDeckFile(parsed);

    if (validation.deck === null) {
      return {
        deck: null,
        issues: validation.issues.map((issue) => ({
          file: relativeFilePath,
          message: issue.message,
        })),
      };
    }

    return {
      deck: validation.deck,
      issues: [],
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);

    return {
      deck: null,
      issues: [createCloudArenaDeckValidationIssue(relativeFilePath, `Invalid JSON: ${detail}`)],
    };
  }
}

async function loadSavedDeckRecords(
  workspaceRoot: string,
): Promise<LoadedCloudArenaSavedDeckCollection> {
  const deckDirectory = getCloudArenaDeckDirectory(workspaceRoot);

  if (!(await pathExists(deckDirectory))) {
    return {
      issues: [createMissingDirectoryIssue(workspaceRoot, deckDirectory)],
      records: [],
    };
  }

  const issues: CloudArenaDeckValidationIssue[] = [];
  const records: LoadedCloudArenaSavedDeckRecord[] = [];
  const deckFiles = (await readdir(deckDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => resolve(deckDirectory, entry.name))
    .sort((left, right) => left.localeCompare(right));
  const seenDeckIds = new Set<string>();

  for (const filePath of deckFiles) {
    const readResult = await readSavedDeckFile(workspaceRoot, filePath);

    if (!readResult.deck) {
      issues.push(...readResult.issues);
      continue;
    }

    if (seenDeckIds.has(readResult.deck.id)) {
      issues.push(
        createCloudArenaDeckValidationIssue(
          relative(workspaceRoot, filePath),
          `Deck id "${readResult.deck.id}" appears more than once.`,
        ),
      );
      continue;
    }

    seenDeckIds.add(readResult.deck.id);
    records.push({
      data: readResult.deck,
      filePath,
      relativeFilePath: relative(workspaceRoot, filePath),
    });
  }

  return {
    issues,
    records,
  };
}

function loadSavedDeckRecordsSync(
  workspaceRoot: string,
): LoadedCloudArenaSavedDeckCollection {
  const deckDirectory = getCloudArenaDeckDirectory(workspaceRoot);

  if (!pathExistsSync(deckDirectory)) {
    return {
      issues: [createMissingDirectoryIssue(workspaceRoot, deckDirectory)],
      records: [],
    };
  }

  const issues: CloudArenaDeckValidationIssue[] = [];
  const records: LoadedCloudArenaSavedDeckRecord[] = [];
  const deckFiles = readdirSync(deckDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => resolve(deckDirectory, entry.name))
    .sort((left, right) => left.localeCompare(right));
  const seenDeckIds = new Set<string>();

  for (const filePath of deckFiles) {
    const readResult = readSavedDeckFileSync(workspaceRoot, filePath);

    if (!readResult.deck) {
      issues.push(...readResult.issues);
      continue;
    }

    if (seenDeckIds.has(readResult.deck.id)) {
      issues.push(
        createCloudArenaDeckValidationIssue(
          relative(workspaceRoot, filePath),
          `Deck id "${readResult.deck.id}" appears more than once.`,
        ),
      );
      continue;
    }

    seenDeckIds.add(readResult.deck.id);
    records.push({
      data: readResult.deck,
      filePath,
      relativeFilePath: relative(workspaceRoot, filePath),
    });
  }

  return {
    issues,
    records,
  };
}

function serializeSavedDeck(deck: CloudArenaSavedDeck): string {
  return `${JSON.stringify(deck, null, 2)}\n`;
}

function createCloudArenaDeckId(existingDeckIds: Set<string>): string {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const candidate = `deck_${randomBytes(6).toString("hex")}`;

    if (!existingDeckIds.has(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique Cloud Arena deck id.");
}

function buildDeckRecord(
  workspaceRoot: string,
  deck: CloudArenaSavedDeck,
  filePath?: string,
): LoadedCloudArenaSavedDeckRecord {
  const resolvedFilePath = filePath ?? getCloudArenaDeckFilePath(workspaceRoot, deck.id);

  return {
    data: cloneCloudArenaSavedDeck(deck),
    filePath: resolvedFilePath,
    relativeFilePath: relative(workspaceRoot, resolvedFilePath),
  };
}

function buildSavedDeckValidationError(issues: CloudArenaDeckValidationIssue[]): CloudArenaSavedDeckValidationError {
  return new CloudArenaSavedDeckValidationError(
    issues.map((issue) => issue.message).join(" "),
  );
}

function withLoadedSavedDeckFilePath(
  source: SharedCloudArenaResolvedDeckSource,
  loadedDecks: LoadedCloudArenaSavedDeckCollection,
): CloudArenaResolvedDeckSource | null {
  if (source.kind === "preset") {
    return source;
  }

  const savedDeck = loadedDecks.records.find((record) => record.data.id === source.deckId);

  if (!savedDeck) {
    return null;
  }

  return {
    kind: "saved",
    deckId: savedDeck.data.id,
    deck: cloneCloudArenaSavedDeck(savedDeck.data),
    filePath: savedDeck.filePath,
    relativeFilePath: savedDeck.relativeFilePath,
  };
}

export function loadCloudArenaSavedDeckCollection(
  options: CloudArenaDeckStorageOptions = {},
): Promise<LoadedCloudArenaSavedDeckCollection> {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  return loadSavedDeckRecords(workspaceRoot);
}

export async function createCloudArenaSavedDeck(
  draft: CloudArenaSavedDeckDraft,
  options: CloudArenaDeckStorageOptions = {},
): Promise<LoadedCloudArenaSavedDeckRecord> {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  const normalizedDraft = normalizeCloudArenaSavedDeckDraft(draft);
  const issues = validateCloudArenaSavedDeckDraft(normalizedDraft);

  if (issues.length > 0) {
    throw buildSavedDeckValidationError(issues);
  }

  const collection = await loadSavedDeckRecords(workspaceRoot);
  const existingDeckIds = new Set(collection.records.map((record) => record.data.id));
  const deckId = createCloudArenaDeckId(existingDeckIds);
  const deck: CloudArenaSavedDeck = {
    id: deckId,
    ...normalizedDraft,
    cards: normalizedDraft.cards.map((entry) => ({ ...entry })),
    tags: [...normalizedDraft.tags],
  };
  const filePath = getCloudArenaDeckFilePath(workspaceRoot, deckId);

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, serializeSavedDeck(deck), "utf8");

  return buildDeckRecord(workspaceRoot, deck, filePath);
}

export async function updateCloudArenaSavedDeck(
  deckId: string,
  draft: CloudArenaSavedDeckDraft,
  options: CloudArenaDeckStorageOptions = {},
): Promise<LoadedCloudArenaSavedDeckRecord> {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  const collection = await loadSavedDeckRecords(workspaceRoot);
  const existingDeck = collection.records.find((record) => record.data.id === deckId);

  if (!existingDeck) {
    throw new CloudArenaSavedDeckNotFoundError(deckId);
  }

  const normalizedDraft = normalizeCloudArenaSavedDeckDraft(draft);
  const issues = validateCloudArenaSavedDeckDraft(normalizedDraft);

  if (issues.length > 0) {
    throw buildSavedDeckValidationError(issues);
  }

  const deck: CloudArenaSavedDeck = {
    id: deckId,
    ...normalizedDraft,
    cards: normalizedDraft.cards.map((entry) => ({ ...entry })),
    tags: [...normalizedDraft.tags],
  };

  await writeFile(existingDeck.filePath, serializeSavedDeck(deck), "utf8");

  return buildDeckRecord(workspaceRoot, deck, existingDeck.filePath);
}

export async function deleteCloudArenaSavedDeck(
  deckId: string,
  options: CloudArenaDeckStorageOptions = {},
): Promise<void> {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  const collection = await loadSavedDeckRecords(workspaceRoot);
  const existingDeck = collection.records.find((record) => record.data.id === deckId);

  if (!existingDeck) {
    throw new CloudArenaSavedDeckNotFoundError(deckId);
  }

  await rm(existingDeck.filePath, { force: true });
}

export async function resolveCloudArenaDeckSourceById(
  deckId: string,
  options: CloudArenaDeckStorageOptions & {
    loadedDecks?: LoadedCloudArenaSavedDeckCollection;
  } = {},
): Promise<CloudArenaResolvedDeckSource | null> {
  const loadedDecks =
    options.loadedDecks ?? (await loadSavedDeckRecords(resolve(options.workspaceRoot ?? process.cwd())));
  const source = resolveCloudArenaDeckSourceFromCollection(deckId, loadedDecks);

  return source ? withLoadedSavedDeckFilePath(source, loadedDecks) : null;
}

export function resolveCloudArenaDeckSourceByIdSync(
  deckId: string,
  options: CloudArenaDeckStorageOptions & {
    loadedDecks?: LoadedCloudArenaSavedDeckCollection;
  } = {},
): CloudArenaResolvedDeckSource | null {
  const loadedDecks =
    options.loadedDecks ?? loadSavedDeckRecordsSync(resolve(options.workspaceRoot ?? process.cwd()));
  const source = resolveCloudArenaDeckSourceFromCollection(deckId, loadedDecks);

  return source ? withLoadedSavedDeckFilePath(source, loadedDecks) : null;
}

export function listCloudArenaCardSummaries(
  query: CloudArenaCardListQuery = {},
): CloudArenaCardSummary[] {
  return listSharedCloudArenaCardSummaries(query);
}

export function listCloudArenaDeckSummaries(
  query: CloudArenaDeckListQuery = {},
  options: CloudArenaDeckStorageOptions = {},
): CloudArenaDeckSummary[] {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  const loadedDecks = loadSavedDeckRecordsSync(workspaceRoot);

  return listCloudArenaDeckSummariesFromCollection(loadedDecks, query);
}

export function getCloudArenaDeckDetailById(
  deckId: string,
  options: CloudArenaDeckStorageOptions = {},
): CloudArenaDeckDetail | null {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  const loadedDecks = loadSavedDeckRecordsSync(workspaceRoot);

  return getCloudArenaDeckDetailByIdFromCollection(deckId, loadedDecks);
}

export async function getCloudArenaDeckDetailByIdAsync(
  deckId: string,
  options: CloudArenaDeckStorageOptions = {},
): Promise<CloudArenaDeckDetail | null> {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  const loadedDecks = await loadSavedDeckRecords(workspaceRoot);

  return getCloudArenaDeckDetailByIdFromCollection(deckId, loadedDecks);
}
