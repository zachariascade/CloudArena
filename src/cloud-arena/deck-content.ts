import { z } from "zod";

import {
  deckIdSchema,
  uniqueStringArray,
} from "../domain/index.js";
import type {
  CloudArenaCardListQuery,
  CloudArenaCardSummary,
  CloudArenaDeckCardEntry,
  CloudArenaDeckDetail,
  CloudArenaDeckKind,
  CloudArenaDeckListQuery,
  CloudArenaDeckSummary,
} from "./api-contract.js";
import { summarizeCardDefinition } from "./card-summary.js";
import {
  cardDefinitions,
} from "./cards/definitions.js";
import type {
  CardDefinition,
  CardDefinitionId,
} from "./core/types.js";
import {
  cloudArenaDeckPresets,
  getDeckPreset,
  type CloudArenaDeckPreset,
  type CloudArenaDeckPresetId,
} from "./scenarios/index.js";

export type CloudArenaDeckValidationIssue = {
  file?: string;
  message: string;
};

export type CloudArenaSavedDeckCardEntry = CloudArenaDeckCardEntry;

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

export type CloudArenaSavedDeckRecord = {
  data: CloudArenaSavedDeck;
};

export type CloudArenaSavedDeckCollection<
  TRecord extends CloudArenaSavedDeckRecord = CloudArenaSavedDeckRecord,
> = {
  issues: CloudArenaDeckValidationIssue[];
  records: TRecord[];
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
    };

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

function formatIssuePath(pathSegments: (string | number)[]): string {
  if (pathSegments.length === 0) {
    return "";
  }

  return pathSegments
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : `.${segment}`))
    .join("")
    .replace(/^\./, "");
}

export function createCloudArenaDeckValidationIssue(
  file: string,
  message: string,
): CloudArenaDeckValidationIssue {
  return {
    file,
    message,
  };
}

function isCloudArenaPlayerCardId(cardId: string): boolean {
  return !cardId.startsWith("enemy_");
}

export function cloneCloudArenaSavedDeck(data: CloudArenaSavedDeck): CloudArenaSavedDeck {
  return {
    id: data.id,
    name: data.name,
    cards: data.cards.map((entry) => ({ ...entry })),
    tags: [...data.tags],
    notes: data.notes,
  };
}

export function normalizeCloudArenaSavedDeckDraft(
  draft: CloudArenaSavedDeckDraft,
): Required<CloudArenaSavedDeckDraft> {
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

function toCardSummary(definition: CardDefinition): CloudArenaCardSummary {
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

export function createCloudArenaDeckSummary(
  deck: CloudArenaSavedDeck | CloudArenaDeckPreset,
  kind: CloudArenaDeckKind,
): CloudArenaDeckSummary {
  const cards = kind === "preset"
    ? compressCardIds((deck as CloudArenaDeckPreset).cards)
    : (deck as CloudArenaSavedDeck).cards;
  const { cardCount, uniqueCardCount } = summarizeDeckCards(cards);
  const deckName = kind === "preset"
    ? (deck as CloudArenaDeckPreset).label
    : (deck as CloudArenaSavedDeck).name;
  const savedDeck = deck as CloudArenaSavedDeck;

  return {
    id: deck.id,
    kind,
    name: deckName,
    cardCount,
    uniqueCardCount,
    tags: kind === "saved" ? [...savedDeck.tags] : [],
    notes: kind === "saved" ? savedDeck.notes : null,
  };
}

export function createCloudArenaDeckDetail(
  deck: CloudArenaSavedDeck | CloudArenaDeckPreset,
  kind: CloudArenaDeckKind,
): CloudArenaDeckDetail {
  return {
    ...createCloudArenaDeckSummary(deck, kind),
    cards:
      kind === "preset"
        ? compressCardIds((deck as CloudArenaDeckPreset).cards)
        : (deck as CloudArenaSavedDeck).cards.map((entry) => ({ ...entry })),
  };
}

export function getCloudArenaPresetDeckSummaries(): CloudArenaDeckSummary[] {
  return Object.values(cloudArenaDeckPresets).map((deck) =>
    createCloudArenaDeckSummary(deck, "preset"),
  );
}

export function getCloudArenaPresetDeckDetail(deckId: string): CloudArenaDeckDetail | null {
  if (!Object.prototype.hasOwnProperty.call(cloudArenaDeckPresets, deckId)) {
    return null;
  }

  const deck = getDeckPreset(deckId as CloudArenaDeckPresetId);

  return createCloudArenaDeckDetail(deck, "preset");
}

function getCloudArenaPlayableCardSummaries(): CloudArenaCardSummary[] {
  return Object.values(cardDefinitions)
    .filter((definition) => isPlayableCloudArenaCardDefinition(definition))
    .map((definition) => toCardSummary(definition))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function matchesCloudArenaCardQuery(
  summary: CloudArenaCardSummary,
  query: CloudArenaCardListQuery = {},
): boolean {
  const normalizedQuery = query.q?.trim().toLowerCase();
  const normalizedCardType = query.cardType?.trim().toLowerCase();

  if (normalizedCardType) {
    const cardTypeMatch = summary.cardTypes.some((cardType) =>
      cardType.toLowerCase() === normalizedCardType,
    );
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
      issues.push(createCloudArenaDeckValidationIssue(entryPath, `Card "${entry.cardId}" was not found.`));
    } else if (!isCloudArenaPlayerCardId(entry.cardId)) {
      issues.push(createCloudArenaDeckValidationIssue(entryPath, `Card "${entry.cardId}" is not a Cloud Arena player card.`));
    }

    if (seenCardIds.has(entry.cardId)) {
      issues.push(createCloudArenaDeckValidationIssue(entryPath, `Card "${entry.cardId}" appears more than once.`));
    }
    seenCardIds.add(entry.cardId);

    totalQuantity += entry.quantity;
  }

  if (totalQuantity < CLOUD_ARENA_MINIMUM_DECK_CARD_COUNT) {
    issues.push(
      createCloudArenaDeckValidationIssue(
        "cards",
        `Deck must contain at least ${CLOUD_ARENA_MINIMUM_DECK_CARD_COUNT} cards.`,
      ),
    );
  }

  return issues;
}

export function validateCloudArenaSavedDeckDraft(
  draft: CloudArenaSavedDeckDraft,
): CloudArenaDeckValidationIssue[] {
  const issues: CloudArenaDeckValidationIssue[] = [];
  const parsed = cloudArenaSavedDeckDraftSchema.safeParse(draft);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const path = formatIssuePath(issue.path);
      issues.push(createCloudArenaDeckValidationIssue(path || "deck", issue.message));
    }
    return issues;
  }

  return validateDeckCardEntries(parsed.data.cards);
}

export function validateCloudArenaSavedDeckFile(data: unknown): {
  issues: CloudArenaDeckValidationIssue[];
  deck: CloudArenaSavedDeck | null;
} {
  const result = cloudArenaSavedDeckSchema.safeParse(data);

  if (!result.success) {
    return {
      deck: null,
      issues: result.error.issues.map((issue) => {
        const path = formatIssuePath(issue.path);
        return createCloudArenaDeckValidationIssue(path || "deck", issue.message);
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
    deck: cloneCloudArenaSavedDeck(result.data),
    issues: [],
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

export function resolveCloudArenaDeckSourceFromCollection(
  deckId: string,
  collection: CloudArenaSavedDeckCollection = { issues: [], records: [] },
): CloudArenaResolvedDeckSource | null {
  if (Object.prototype.hasOwnProperty.call(cloudArenaDeckPresets, deckId)) {
    const preset = getDeckPreset(deckId as CloudArenaDeckPresetId);

    return {
      kind: "preset",
      deckId: preset.id,
      deck: preset,
    };
  }

  const savedDeck = collection.records.find((record) => record.data.id === deckId);

  if (!savedDeck) {
    return null;
  }

  return {
    kind: "saved",
    deckId: savedDeck.data.id,
    deck: cloneCloudArenaSavedDeck(savedDeck.data),
  };
}

export function listCloudArenaCardSummaries(
  query: CloudArenaCardListQuery = {},
): CloudArenaCardSummary[] {
  return getCloudArenaPlayableCardSummaries().filter((summary) =>
    matchesCloudArenaCardQuery(summary, query),
  );
}

export function listCloudArenaDeckSummariesFromCollection(
  collection: CloudArenaSavedDeckCollection = { issues: [], records: [] },
  query: CloudArenaDeckListQuery = {},
): CloudArenaDeckSummary[] {
  const presetDecks = getCloudArenaPresetDeckSummaries();
  const savedDecks = collection.records.map((record) =>
    createCloudArenaDeckSummary(record.data, "saved"),
  );
  const summaries = [...presetDecks, ...savedDecks];

  return summaries.filter((summary) => {
    if (query.kind && summary.kind !== query.kind) {
      return false;
    }

    if (query.containsCardId) {
      const detail = getCloudArenaDeckDetailByIdFromCollection(summary.id, collection);

      if (!detail?.cards.some((entry) => entry.cardId === query.containsCardId)) {
        return false;
      }
    }

    const normalizedQuery = query.q?.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }

    const haystack = [summary.id, summary.name, summary.notes ?? "", ...summary.tags].join(" ").toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function getCloudArenaDeckDetailByIdFromCollection(
  deckId: string,
  collection: CloudArenaSavedDeckCollection = { issues: [], records: [] },
): CloudArenaDeckDetail | null {
  const resolved = resolveCloudArenaDeckSourceFromCollection(deckId, collection);

  if (!resolved) {
    return null;
  }

  return createCloudArenaDeckDetail(resolved.deck, resolved.kind);
}
