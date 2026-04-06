import type {
  CardColor,
  CardId,
  DeckId,
  ImagePrompt,
  ImageReference,
  CardRarity,
  CardStatus,
  SetId,
  SetTheme,
  ThemeId,
  UniverseId,
} from "../domain/index.js";
import type {
  BattleAction,
  BattleEvent,
  BattlePhase,
  CardDefinitionId,
  EnemyIntent,
  PermanentActionDefinition,
} from "../cloud-arena/index.js";

export const cloudArcanumApiRoutes = {
  health: "/api/health",
  metaFilters: "/api/meta/filters",
  cards: "/api/cards",
  cardsCount: "/api/cards/count",
  cardsIds: "/api/cards/ids",
  cardsSummary: "/api/cards/summary",
  cardDetail: "/api/cards/:cardId",
  decks: "/api/decks",
  deckDetail: "/api/decks/:deckId",
  sets: "/api/sets",
  setDetail: "/api/sets/:setId",
  universes: "/api/universes",
  universeDetail: "/api/universes/:universeId",
  validationSummary: "/api/validation/summary",
  entityValidation: "/api/validation/entities/:entityId",
  cloudArenaSessions: "/api/cloud-arena/sessions",
  cloudArenaSessionDetail: "/api/cloud-arena/sessions/:sessionId",
  cloudArenaSessionActions: "/api/cloud-arena/sessions/:sessionId/actions",
  cloudArenaSessionReset: "/api/cloud-arena/sessions/:sessionId/reset",
} as const;

export type CloudArcanumApiRouteName = keyof typeof cloudArcanumApiRoutes;
export type CloudArcanumApiRoutePath =
  (typeof cloudArcanumApiRoutes)[CloudArcanumApiRouteName];

export type SortDirection = "asc" | "desc";
export type CardQueryMode = "full" | "summary" | "ids" | "count";

export type CanonicalEntityId = CardId | DeckId | SetId | UniverseId;

export type CardRouteParams = {
  cardId: CardId;
};

export type CardDetailQuery = {
  themeId?: ThemeId;
};

export type DeckRouteParams = {
  deckId: DeckId;
};

export type SetRouteParams = {
  setId: SetId;
};

export type SetDetailQuery = {
  themeId?: ThemeId;
};

export type UniverseRouteParams = {
  universeId: UniverseId;
};

export type EntityValidationRouteParams = {
  entityId: CanonicalEntityId;
};

export type CloudArenaSessionRouteParams = {
  sessionId: string;
};

export type CloudArcanumRouteParams = {
  cardDetail: CardRouteParams;
  deckDetail: DeckRouteParams;
  setDetail: SetRouteParams;
  universeDetail: UniverseRouteParams;
  entityValidation: EntityValidationRouteParams;
  cloudArenaSessionDetail: CloudArenaSessionRouteParams;
  cloudArenaSessionActions: CloudArenaSessionRouteParams;
  cloudArenaSessionReset: CloudArenaSessionRouteParams;
};

export type EntityReference = {
  id: string;
  name: string;
};

export type ValidationMessage = {
  file?: string;
  message: string;
};

export type SetThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string | null;
};

export type ValidationSummary = {
  hasErrors: boolean;
  errorCount: number;
};

export type ApiError = {
  code:
    | "not_found"
    | "invalid_query"
    | "invalid_request"
    | "validation_unavailable"
    | "internal_error";
  message: string;
};

export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiListResponse<TData, TMeta extends Record<string, unknown>> = {
  data: TData[];
  meta: TMeta;
};

export type ApiErrorResponse = {
  error: ApiError;
};

export type ImagePreview = {
  kind: ImageReference["type"] | "missing";
  sourcePath: string | null;
  publicUrl: string | null;
  isRenderable: boolean;
  alt: string;
  artist: string | null;
  sourceUrl: string | null;
  license: string | null;
  creditText: string | null;
  sourceNotes: string | null;
  requestedThemeId: ThemeId | null;
  resolvedThemeId: ThemeId | null;
  fellBack: boolean;
};

export type DraftReviewLabel =
  | "Draft"
  | "Templating"
  | "Needs review"
  | "Ready for review"
  | "Approved";

export type DraftStatusSummary = {
  status: CardStatus;
  isDraftLike: boolean;
  hasUnresolvedMechanics: boolean;
  unresolvedFields: string[];
  reviewLabel: DraftReviewLabel;
};

export type CountsByStatus = Partial<Record<CardStatus, number>>;

export type CardSortKey = "name" | "updatedAt" | "createdAt" | "status";
export type SetSortKey = "name" | "code";
export type DeckSortKey = "name" | "format";
export type UniverseSortKey = "name";

export type PaginationQuery = {
  page?: number;
  pageSize?: number;
};

export type CardListQuery = PaginationQuery & {
  q?: string;
  universeId?: string;
  setId?: string;
  themeId?: ThemeId;
  status?: CardStatus[];
  color?: CardColor[];
  rarity?: CardRarity[];
  hasImage?: boolean;
  hasUnresolvedMechanics?: boolean;
  deckId?: string;
  sort?: CardSortKey;
  direction?: SortDirection;
};

export type CardIdListItem = {
  id: string;
};

export type DeckListQuery = PaginationQuery & {
  q?: string;
  universeId?: string;
  setId?: string;
  containsCardId?: string;
  sort?: DeckSortKey;
  direction?: SortDirection;
};

export type SetListQuery = PaginationQuery & {
  q?: string;
  universeId?: string;
  sort?: SetSortKey;
  direction?: SortDirection;
};

export type UniverseListQuery = PaginationQuery & {
  q?: string;
  sort?: UniverseSortKey;
  direction?: SortDirection;
};

export type CloudArenaSessionScenarioId = "mixed_guardian";

export type CloudArenaCreateSessionRequest = {
  scenarioId?: CloudArenaSessionScenarioId;
  seed?: number;
};

export type CloudArenaActionRequest = {
  action: BattleAction;
};

export type CloudArenaCardSnapshot = {
  instanceId: string;
  definitionId: CardDefinitionId;
  name: string;
  cost: number;
  effectSummary: string;
};

export type CloudArenaPermanentSnapshot = {
  instanceId: string;
  sourceCardInstanceId: string;
  definitionId: CardDefinitionId;
  name: string;
  health: number;
  maxHealth: number;
  block: number;
  hasActedThisTurn: boolean;
  isDefending: boolean;
  slotIndex: number;
  actions: PermanentActionDefinition[];
};

export type CloudArenaActionOption = {
  action: BattleAction;
  label: string;
  source: "hand" | "battlefield" | "turn";
};

export type CloudArenaSessionSnapshot = {
  sessionId: string;
  scenarioId: CloudArenaSessionScenarioId;
  status: "active" | "finished";
  turnNumber: number;
  phase: BattlePhase;
  seed: number;
  player: {
    health: number;
    maxHealth: number;
    block: number;
    energy: number;
    hand: CloudArenaCardSnapshot[];
    drawPileCount: number;
    discardPile: CloudArenaCardSnapshot[];
    graveyard: CloudArenaCardSnapshot[];
  };
  enemy: {
    name: string;
    health: number;
    maxHealth: number;
    block: number;
    intent: EnemyIntent;
    intentLabel: string;
  };
  battlefield: Array<CloudArenaPermanentSnapshot | null>;
  blockingQueue: string[];
  legalActions: CloudArenaActionOption[];
  log: BattleEvent[];
};

export type CardsListMeta = {
  total: number;
  page?: number;
  pageSize?: number;
  filtersApplied: Record<string, unknown>;
};

export type DecksListMeta = {
  total: number;
  page?: number;
  pageSize?: number;
  filtersApplied: Record<string, unknown>;
};

export type SetsListMeta = {
  total: number;
  page?: number;
  pageSize?: number;
  filtersApplied: Record<string, unknown>;
};

export type UniversesListMeta = {
  total: number;
  page?: number;
  pageSize?: number;
  filtersApplied: Record<string, unknown>;
};

export type CardListItem = {
  id: string;
  name: string;
  title: string | null;
  slug: string;
  typeLine: string;
  manaCost: string | null;
  manaValue: number | null;
  colors: CardColor[];
  colorIdentity: CardColor[];
  rarity: CardRarity | null;
  status: CardStatus;
  oracleText: string | null;
  flavorText: string | null;
  power: string | null;
  toughness: string | null;
  loyalty: string | null;
  defense: string | null;
  artist: string | null;
  set: EntityReference;
  setCode: string | null;
  universe: EntityReference;
  image: ImagePreview;
  imageThemes: ThemeId[];
  draft: DraftStatusSummary;
  validation: ValidationSummary;
  tags: string[];
  updatedAt: string;
};

export type CardSummaryItem = {
  id: string;
  name: string;
  title: string | null;
  slug: string;
  typeLine: string;
  colors: CardColor[];
  rarity: CardRarity | null;
  status: CardStatus;
  set: EntityReference;
  setCode: string | null;
  universe: EntityReference;
  tags: string[];
  hasImage: boolean;
  hasUnresolvedMechanics: boolean;
  updatedAt: string;
};

export type CardDeckUsage = {
  id: string;
  name: string;
  title: string | null;
  quantity: number;
};

export type CardDetail = {
  id: string;
  name: string;
  title: string | null;
  slug: string;
  setId: string;
  typeLine: string;
  manaCost: string | null;
  manaValue: number | null;
  colors: CardColor[];
  colorIdentity: CardColor[];
  rarity: CardRarity | null;
  oracleText: string | null;
  flavorText: string | null;
  power: string | null;
  toughness: string | null;
  loyalty: string | null;
  defense: string | null;
  artist: string | null;
  mechanics: string[];
  tags: string[];
  imagePrompt: ImagePrompt | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  image: ImagePreview;
  imageThemes: ThemeId[];
  draft: DraftStatusSummary;
  validation: ValidationSummary;
  set: {
    id: string;
    name: string;
    code: string;
  };
  universe: EntityReference;
  decks: CardDeckUsage[];
};

export type DeckListItem = {
  id: string;
  name: string;
  format: string;
  universe: EntityReference;
  setCount: number;
  cardCount: number;
  uniqueCardCount: number;
  commander: (EntityReference & { title: string | null }) | null;
  tags: string[];
  validation: ValidationSummary;
};

export type DeckDetailCard = {
  quantity: number;
  card: {
    id: string;
    name: string;
    title: string | null;
    typeLine: string;
    manaCost: string | null;
    manaValue: number | null;
    status: CardStatus;
    image: ImagePreview;
    draft: DraftStatusSummary;
    set: EntityReference;
  };
};

export type DeckDetail = {
  id: string;
  name: string;
  format: string;
  notes: string | null;
  tags: string[];
  universe: EntityReference;
  sets: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  commander: {
    id: string;
    name: string;
    title: string | null;
    image: ImagePreview;
  } | null;
  cards: DeckDetailCard[];
  summary: {
    totalCards: number;
    uniqueCards: number;
    byStatus: CountsByStatus;
    bySet: Array<{
      set: EntityReference;
      count: number;
    }>;
  };
  validation: ValidationSummary;
};

export type SetListItem = {
  id: string;
  name: string;
  code: string;
  universe: EntityReference;
  description: string | null;
  themes: SetThemeDefinition[];
  defaultThemeId: ThemeId | null;
  activeThemeId: ThemeId | null;
  cardCount: number;
  countsByStatus: CountsByStatus;
};

export type SetDetail = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  universe: EntityReference;
  themes: SetThemeDefinition[];
  defaultThemeId: ThemeId | null;
  activeThemeId: ThemeId | null;
  requestedThemeId: ThemeId | null;
  resolvedThemeId: ThemeId | null;
  cardCount: number;
  countsByStatus: CountsByStatus;
  featuredCards: Array<{
    id: string;
    name: string;
    title: string | null;
    status: CardStatus;
    image: ImagePreview;
  }>;
};

export type UniverseListItem = {
  id: string;
  name: string;
  description: string | null;
  setCount: number;
  cardCount: number;
  deckCount: number;
};

export type UniverseDetail = {
  id: string;
  name: string;
  description: string | null;
  counts: {
    sets: number;
    cards: number;
    decks: number;
  };
  sets: Array<{
    id: string;
    name: string;
    code: string;
    cardCount: number;
  }>;
  decks: Array<{
    id: string;
    name: string;
    format: string;
    cardCount: number;
  }>;
};

export type FilterMetadata = {
  statuses: CardStatus[];
  colors: CardColor[];
  rarities: CardRarity[];
  universes: EntityReference[];
  sets: Array<{
    id: string;
    name: string;
    code: string;
    universeId: string;
  }>;
  decks: EntityReference[];
};

export type ValidationSummaryResponse = {
  counts: {
    universes: number;
    sets: number;
    cards: number;
    decks: number;
    totalFiles: number;
  };
  errors: ValidationMessage[];
};

export type CardsCountResponse = {
  total: number;
  filtersApplied: Record<string, unknown>;
};

export type EntityValidationResponse = {
  entityId: string;
  hasErrors: boolean;
  errors: ValidationMessage[];
};

export type HealthResponse = {
  ok: true;
};

export type CloudArcanumApiContracts = {
  health: {
    route: typeof cloudArcanumApiRoutes.health;
    query: undefined;
    params: undefined;
    response: ApiSuccessResponse<HealthResponse>;
  };
  metaFilters: {
    route: typeof cloudArcanumApiRoutes.metaFilters;
    query: undefined;
    params: undefined;
    response: ApiSuccessResponse<FilterMetadata>;
  };
  cards: {
    route: typeof cloudArcanumApiRoutes.cards;
    query: CardListQuery;
    params: undefined;
    response: ApiListResponse<CardListItem, CardsListMeta>;
  };
  cardsCount: {
    route: typeof cloudArcanumApiRoutes.cardsCount;
    query: CardListQuery;
    params: undefined;
    response: ApiSuccessResponse<CardsCountResponse>;
  };
  cardsIds: {
    route: typeof cloudArcanumApiRoutes.cardsIds;
    query: CardListQuery;
    params: undefined;
    response: ApiListResponse<CardIdListItem, CardsListMeta>;
  };
  cardsSummary: {
    route: typeof cloudArcanumApiRoutes.cardsSummary;
    query: CardListQuery;
    params: undefined;
    response: ApiListResponse<CardSummaryItem, CardsListMeta>;
  };
  cardDetail: {
    route: typeof cloudArcanumApiRoutes.cardDetail;
    query: CardDetailQuery;
    params: CardRouteParams;
    response: ApiSuccessResponse<CardDetail>;
  };
  decks: {
    route: typeof cloudArcanumApiRoutes.decks;
    query: DeckListQuery;
    params: undefined;
    response: ApiListResponse<DeckListItem, DecksListMeta>;
  };
  deckDetail: {
    route: typeof cloudArcanumApiRoutes.deckDetail;
    query: undefined;
    params: DeckRouteParams;
    response: ApiSuccessResponse<DeckDetail>;
  };
  sets: {
    route: typeof cloudArcanumApiRoutes.sets;
    query: SetListQuery;
    params: undefined;
    response: ApiListResponse<SetListItem, SetsListMeta>;
  };
  setDetail: {
    route: typeof cloudArcanumApiRoutes.setDetail;
    query: SetDetailQuery;
    params: SetRouteParams;
    response: ApiSuccessResponse<SetDetail>;
  };
  universes: {
    route: typeof cloudArcanumApiRoutes.universes;
    query: UniverseListQuery;
    params: undefined;
    response: ApiListResponse<UniverseListItem, UniversesListMeta>;
  };
  universeDetail: {
    route: typeof cloudArcanumApiRoutes.universeDetail;
    query: undefined;
    params: UniverseRouteParams;
    response: ApiSuccessResponse<UniverseDetail>;
  };
  validationSummary: {
    route: typeof cloudArcanumApiRoutes.validationSummary;
    query: undefined;
    params: undefined;
    response: ApiSuccessResponse<ValidationSummaryResponse>;
  };
  entityValidation: {
    route: typeof cloudArcanumApiRoutes.entityValidation;
    query: undefined;
    params: EntityValidationRouteParams;
    response: ApiSuccessResponse<EntityValidationResponse>;
  };
  cloudArenaSessions: {
    route: typeof cloudArcanumApiRoutes.cloudArenaSessions;
    query: undefined;
    params: undefined;
    response: ApiSuccessResponse<CloudArenaSessionSnapshot>;
  };
  cloudArenaSessionDetail: {
    route: typeof cloudArcanumApiRoutes.cloudArenaSessionDetail;
    query: undefined;
    params: CloudArenaSessionRouteParams;
    response: ApiSuccessResponse<CloudArenaSessionSnapshot>;
  };
  cloudArenaSessionActions: {
    route: typeof cloudArcanumApiRoutes.cloudArenaSessionActions;
    query: undefined;
    params: CloudArenaSessionRouteParams;
    response: ApiSuccessResponse<CloudArenaSessionSnapshot>;
  };
  cloudArenaSessionReset: {
    route: typeof cloudArcanumApiRoutes.cloudArenaSessionReset;
    query: undefined;
    params: CloudArenaSessionRouteParams;
    response: ApiSuccessResponse<CloudArenaSessionSnapshot>;
  };
};

export type CloudArcanumApiContractName = keyof CloudArcanumApiContracts;

export type CloudArcanumApiQuery<TName extends CloudArcanumApiContractName> =
  CloudArcanumApiContracts[TName]["query"];

export type CloudArcanumApiParams<TName extends CloudArcanumApiContractName> =
  CloudArcanumApiContracts[TName]["params"];

export type CloudArcanumApiResponse<TName extends CloudArcanumApiContractName> =
  CloudArcanumApiContracts[TName]["response"];

export function buildCloudArcanumCardDetailPath(cardId: CardId): string {
  return `/api/cards/${cardId}`;
}

export function buildCloudArcanumDeckDetailPath(deckId: DeckId): string {
  return `/api/decks/${deckId}`;
}

export function buildCloudArcanumSetDetailPath(setId: SetId): string {
  return `/api/sets/${setId}`;
}

export function buildCloudArcanumUniverseDetailPath(
  universeId: UniverseId,
): string {
  return `/api/universes/${universeId}`;
}

export function buildCloudArcanumEntityValidationPath(
  entityId: CanonicalEntityId,
): string {
  return `/api/validation/entities/${entityId}`;
}

export function buildCloudArenaSessionPath(sessionId: string): string {
  return `/api/cloud-arena/sessions/${sessionId}`;
}

export function buildCloudArenaSessionActionsPath(sessionId: string): string {
  return `/api/cloud-arena/sessions/${sessionId}/actions`;
}

export function buildCloudArenaSessionResetPath(sessionId: string): string {
  return `/api/cloud-arena/sessions/${sessionId}/reset`;
}
