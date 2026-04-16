import type {
  CardListQuery,
  CardSortKey,
  DeckListQuery,
  DeckSortKey,
  SetDetailQuery,
  SetListQuery,
  SetSortKey,
  SortDirection,
  UniverseListQuery,
  UniverseSortKey,
} from "../../../../src/cloud-arcanum/api-contract.js";
import type {
  CardColor,
  CardRarity,
  CardStatus,
} from "../../../../src/domain/index.js";

type PrimitiveQueryValue = boolean | number | string;
type QueryValue = PrimitiveQueryValue | PrimitiveQueryValue[] | undefined;
type QueryShape = Record<string, QueryValue>;

export type PrintablePaperSize = "letter" | "a4";
export type PrintableOrientation = "auto" | "portrait" | "landscape";
export type PrintableFitMode = "tight" | "safe" | "calibration";

export type PrintableCardsPageQuery = CardListQuery & {
  cardsPerPage?: number;
  fit?: PrintableFitMode;
  orientation?: PrintableOrientation;
  paperSize?: PrintablePaperSize;
  showCropMarks?: boolean;
};

function appendQueryValue(searchParams: URLSearchParams, key: string, value: QueryValue): void {
  if (value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      searchParams.append(key, String(item));
    }
    return;
  }

  searchParams.set(key, String(value));
}

function buildQueryString(query: QueryShape): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    appendQueryValue(searchParams, key, value);
  }

  return searchParams.toString();
}

function parseString(searchParams: URLSearchParams, key: string): string | undefined {
  const value = searchParams.get(key);
  return value && value.length > 0 ? value : undefined;
}

function parseNumber(searchParams: URLSearchParams, key: string): number | undefined {
  const value = parseString(searchParams, key);
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parsePositiveInteger(searchParams: URLSearchParams, key: string): number | undefined {
  const parsed = parseNumber(searchParams, key);
  return parsed && Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function parseBoolean(searchParams: URLSearchParams, key: string): boolean | undefined {
  const value = parseString(searchParams, key);

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

function parseStringList<TValue extends string>(
  searchParams: URLSearchParams,
  key: string,
): TValue[] | undefined {
  const values = searchParams.getAll(key).filter((value) => value.length > 0);
  return values.length > 0 ? (values as TValue[]) : undefined;
}

function parseSortDirection(searchParams: URLSearchParams): SortDirection | undefined {
  const direction = parseString(searchParams, "direction");
  return direction === "asc" || direction === "desc" ? direction : undefined;
}

export function buildCardListQueryString(query: CardListQuery): string {
  return buildQueryString(query);
}

export function buildCardsPagePath(query: CardListQuery): string {
  const queryString = buildCardListQueryString(query);
  return queryString.length > 0 ? `/cards?${queryString}` : "/cards";
}

export function parseCardListQuery(searchParams: URLSearchParams): CardListQuery {
  return {
    color: parseStringList<CardColor>(searchParams, "color"),
    deckId: parseString(searchParams, "deckId"),
    direction: parseSortDirection(searchParams),
    hasImage: parseBoolean(searchParams, "hasImage"),
    hasUnresolvedMechanics: parseBoolean(searchParams, "hasUnresolvedMechanics"),
    page: parseNumber(searchParams, "page"),
    pageSize: parseNumber(searchParams, "pageSize"),
    q: parseString(searchParams, "q"),
    rarity: parseStringList<CardRarity>(searchParams, "rarity"),
    setId: parseString(searchParams, "setId"),
    sort: parseString(searchParams, "sort") as CardSortKey | undefined,
    status: parseStringList<CardStatus>(searchParams, "status"),
    themeId: parseString(searchParams, "themeId"),
    universeId: parseString(searchParams, "universeId"),
  };
}

export function buildDeckListQueryString(query: DeckListQuery): string {
  return buildQueryString(query);
}

export function parseDeckListQuery(searchParams: URLSearchParams): DeckListQuery {
  return {
    containsCardId: parseString(searchParams, "containsCardId"),
    direction: parseSortDirection(searchParams),
    page: parseNumber(searchParams, "page"),
    pageSize: parseNumber(searchParams, "pageSize"),
    q: parseString(searchParams, "q"),
    setId: parseString(searchParams, "setId"),
    sort: parseString(searchParams, "sort") as DeckSortKey | undefined,
    universeId: parseString(searchParams, "universeId"),
  };
}

export function buildSetListQueryString(query: SetListQuery): string {
  return buildQueryString(query);
}

export function buildSetDetailQueryString(query: SetDetailQuery): string {
  return buildQueryString(query);
}

export function parseSetListQuery(searchParams: URLSearchParams): SetListQuery {
  return {
    direction: parseSortDirection(searchParams),
    page: parseNumber(searchParams, "page"),
    pageSize: parseNumber(searchParams, "pageSize"),
    q: parseString(searchParams, "q"),
    sort: parseString(searchParams, "sort") as SetSortKey | undefined,
    universeId: parseString(searchParams, "universeId"),
  };
}

export function buildUniverseListQueryString(query: UniverseListQuery): string {
  return buildQueryString(query);
}

export function parseUniverseListQuery(searchParams: URLSearchParams): UniverseListQuery {
  return {
    direction: parseSortDirection(searchParams),
    page: parseNumber(searchParams, "page"),
    pageSize: parseNumber(searchParams, "pageSize"),
    q: parseString(searchParams, "q"),
    sort: parseString(searchParams, "sort") as UniverseSortKey | undefined,
  };
}

export function buildPrintableCardsPageQueryString(query: PrintableCardsPageQuery): string {
  return buildQueryString(query);
}

export function buildPrintableCardsPagePath(query: PrintableCardsPageQuery): string {
  const queryString = buildPrintableCardsPageQueryString(query);
  return queryString.length > 0 ? `/cards/print?${queryString}` : "/cards/print";
}

export function parsePrintableCardsPageQuery(searchParams: URLSearchParams): PrintableCardsPageQuery {
  return {
    ...parseCardListQuery(searchParams),
    cardsPerPage: parsePositiveInteger(searchParams, "cardsPerPage"),
    fit: parseString(searchParams, "fit") as PrintableFitMode | undefined,
    orientation: parseString(searchParams, "orientation") as PrintableOrientation | undefined,
    paperSize: parseString(searchParams, "paperSize") as PrintablePaperSize | undefined,
    showCropMarks: parseBoolean(searchParams, "showCropMarks"),
  };
}
