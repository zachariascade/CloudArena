import {
  buildCloudArenaSessionActionsPath,
  buildCloudArenaSessionPath,
  buildCloudArenaSessionResetPath,
  buildCloudArcanumCardDetailPath,
  buildCloudArcanumDeckDetailPath,
  buildCloudArcanumEntityValidationPath,
  buildCloudArcanumSetDetailPath,
  buildCloudArcanumUniverseDetailPath,
  type CloudArenaActionRequest,
  type CloudArenaCreateSessionRequest,
  cloudArcanumApiRoutes,
  type ApiErrorResponse,
  type CardDetailQuery,
  type CloudArcanumApiResponse,
  type CloudArcanumApiRouteName,
  type CloudArcanumApiQuery,
  type EntityValidationRouteParams,
  type CardRouteParams,
  type DeckRouteParams,
  type SetRouteParams,
  type SetDetailQuery,
  type UniverseRouteParams,
} from "../../../../src/cloud-arcanum/api-contract.js";

import {
  buildCardListQueryString,
  buildDeckListQueryString,
  buildSetDetailQueryString,
  buildSetListQueryString,
  buildUniverseListQueryString,
} from "./query-string.js";

type CloudArcanumApiClientOptions = {
  baseUrl: string;
  fetchFn?: typeof fetch;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveApiAssetUrls<TValue>(value: TValue, baseUrl: string): TValue {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveApiAssetUrls(entry, baseUrl)) as TValue;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const resolvedEntries = Object.entries(value).map(([key, entryValue]) => {
    if (key === "publicUrl" && typeof entryValue === "string" && entryValue.startsWith("/")) {
      return [key, `${baseUrl}${entryValue}`];
    }

    return [key, resolveApiAssetUrls(entryValue, baseUrl)];
  });

  return Object.fromEntries(resolvedEntries) as TValue;
}

export class CloudArcanumApiClientError extends Error {
  readonly route: CloudArcanumApiRouteName;
  readonly status: number;
  readonly code: string | null;

  constructor(options: {
    code: string | null;
    message: string;
    route: CloudArcanumApiRouteName;
    status: number;
  }) {
    super(options.message);
    this.name = "CloudArcanumApiClientError";
    this.code = options.code;
    this.route = options.route;
    this.status = options.status;
  }
}

async function parseApiError(response: Response): Promise<ApiErrorResponse | null> {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload?.error ? payload : null;
  } catch {
    return null;
  }
}

export class CloudArcanumApiClient {
  readonly #baseUrl: string;
  readonly #fetchFn: typeof fetch;

  constructor(options: CloudArcanumApiClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, "");
    this.#fetchFn =
      options.fetchFn?.bind(globalThis) ?? globalThis.fetch.bind(globalThis);
  }

  async request<TName extends CloudArcanumApiRouteName>(
    route: TName,
    path: string,
    options: {
      body?: unknown;
      method?: "GET" | "POST";
      signal?: AbortSignal;
    } = {},
  ): Promise<CloudArcanumApiResponse<TName>> {
    const headers: Record<string, string> = {
      accept: "application/json",
    };
    const method = options.method ?? "GET";

    if (options.body !== undefined) {
      headers["content-type"] = "application/json";
    }

    const response = await this.#fetchFn(`${this.#baseUrl}${path}`, {
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      headers,
      method,
      signal: options.signal,
    });

    if (!response.ok) {
      const payload = await parseApiError(response);
      throw new CloudArcanumApiClientError({
        code: payload?.error.code ?? null,
        message: payload?.error.message ?? `Request failed with status ${response.status}.`,
        route,
        status: response.status,
      });
    }

    const payload = (await response.json()) as CloudArcanumApiResponse<TName>;
    return resolveApiAssetUrls(payload, this.#baseUrl);
  }

  getHealth(options?: { signal?: AbortSignal }) {
    return this.request("health", cloudArcanumApiRoutes.health, options);
  }

  createCloudArenaSession(
    body: CloudArenaCreateSessionRequest = {},
    options?: { signal?: AbortSignal },
  ) {
    return this.request("cloudArenaSessions", cloudArcanumApiRoutes.cloudArenaSessions, {
      ...options,
      body,
      method: "POST",
    });
  }

  getCloudArenaSession(sessionId: string, options?: { signal?: AbortSignal }) {
    return this.request("cloudArenaSessionDetail", buildCloudArenaSessionPath(sessionId), options);
  }

  applyCloudArenaAction(
    sessionId: string,
    body: CloudArenaActionRequest,
    options?: { signal?: AbortSignal },
  ) {
    return this.request(
      "cloudArenaSessionActions",
      buildCloudArenaSessionActionsPath(sessionId),
      {
        ...options,
        body,
        method: "POST",
      },
    );
  }

  resetCloudArenaSession(sessionId: string, options?: { signal?: AbortSignal }) {
    return this.request(
      "cloudArenaSessionReset",
      buildCloudArenaSessionResetPath(sessionId),
      {
        ...options,
        method: "POST",
      },
    );
  }

  getMetaFilters(options?: { signal?: AbortSignal }) {
    return this.request("metaFilters", cloudArcanumApiRoutes.metaFilters, options);
  }

  countCards(
    query: CloudArcanumApiQuery<"cardsCount"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildCardListQueryString(query);
    const path = search
      ? `${cloudArcanumApiRoutes.cardsCount}?${search}`
      : cloudArcanumApiRoutes.cardsCount;
    return this.request("cardsCount", path, options);
  }

  listCardIds(
    query: CloudArcanumApiQuery<"cardsIds"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildCardListQueryString(query);
    const path = search
      ? `${cloudArcanumApiRoutes.cardsIds}?${search}`
      : cloudArcanumApiRoutes.cardsIds;
    return this.request("cardsIds", path, options);
  }

  listCardSummaries(
    query: CloudArcanumApiQuery<"cardsSummary"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildCardListQueryString(query);
    const path = search
      ? `${cloudArcanumApiRoutes.cardsSummary}?${search}`
      : cloudArcanumApiRoutes.cardsSummary;
    return this.request("cardsSummary", path, options);
  }

  listCards(
    query: CloudArcanumApiQuery<"cards"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildCardListQueryString(query);
    const path = search ? `${cloudArcanumApiRoutes.cards}?${search}` : cloudArcanumApiRoutes.cards;
    return this.request("cards", path, options);
  }

  getCardDetail(params: CardRouteParams, options?: { signal?: AbortSignal }) {
    return this.request("cardDetail", buildCloudArcanumCardDetailPath(params.cardId), options);
  }

  getCardDetailWithQuery(
    params: CardRouteParams,
    query: CardDetailQuery = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildCardListQueryString(query);
    const path = search
      ? `${buildCloudArcanumCardDetailPath(params.cardId)}?${search}`
      : buildCloudArcanumCardDetailPath(params.cardId);
    return this.request("cardDetail", path, options);
  }

  listDecks(
    query: CloudArcanumApiQuery<"decks"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildDeckListQueryString(query);
    const path = search ? `${cloudArcanumApiRoutes.decks}?${search}` : cloudArcanumApiRoutes.decks;
    return this.request("decks", path, options);
  }

  getDeckDetail(params: DeckRouteParams, options?: { signal?: AbortSignal }) {
    return this.request("deckDetail", buildCloudArcanumDeckDetailPath(params.deckId), options);
  }

  listSets(
    query: CloudArcanumApiQuery<"sets"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildSetListQueryString(query);
    const path = search ? `${cloudArcanumApiRoutes.sets}?${search}` : cloudArcanumApiRoutes.sets;
    return this.request("sets", path, options);
  }

  getSetDetail(params: SetRouteParams, options?: { signal?: AbortSignal }) {
    return this.request("setDetail", buildCloudArcanumSetDetailPath(params.setId), options);
  }

  getSetDetailWithQuery(
    params: SetRouteParams,
    query: SetDetailQuery = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildSetDetailQueryString(query);
    const path = search
      ? `${buildCloudArcanumSetDetailPath(params.setId)}?${search}`
      : buildCloudArcanumSetDetailPath(params.setId);
    return this.request("setDetail", path, options);
  }

  listUniverses(
    query: CloudArcanumApiQuery<"universes"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildUniverseListQueryString(query);
    const path = search
      ? `${cloudArcanumApiRoutes.universes}?${search}`
      : cloudArcanumApiRoutes.universes;
    return this.request("universes", path, options);
  }

  getUniverseDetail(params: UniverseRouteParams, options?: { signal?: AbortSignal }) {
    return this.request(
      "universeDetail",
      buildCloudArcanumUniverseDetailPath(params.universeId),
      options,
    );
  }

  getValidationSummary(options?: { signal?: AbortSignal }) {
    return this.request("validationSummary", cloudArcanumApiRoutes.validationSummary, options);
  }

  getEntityValidation(
    params: EntityValidationRouteParams,
    options?: { signal?: AbortSignal },
  ) {
    return this.request(
      "entityValidation",
      buildCloudArcanumEntityValidationPath(params.entityId),
      options,
    );
  }
}

export function createCloudArcanumApiClient(
  options: CloudArcanumApiClientOptions,
): CloudArcanumApiClient {
  return new CloudArcanumApiClient(options);
}
