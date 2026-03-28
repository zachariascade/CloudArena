import type {
  CardListItem,
  CardListQuery,
  CardsListMeta,
  DeckListItem,
  DeckListQuery,
  DecksListMeta,
  SetListItem,
  SetListQuery,
  SetsListMeta,
  SortDirection,
  UniverseListItem,
  UniverseListQuery,
  UniversesListMeta,
} from "../../../../src/cloud-arcanum/api-contract.js";
import type {
  CloudArcanumNormalizedData,
  NormalizedCardRecord,
  NormalizedDeckRecord,
  NormalizedSetRecord,
  NormalizedUniverseRecord,
} from "./index.js";
import {
  buildCardListItem,
  buildDeckListItem,
  buildSetListItem,
  buildUniverseListItem,
} from "./view-models.js";

type PaginatedResult<TItem, TMeta extends { total: number; filtersApplied: Record<string, unknown> }> = {
  data: TItem[];
  meta: TMeta;
};

function normalizeSearchValue(value: string): string {
  return value.trim().toLowerCase();
}

function includesSearchTerm(haystacks: string[], needle: string | undefined): boolean {
  if (!needle) {
    return true;
  }

  const normalizedNeedle = normalizeSearchValue(needle);

  if (!normalizedNeedle) {
    return true;
  }

  return haystacks.some((value) => value.toLowerCase().includes(normalizedNeedle));
}

function applyPagination<TItem>(
  items: TItem[],
  query: { page?: number; pageSize?: number },
): { page?: number; pageSize?: number; items: TItem[] } {
  const page = query.page && query.page > 0 ? query.page : undefined;
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : undefined;

  if (!page || !pageSize) {
    return {
      page,
      pageSize,
      items,
    };
  }

  const startIndex = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    items: items.slice(startIndex, startIndex + pageSize),
  };
}

function compareStrings(left: string, right: string, direction: SortDirection): number {
  return direction === "asc"
    ? left.localeCompare(right)
    : right.localeCompare(left);
}

function compareNumbers(left: number, right: number, direction: SortDirection): number {
  return direction === "asc" ? left - right : right - left;
}

function toCardSearchText(cardRecord: NormalizedCardRecord): string[] {
  return [
    cardRecord.data.name,
    cardRecord.data.slug,
    cardRecord.data.typeLine,
    ...cardRecord.data.tags,
  ];
}

function toDeckSearchText(deckRecord: NormalizedDeckRecord): string[] {
  return [deckRecord.data.name, deckRecord.data.format, ...deckRecord.data.tags];
}

function toSetSearchText(setRecord: NormalizedSetRecord): string[] {
  return [setRecord.data.name, setRecord.data.code];
}

function toUniverseSearchText(universeRecord: NormalizedUniverseRecord): string[] {
  return [universeRecord.data.name, universeRecord.data.description ?? ""];
}

export function queryCards(
  normalized: CloudArcanumNormalizedData,
  query: CardListQuery = {},
): PaginatedResult<CardListItem, CardsListMeta> {
  const filtered = normalized.cards
    .filter((cardRecord) => includesSearchTerm(toCardSearchText(cardRecord), query.q))
    .filter((cardRecord) =>
      query.universeId ? cardRecord.universe?.data.id === query.universeId : true,
    )
    .filter((cardRecord) => (query.setId ? cardRecord.data.setId === query.setId : true))
    .filter((cardRecord) =>
      query.status?.length ? query.status.includes(cardRecord.data.status) : true,
    )
    .filter((cardRecord) =>
      query.color?.length
        ? query.color.every((color) => cardRecord.data.colors.includes(color))
        : true,
    )
    .filter((cardRecord) =>
      query.rarity?.length ? query.rarity.includes(cardRecord.data.rarity!) : true,
    )
    .filter((cardRecord) =>
      query.hasImage === undefined
        ? true
        : query.hasImage
          ? buildCardListItem(normalized, cardRecord).image.isRenderable
          : !buildCardListItem(normalized, cardRecord).image.isRenderable,
    )
    .filter((cardRecord) =>
      query.hasUnresolvedMechanics === undefined
        ? true
        : buildCardListItem(normalized, cardRecord).draft.hasUnresolvedMechanics ===
          query.hasUnresolvedMechanics,
    )
    .filter((cardRecord) =>
      query.deckId ? cardRecord.decks.some(({ deck }) => deck.data.id === query.deckId) : true,
    );

  const sort = query.sort ?? "name";
  const direction = query.direction ?? "asc";
  const sorted = [...filtered].sort((left, right) => {
    switch (sort) {
      case "createdAt":
        return compareStrings(left.data.createdAt, right.data.createdAt, direction);
      case "status":
        return compareStrings(left.data.status, right.data.status, direction);
      case "updatedAt":
        return compareStrings(left.data.updatedAt, right.data.updatedAt, direction);
      case "name":
      default:
        return compareStrings(left.data.name, right.data.name, direction);
    }
  });

  const total = sorted.length;
  const paginated = applyPagination(sorted, query);

  return {
    data: paginated.items.map((cardRecord) => buildCardListItem(normalized, cardRecord)),
    meta: {
      total,
      page: paginated.page,
      pageSize: paginated.pageSize,
      filtersApplied: {
        q: query.q,
        universeId: query.universeId,
        setId: query.setId,
        status: query.status,
        color: query.color,
        rarity: query.rarity,
        hasImage: query.hasImage,
        hasUnresolvedMechanics: query.hasUnresolvedMechanics,
        deckId: query.deckId,
        sort,
        direction,
      },
    },
  };
}

export function queryDecks(
  normalized: CloudArcanumNormalizedData,
  query: DeckListQuery = {},
): PaginatedResult<DeckListItem, DecksListMeta> {
  const filtered = normalized.decks
    .filter((deckRecord) => includesSearchTerm(toDeckSearchText(deckRecord), query.q))
    .filter((deckRecord) =>
      query.universeId ? deckRecord.data.universeId === query.universeId : true,
    )
    .filter((deckRecord) =>
      query.setId ? deckRecord.data.setIds.some((setId) => setId === query.setId) : true,
    )
    .filter((deckRecord) =>
      query.containsCardId
        ? deckRecord.cards.some((entry) => entry.card?.data.id === query.containsCardId)
        : true,
    );

  const sort = query.sort ?? "name";
  const direction = query.direction ?? "asc";
  const sorted = [...filtered].sort((left, right) => {
    switch (sort) {
      case "format":
        return compareStrings(left.data.format, right.data.format, direction);
      case "name":
      default:
        return compareStrings(left.data.name, right.data.name, direction);
    }
  });

  const total = sorted.length;
  const paginated = applyPagination(sorted, query);

  return {
    data: paginated.items.map((deckRecord) => buildDeckListItem(normalized, deckRecord)),
    meta: {
      total,
      page: paginated.page,
      pageSize: paginated.pageSize,
      filtersApplied: {
        q: query.q,
        universeId: query.universeId,
        setId: query.setId,
        containsCardId: query.containsCardId,
        sort,
        direction,
      },
    },
  };
}

export function querySets(
  normalized: CloudArcanumNormalizedData,
  query: SetListQuery = {},
): PaginatedResult<SetListItem, SetsListMeta> {
  const filtered = normalized.sets
    .filter((setRecord) => includesSearchTerm(toSetSearchText(setRecord), query.q))
    .filter((setRecord) =>
      query.universeId ? setRecord.data.universeId === query.universeId : true,
    );

  const sort = query.sort ?? "name";
  const direction = query.direction ?? "asc";
  const sorted = [...filtered].sort((left, right) => {
    switch (sort) {
      case "code":
        return compareStrings(left.data.code, right.data.code, direction);
      case "name":
      default:
        return compareStrings(left.data.name, right.data.name, direction);
    }
  });

  const total = sorted.length;
  const paginated = applyPagination(sorted, query);

  return {
    data: paginated.items.map((setRecord) => buildSetListItem(normalized, setRecord)),
    meta: {
      total,
      page: paginated.page,
      pageSize: paginated.pageSize,
      filtersApplied: {
        q: query.q,
        universeId: query.universeId,
        sort,
        direction,
      },
    },
  };
}

export function queryUniverses(
  normalized: CloudArcanumNormalizedData,
  query: UniverseListQuery = {},
): PaginatedResult<UniverseListItem, UniversesListMeta> {
  const filtered = normalized.universes.filter((universeRecord) =>
    includesSearchTerm(toUniverseSearchText(universeRecord), query.q),
  );

  const sort = query.sort ?? "name";
  const direction = query.direction ?? "asc";
  const sorted = [...filtered].sort((left, right) =>
    compareStrings(left.data.name, right.data.name, direction),
  );

  const total = sorted.length;
  const paginated = applyPagination(sorted, query);

  return {
    data: paginated.items.map((universeRecord) => buildUniverseListItem(universeRecord)),
    meta: {
      total,
      page: paginated.page,
      pageSize: paginated.pageSize,
      filtersApplied: {
        q: query.q,
        sort,
        direction,
      },
    },
  };
}
