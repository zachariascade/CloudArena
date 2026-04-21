import { randomBytes } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

import { z } from "zod";

import {
  deckIdSchema,
  uniqueStringArray,
} from "../../../../src/domain/index.js";
import type {
  CloudArenaCardListQuery,
  CloudArenaCardSummary,
  CloudArenaDeckCardEntry,
  CloudArenaDeckDetail,
  CloudArenaDeckKind,
  CloudArenaDeckListQuery,
  CloudArenaDeckSummary,
} from "../../../../src/cloud-arena/api-contract.js";
import {
  cardDefinitions,
  cloudArenaDeckPresets,
  getDeckPreset,
  type CardDefinitionId,
  type CardDefinition,
  type CloudArenaDeckPreset,
  type CloudArenaDeckPresetId,
} from "../../../../src/cloud-arena/index.js";
import { summarizeCardDefinition } from "../../../../src/cloud-arena/card-summary.js";

export type CloudArenaDeckStorageOptions = {
  workspaceRoot?: string;
};

export type CloudArenaDeckValidationIssue = {
  file?: string;
  message: string;
};

export type CloudArenaSavedDeckCardEntry = {
  cardId: CardDefinitionId;
  quantity: number;
};

export type CloudArenaSavedDeck = {
  id: string;
  name: string;
  cards: CloudArenaSavedDeckCardEntry[];
  tags: string[];
  notes: string | null;
};

export type CloudArenaSavedDeckDraft = {
  name: string;
  cards: CloudArenaSavedDeckCardEntry[];
  tags?: string[];
  notes?: string | null;
};

export type LoadedCloudArenaSavedDeckRecord = {
  data: CloudArenaSavedDeck;
  filePath: string;
  relativeFilePath: string;
};

export type CloudArenaSavedDeckCollection = {
  issues: CloudArenaDeckValidationIssue[];
  records: LoadedCloudArenaSavedDeckRecord[];
};

export type CloudArenaResolvedDeckSource =
  | {
      kind: "preset";
      deckId: CloudArenaDeckPresetId;
      deck: CloudArenaDeckPreset;
    }
  | {
      kind: "saved";
      deckId: string;
      deck: CloudArenaSavedDeck;
      filePath: string;
      relativeFilePath: string;
    };

const CLOUD_ARENA_SAVED_DECK_DIRECTORY_SEGMENTS = ["data", "cloud-arena", "decks"] as const;
const CLOUD_ARENA_MINIMUM_DECK_CARD_COUNT = 20;
const CLOUD_ARENA_DECK_CARD_ID_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

const cloudArenaSavedDeckEntrySchema = z.object({
  cardId: z.string().regex(CLOUD_ARENA_DECK_CARD_ID_PATTERN),
  quantity: z.number().int().min(1),
});

const cloudArenaSavedDeckDraftSchema = z.object({
  name: z.string().min(1),
  cards: z.array(cloudArenaSavedDeckEntrySchema).min(1),
  tags: uniqueStringArray().optional(),
  notes: z.string().nullable().optional(),
});

const cloudArenaSavedDeckSchema = z.object({
  id: deckIdSchema,
  name: z.string().min(1),
  cards: z.array(cloudArenaSavedDeckEntrySchema).min(1),
  tags: uniqueStringArray(),
  notes: z.string().nullable(),
});

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

function formatIssuePath(pathSegments: (string | number)[]): string {
  if (pathSegments.length === 0) {
    return "";
  }

  return pathSegments
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : `.${segment}`))
    .join("")
    .replace(/^\./, "");
}

function createIssue(file: string, message: string): CloudArenaDeckValidationIssue {
  return {
    file,
    message,
  };
}

function createMissingDirectoryIssue(
  workspaceRoot: string,
  directory: string,
): CloudArenaDeckValidationIssue {
  return createIssue(relative(workspaceRoot, directory), "Directory not found.");
}

function isCloudArenaPlayerCardId(cardId: string): boolean {
  return !cardId.startsWith("enemy_");
}

function cloneDeck(data: CloudArenaSavedDeck): CloudArenaSavedDeck {
  return {
    id: data.id,
    name: data.name,
    cards: data.cards.map((entry) => ({ ...entry })),
    tags: [...data.tags],
    notes: data.notes,
  };
}

function normalizeDraft(draft: CloudArenaSavedDeckDraft): Required<CloudArenaSavedDeckDraft> {
  return {
    name: draft.name,
    cards: draft.cards.map((entry) => ({ ...entry })),
    tags: [...(draft.tags ?? [])],
    notes: draft.notes ?? null,
  };
}

function createCardTypeLine(definition: CardDefinition): string {
  const baseLine = definition.cardTypes.join(" ");
  const subtypeLine = definition.subtypes?.length ? ` — ${definition.subtypes.join(" ")}` : "";

  return `${baseLine}${subtypeLine}`;
}

function isPlayableCloudArenaCardDefinition(definition: CardDefinition): boolean {
  return !definition.id.startsWith("enemy_");
}

function toCardSummary(definition: CardDefinition) {
  return {
    id: definition.id,
    name: definition.name,
    cost: definition.cost,
    typeLine: createCardTypeLine(definition),
    cardTypes: [...definition.cardTypes],
    subtypes: [...(definition.subtypes ?? [])],
    effectSummary: summarizeCardDefinition(definition).join(" • "),
  };
}

function summarizeDeckCards(cards: CloudArenaSavedDeckCardEntry[]): {
  cardCount: number;
  uniqueCardCount: number;
} {
  return {
    cardCount: cards.reduce((total, entry) => total + entry.quantity, 0),
    uniqueCardCount: cards.length,
  };
}

function createDeckSummary(
  deck: CloudArenaSavedDeck | CloudArenaDeckPreset,
  kind: CloudArenaDeckKind,
): CloudArenaDeckSummary {
  const cards = kind === "preset"
    ? (() => {
        const presetDeck = deck as CloudArenaDeckPreset;

        return presetDeck.cards.reduce<CloudArenaSavedDeckCardEntry[]>((entries, cardId) => {
          const existing = entries.find((entry) => entry.cardId === cardId);

          if (existing) {
            existing.quantity += 1;
          } else {
            entries.push({ cardId, quantity: 1 });
          }

          return entries;
        }, []);
      })()
    : (deck as CloudArenaSavedDeck).cards;
  const { cardCount, uniqueCardCount } = summarizeDeckCards(cards);
  const summaryDeck = deck as CloudArenaSavedDeck;

  return {
    id: deck.id,
    kind,
    name: "name" in deck ? deck.name : summaryDeck.name,
    cardCount,
    uniqueCardCount,
    tags: kind === "saved" ? [...summaryDeck.tags] : [],
    notes: kind === "saved" ? summaryDeck.notes : null,
  };
}

function createDeckDetail(
  deck: CloudArenaSavedDeck | CloudArenaDeckPreset,
  kind: CloudArenaDeckKind,
): CloudArenaDeckDetail {
  const summary = createDeckSummary(deck, kind);

  return {
    ...summary,
    cards:
      kind === "preset"
        ? (() => {
            const presetDeck = deck as CloudArenaDeckPreset;

            return presetDeck.cards.reduce<CloudArenaSavedDeckCardEntry[]>((entries, cardId) => {
              const existing = entries.find((entry) => entry.cardId === cardId);

              if (existing) {
                existing.quantity += 1;
              } else {
                entries.push({ cardId, quantity: 1 });
              }

              return entries;
            }, []);
          })()
        : (deck as CloudArenaSavedDeck).cards.map((entry) => ({ ...entry })),
  };
}

function getCloudArenaPresetDeckSummaries(): CloudArenaDeckSummary[] {
  return Object.values(cloudArenaDeckPresets).map((deck) => createDeckSummary(deck, "preset"));
}

function getCloudArenaPresetDeckDetail(deckId: string): CloudArenaDeckDetail | null {
  if (!Object.prototype.hasOwnProperty.call(cloudArenaDeckPresets, deckId)) {
    return null;
  }

  const deck = getDeckPreset(deckId as CloudArenaDeckPresetId);

  return createDeckDetail(deck, "preset");
}

function getCloudArenaPlayableCardSummaries(): ReturnType<typeof toCardSummary>[] {
  return Object.values(cardDefinitions)
    .filter((definition) => isPlayableCloudArenaCardDefinition(definition))
    .map((definition) => toCardSummary(definition))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function matchesCloudArenaCardQuery(
  summary: ReturnType<typeof toCardSummary>,
  query: { q?: string; cardType?: string } = {},
): boolean {
  const normalizedQuery = query.q?.trim().toLowerCase();
  const normalizedCardType = query.cardType?.trim().toLowerCase();

  if (normalizedCardType) {
    const cardTypeMatch = summary.cardTypes.some((cardType) => cardType.toLowerCase() === normalizedCardType);
    const permanentMatch = normalizedCardType === "permanent" && summary.cardTypes.some((cardType) =>
      ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"].includes(cardType),
    );

    if (!cardTypeMatch && !permanentMatch) {
      return false;
    }
  }

  if (!normalizedQuery) {
    return true;
  }

  const haystack = [
    summary.id,
    summary.name,
    summary.typeLine,
    summary.effectSummary,
    ...summary.cardTypes,
    ...summary.subtypes,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

function compressCardIds(cards: CardDefinitionId[]): CloudArenaSavedDeckCardEntry[] {
  const compressed: CloudArenaSavedDeckCardEntry[] = [];

  for (const cardId of cards) {
    const existing = compressed.find((entry) => entry.cardId === cardId);

    if (existing) {
      existing.quantity += 1;
    } else {
      compressed.push({ cardId, quantity: 1 });
    }
  }

  return compressed;
}

function validateDeckCardEntries(
  cards: CloudArenaSavedDeckCardEntry[],
): CloudArenaDeckValidationIssue[] {
  const issues: CloudArenaDeckValidationIssue[] = [];
  const seenCardIds = new Set<string>();
  let totalQuantity = 0;

  for (const [index, entry] of cards.entries()) {
    const entryPath = `cards[${index}]`;

    const definition = cardDefinitions[entry.cardId];

    if (!definition) {
      issues.push(createIssue(entryPath, `Card "${entry.cardId}" was not found.`));
    } else if (!isCloudArenaPlayerCardId(entry.cardId)) {
      issues.push(createIssue(entryPath, `Card "${entry.cardId}" is not a Cloud Arena player card.`));
    }

    if (seenCardIds.has(entry.cardId)) {
      issues.push(createIssue(entryPath, `Card "${entry.cardId}" appears more than once.`));
    }
    seenCardIds.add(entry.cardId);

    totalQuantity += entry.quantity;
  }

  if (totalQuantity < CLOUD_ARENA_MINIMUM_DECK_CARD_COUNT) {
    issues.push(
      createIssue(
        "cards",
        `Deck must contain at least ${CLOUD_ARENA_MINIMUM_DECK_CARD_COUNT} cards.`,
      ),
    );
  }

  return issues;
}

function validateDeckDraft(draft: CloudArenaSavedDeckDraft): CloudArenaDeckValidationIssue[] {
  const issues: CloudArenaDeckValidationIssue[] = [];
  const parsed = cloudArenaSavedDeckDraftSchema.safeParse(draft);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = formatIssuePath(issue.path);
      issues.push(createIssue(path || "deck", issue.message));
    }
    return issues;
  }

  return validateDeckCardEntries(parsed.data.cards);
}

function validateSavedDeckFile(data: unknown): {
  issues: CloudArenaDeckValidationIssue[];
  deck: CloudArenaSavedDeck | null;
} {
  const result = cloudArenaSavedDeckSchema.safeParse(data);

  if (!result.success) {
    return {
      deck: null,
      issues: result.error.issues.map((issue) => {
        const path = formatIssuePath(issue.path);
        return createIssue(path || "deck", issue.message);
      }),
    };
  }

  const issues = validateDeckCardEntries(result.data.cards);

  if (issues.length > 0) {
    return {
      deck: null,
      issues,
    };
  }

  return {
    deck: cloneDeck(result.data),
    issues: [],
  };
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
    const validation = validateSavedDeckFile(parsed);

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
      issues: [createIssue(relativeFilePath, `Invalid JSON: ${detail}`)],
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
    const validation = validateSavedDeckFile(parsed);

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
      issues: [createIssue(relativeFilePath, `Invalid JSON: ${detail}`)],
    };
  }
}

async function loadSavedDeckRecords(
  workspaceRoot: string,
): Promise<CloudArenaSavedDeckCollection> {
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
        createIssue(
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
): CloudArenaSavedDeckCollection {
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
        createIssue(
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
    data: cloneDeck(deck),
    filePath: resolvedFilePath,
    relativeFilePath: relative(workspaceRoot, resolvedFilePath),
  };
}

function expandSavedDeckEntries(cards: CloudArenaSavedDeckCardEntry[]): CardDefinitionId[] {
  const expandedCards: CardDefinitionId[] = [];

  for (const entry of cards) {
    for (let index = 0; index < entry.quantity; index += 1) {
      expandedCards.push(entry.cardId);
    }
  }

  return expandedCards;
}

export function expandCloudArenaSavedDeck(deck: CloudArenaSavedDeck): CardDefinitionId[] {
  return expandSavedDeckEntries(deck.cards);
}

export function expandCloudArenaDeckSource(
  source: CloudArenaResolvedDeckSource,
): CardDefinitionId[] {
  return source.kind === "preset" ? [...source.deck.cards] : expandCloudArenaSavedDeck(source.deck);
}

export function loadCloudArenaSavedDeckCollection(
  options: CloudArenaDeckStorageOptions = {},
): Promise<CloudArenaSavedDeckCollection> {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  return loadSavedDeckRecords(workspaceRoot);
}

export async function createCloudArenaSavedDeck(
  draft: CloudArenaSavedDeckDraft,
  options: CloudArenaDeckStorageOptions = {},
): Promise<LoadedCloudArenaSavedDeckRecord> {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  const normalizedDraft = normalizeDraft(draft);
  const issues = validateDeckDraft(normalizedDraft);

  if (issues.length > 0) {
    throw new CloudArenaSavedDeckValidationError(
      issues.map((issue) => issue.message).join(" "),
    );
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

  const normalizedDraft = normalizeDraft(draft);
  const issues = validateDeckDraft(normalizedDraft);

  if (issues.length > 0) {
    throw new CloudArenaSavedDeckValidationError(
      issues.map((issue) => issue.message).join(" "),
    );
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
    loadedDecks?: CloudArenaSavedDeckCollection;
  } = {},
): Promise<CloudArenaResolvedDeckSource | null> {
  if (Object.prototype.hasOwnProperty.call(cloudArenaDeckPresets, deckId)) {
    const preset = getDeckPreset(deckId as CloudArenaDeckPresetId);

    return {
      kind: "preset",
      deckId: preset.id,
      deck: preset,
    };
  }

  const loadedDecks =
    options.loadedDecks ?? (await loadSavedDeckRecords(resolve(options.workspaceRoot ?? process.cwd())));
  const savedDeck = loadedDecks.records.find((record) => record.data.id === deckId);

  if (!savedDeck) {
    return null;
  }

  return {
    kind: "saved",
    deckId: savedDeck.data.id,
    deck: cloneDeck(savedDeck.data),
    filePath: savedDeck.filePath,
    relativeFilePath: savedDeck.relativeFilePath,
  };
}

export function resolveCloudArenaDeckSourceByIdSync(
  deckId: string,
  options: CloudArenaDeckStorageOptions & {
    loadedDecks?: CloudArenaSavedDeckCollection;
  } = {},
): CloudArenaResolvedDeckSource | null {
  if (Object.prototype.hasOwnProperty.call(cloudArenaDeckPresets, deckId)) {
    const preset = getDeckPreset(deckId as CloudArenaDeckPresetId);

    return {
      kind: "preset",
      deckId: preset.id,
      deck: preset,
    };
  }

  const loadedDecks =
    options.loadedDecks ?? loadSavedDeckRecordsSync(resolve(options.workspaceRoot ?? process.cwd()));
  const savedDeck = loadedDecks.records.find((record) => record.data.id === deckId);

  if (!savedDeck) {
    return null;
  }

  return {
    kind: "saved",
    deckId: savedDeck.data.id,
    deck: cloneDeck(savedDeck.data),
    filePath: savedDeck.filePath,
    relativeFilePath: savedDeck.relativeFilePath,
  };
}

export function listCloudArenaCardSummaries(
  query: CloudArenaCardListQuery = {},
): CloudArenaCardSummary[] {
  return getCloudArenaPlayableCardSummaries().filter((summary) =>
    matchesCloudArenaCardQuery(summary, query),
  );
}

export function listCloudArenaDeckSummaries(
  query: CloudArenaDeckListQuery = {},
  options: CloudArenaDeckStorageOptions = {},
): CloudArenaDeckSummary[] {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  const loadedDecks = loadSavedDeckRecordsSync(workspaceRoot);
  const presetDecks = getCloudArenaPresetDeckSummaries();
  const savedDecks = loadedDecks.records.map((record) =>
    createDeckSummary(record.data, "saved"),
  );
  const summaries = [...presetDecks, ...savedDecks];

  return summaries.filter((summary) => {
    if (query.kind && summary.kind !== query.kind) {
      return false;
    }

    if (query.containsCardId && !getCloudArenaDeckDetailById(summary.id, options)?.cards.some((entry) => entry.cardId === query.containsCardId)) {
      return false;
    }

    const normalizedQuery = query.q?.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }

    const haystack = [summary.id, summary.name, summary.notes ?? "", ...summary.tags].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function getCloudArenaDeckDetailById(
  deckId: string,
  options: CloudArenaDeckStorageOptions = {},
): CloudArenaDeckDetail | null {
  const resolved = resolveCloudArenaDeckSourceByIdSync(deckId, options);

  if (!resolved) {
    return null;
  }

  return createDeckDetail(resolved.deck, resolved.kind);
}

export async function getCloudArenaDeckDetailByIdAsync(
  deckId: string,
  options: CloudArenaDeckStorageOptions = {},
): Promise<CloudArenaDeckDetail | null> {
  const resolved = await resolveCloudArenaDeckSourceById(deckId, options);

  if (!resolved) {
    return null;
  }

  return createDeckDetail(resolved.deck, resolved.kind);
}
