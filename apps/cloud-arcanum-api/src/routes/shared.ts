import type {
  CardListQuery,
  CardSortKey,
  DeckListQuery,
  DeckSortKey,
  SetListQuery,
  SetSortKey,
  SortDirection,
  UniverseListQuery,
  UniverseSortKey,
} from "../../../../src/cloud-arcanum/api-contract.js";

type RawQueryValue = string | string[] | undefined;
type RawQueryRecord = Record<string, RawQueryValue>;

function firstQueryValue(value: RawQueryValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeArrayQuery(value: RawQueryValue): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const values = (Array.isArray(value) ? value : [value])
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
}

function parseBoolean(value: RawQueryValue): boolean | undefined {
  const normalized = firstQueryValue(value);

  if (normalized === undefined) {
    return undefined;
  }

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  throw new Error(`Invalid boolean value "${normalized}". Use true or false.`);
}

function parsePositiveInteger(value: RawQueryValue, label: string): number | undefined {
  const normalized = firstQueryValue(value);

  if (normalized === undefined) {
    return undefined;
  }

  const parsed = Number(normalized);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }

  return parsed;
}

function parseEnum<TValue extends string>(
  value: RawQueryValue,
  allowed: readonly TValue[],
  label: string,
): TValue | undefined {
  const normalized = firstQueryValue(value);

  if (normalized === undefined) {
    return undefined;
  }

  if (!allowed.includes(normalized as TValue)) {
    throw new Error(`${label} must be one of: ${allowed.join(", ")}.`);
  }

  return normalized as TValue;
}

function parseEnumArray<TValue extends string>(
  value: RawQueryValue,
  allowed: readonly TValue[],
  label: string,
): TValue[] | undefined {
  const values = normalizeArrayQuery(value);

  if (!values) {
    return undefined;
  }

  for (const entry of values) {
    if (!allowed.includes(entry as TValue)) {
      throw new Error(`${label} must contain only: ${allowed.join(", ")}.`);
    }
  }

  return values as TValue[];
}

function parseBaseQuery(rawQuery: RawQueryRecord): { page?: number; pageSize?: number } {
  return {
    page: parsePositiveInteger(rawQuery.page, "page"),
    pageSize: parsePositiveInteger(rawQuery.pageSize, "pageSize"),
  };
}

export function parseCardListQuery(rawQuery: RawQueryRecord): CardListQuery {
  const cardSortKeys = ["name", "updatedAt", "createdAt", "status"] as const satisfies readonly CardSortKey[];
  const sortDirections = ["asc", "desc"] as const satisfies readonly SortDirection[];
  const statuses = ["draft", "templating", "balanced", "approved"] as const;
  const colors = ["W", "U", "B", "R", "G", "C"] as const;
  const rarities = ["common", "uncommon", "rare", "mythic", "special", "bonus"] as const;

  return {
    ...parseBaseQuery(rawQuery),
    q: firstQueryValue(rawQuery.q),
    universeId: firstQueryValue(rawQuery.universeId),
    setId: firstQueryValue(rawQuery.setId),
    themeId: firstQueryValue(rawQuery.themeId),
    status: parseEnumArray(rawQuery.status, statuses, "status"),
    color: parseEnumArray(rawQuery.color, colors, "color"),
    rarity: parseEnumArray(rawQuery.rarity, rarities, "rarity"),
    hasImage: parseBoolean(rawQuery.hasImage),
    hasUnresolvedMechanics: parseBoolean(rawQuery.hasUnresolvedMechanics),
    deckId: firstQueryValue(rawQuery.deckId),
    sort: parseEnum(rawQuery.sort, cardSortKeys, "sort"),
    direction: parseEnum(rawQuery.direction, sortDirections, "direction"),
  };
}

export function parseDeckListQuery(rawQuery: RawQueryRecord): DeckListQuery {
  const deckSortKeys = ["name", "format"] as const satisfies readonly DeckSortKey[];
  const sortDirections = ["asc", "desc"] as const satisfies readonly SortDirection[];

  return {
    ...parseBaseQuery(rawQuery),
    q: firstQueryValue(rawQuery.q),
    universeId: firstQueryValue(rawQuery.universeId),
    setId: firstQueryValue(rawQuery.setId),
    containsCardId: firstQueryValue(rawQuery.containsCardId),
    sort: parseEnum(rawQuery.sort, deckSortKeys, "sort"),
    direction: parseEnum(rawQuery.direction, sortDirections, "direction"),
  };
}

export function parseSetListQuery(rawQuery: RawQueryRecord): SetListQuery {
  const setSortKeys = ["name", "code"] as const satisfies readonly SetSortKey[];
  const sortDirections = ["asc", "desc"] as const satisfies readonly SortDirection[];

  return {
    ...parseBaseQuery(rawQuery),
    q: firstQueryValue(rawQuery.q),
    universeId: firstQueryValue(rawQuery.universeId),
    sort: parseEnum(rawQuery.sort, setSortKeys, "sort"),
    direction: parseEnum(rawQuery.direction, sortDirections, "direction"),
  };
}

export function parseUniverseListQuery(rawQuery: RawQueryRecord): UniverseListQuery {
  const universeSortKeys = ["name"] as const satisfies readonly UniverseSortKey[];
  const sortDirections = ["asc", "desc"] as const satisfies readonly SortDirection[];

  return {
    ...parseBaseQuery(rawQuery),
    q: firstQueryValue(rawQuery.q),
    sort: parseEnum(rawQuery.sort, universeSortKeys, "sort"),
    direction: parseEnum(rawQuery.direction, sortDirections, "direction"),
  };
}

export function getInvalidQueryErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Invalid query.";
}
