import {
  buildCloudArcanumCardDetailPath,
  buildCloudArcanumDeckDetailPath,
  buildCloudArcanumEntityValidationPath,
  buildCloudArcanumSetDetailPath,
  buildCloudArcanumUniverseDetailPath,
  cloudArcanumApiRoutes,
  type ApiErrorResponse,
  type CardDetailQuery,
  type CloudArcanumApiContracts,
  type CloudArcanumApiQuery,
  type EntityValidationRouteParams,
  type CardRouteParams,
  type DeckRouteParams,
  type SetRouteParams,
  type SetDetailQuery,
  type UniverseRouteParams,
} from "../../../../src/cloud-arcanum/api-contract.js";
import {
  buildCloudArenaSessionsPath,
  buildCloudArenaSessionActionsPath,
  buildCloudArenaSessionPath,
  buildCloudArenaSessionResetPath,
  type CloudArenaActionRequest,
  type CloudArenaApiContracts,
  type CloudArenaApiContractName,
  type CloudArenaCreateSessionRequest,
} from "../../../../src/cloud-arena/api-contract.js";

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
  readonly route: CloudApiRouteName;
  readonly status: number;
  readonly code: string | null;

  constructor(options: {
    code: string | null;
    message: string;
    route: CloudApiRouteName;
    status: number;
  }) {
    super(options.message);
    this.name = "CloudArcanumApiClientError";
    this.code = options.code;
    this.route = options.route;
    this.status = options.status;
  }
}

type CloudApiContracts = CloudArcanumApiContracts & CloudArenaApiContracts;
type CloudApiRouteName = keyof CloudApiContracts;
type CloudApiResponse<TName extends CloudApiRouteName> =
  CloudApiContracts[TName]["response"];
type CloudArcanumRouteName = keyof CloudArcanumApiContracts;
type CloudArcanumApiResponse<TName extends CloudArcanumRouteName> =
  CloudArcanumApiContracts[TName]["response"];
type CloudArenaApiResponse<TName extends CloudArenaApiContractName> =
  CloudArenaApiContracts[TName]["response"];

async function parseApiError(response: Response): Promise<ApiErrorResponse | null> {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload?.error ? payload : null;
  } catch {
    return null;
  }
}

class BaseCloudApiClient {
  readonly #baseUrl: string;
  readonly #fetchFn: typeof fetch;

  constructor(options: CloudArcanumApiClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, "");
    this.#fetchFn =
      options.fetchFn?.bind(globalThis) ?? globalThis.fetch.bind(globalThis);
  }

  protected async request<TName extends CloudApiRouteName>(
    route: TName,
    path: string,
    options: {
      body?: unknown;
      method?: "GET" | "POST";
      signal?: AbortSignal;
    } = {},
  ): Promise<CloudApiResponse<TName>> {
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

    const payload = (await response.json()) as CloudApiResponse<TName>;
    return resolveApiAssetUrls(payload, this.#baseUrl);
  }
}

export class CloudArcanumApiClient extends BaseCloudApiClient {
  getHealth(options?: { signal?: AbortSignal }) {
    return this.request("health", cloudArcanumApiRoutes.health, options) as Promise<
      CloudArcanumApiResponse<"health">
    >;
  }

  getMetaFilters(options?: { signal?: AbortSignal }) {
    return this.request("metaFilters", cloudArcanumApiRoutes.metaFilters, options) as Promise<
      CloudArcanumApiResponse<"metaFilters">
    >;
  }

  countCards(
    query: CloudArcanumApiQuery<"cardsCount"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildCardListQueryString(query);
    const path = search
      ? `${cloudArcanumApiRoutes.cardsCount}?${search}`
      : cloudArcanumApiRoutes.cardsCount;
    return this.request("cardsCount", path, options) as Promise<
      CloudArcanumApiResponse<"cardsCount">
    >;
  }

  listCardIds(
    query: CloudArcanumApiQuery<"cardsIds"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildCardListQueryString(query);
    const path = search
      ? `${cloudArcanumApiRoutes.cardsIds}?${search}`
      : cloudArcanumApiRoutes.cardsIds;
    return this.request("cardsIds", path, options) as Promise<
      CloudArcanumApiResponse<"cardsIds">
    >;
  }

  listCardSummaries(
    query: CloudArcanumApiQuery<"cardsSummary"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildCardListQueryString(query);
    const path = search
      ? `${cloudArcanumApiRoutes.cardsSummary}?${search}`
      : cloudArcanumApiRoutes.cardsSummary;
    return this.request("cardsSummary", path, options) as Promise<
      CloudArcanumApiResponse<"cardsSummary">
    >;
  }

  listCards(
    query: CloudArcanumApiQuery<"cards"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildCardListQueryString(query);
    const path = search ? `${cloudArcanumApiRoutes.cards}?${search}` : cloudArcanumApiRoutes.cards;
    return this.request("cards", path, options) as Promise<
      CloudArcanumApiResponse<"cards">
    >;
  }

  getCardDetail(params: CardRouteParams, options?: { signal?: AbortSignal }) {
    return this.request("cardDetail", buildCloudArcanumCardDetailPath(params.cardId), options) as Promise<
      CloudArcanumApiResponse<"cardDetail">
    >;
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
    return this.request("cardDetail", path, options) as Promise<
      CloudArcanumApiResponse<"cardDetail">
    >;
  }

  listDecks(
    query: CloudArcanumApiQuery<"decks"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildDeckListQueryString(query);
    const path = search ? `${cloudArcanumApiRoutes.decks}?${search}` : cloudArcanumApiRoutes.decks;
    return this.request("decks", path, options) as Promise<
      CloudArcanumApiResponse<"decks">
    >;
  }

  getDeckDetail(params: DeckRouteParams, options?: { signal?: AbortSignal }) {
    return this.request("deckDetail", buildCloudArcanumDeckDetailPath(params.deckId), options) as Promise<
      CloudArcanumApiResponse<"deckDetail">
    >;
  }

  listSets(
    query: CloudArcanumApiQuery<"sets"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildSetListQueryString(query);
    const path = search ? `${cloudArcanumApiRoutes.sets}?${search}` : cloudArcanumApiRoutes.sets;
    return this.request("sets", path, options) as Promise<
      CloudArcanumApiResponse<"sets">
    >;
  }

  getSetDetail(params: SetRouteParams, options?: { signal?: AbortSignal }) {
    return this.request("setDetail", buildCloudArcanumSetDetailPath(params.setId), options) as Promise<
      CloudArcanumApiResponse<"setDetail">
    >;
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
    return this.request("setDetail", path, options) as Promise<
      CloudArcanumApiResponse<"setDetail">
    >;
  }

  listUniverses(
    query: CloudArcanumApiQuery<"universes"> = {},
    options?: { signal?: AbortSignal },
  ) {
    const search = buildUniverseListQueryString(query);
    const path = search
      ? `${cloudArcanumApiRoutes.universes}?${search}`
      : cloudArcanumApiRoutes.universes;
    return this.request("universes", path, options) as Promise<
      CloudArcanumApiResponse<"universes">
    >;
  }

  getUniverseDetail(params: UniverseRouteParams, options?: { signal?: AbortSignal }) {
    return this.request(
      "universeDetail",
      buildCloudArcanumUniverseDetailPath(params.universeId),
      options,
    ) as Promise<CloudArcanumApiResponse<"universeDetail">>;
  }

  getValidationSummary(options?: { signal?: AbortSignal }) {
    return this.request("validationSummary", cloudArcanumApiRoutes.validationSummary, options) as Promise<
      CloudArcanumApiResponse<"validationSummary">
    >;
  }

  getEntityValidation(
    params: EntityValidationRouteParams,
    options?: { signal?: AbortSignal },
  ) {
    return this.request(
      "entityValidation",
      buildCloudArcanumEntityValidationPath(params.entityId),
      options,
    ) as Promise<CloudArcanumApiResponse<"entityValidation">>;
  }
}

export class CloudArenaApiClient extends BaseCloudApiClient {
  createCloudArenaSession(
    body: CloudArenaCreateSessionRequest = {},
    options?: { signal?: AbortSignal },
  ) {
    return this.request("cloudArenaSessions", buildCloudArenaSessionsPath(), {
      ...options,
      body,
      method: "POST",
    }) as Promise<CloudArenaApiResponse<"cloudArenaSessions">>;
  }

  getCloudArenaSession(sessionId: string, options?: { signal?: AbortSignal }) {
    return this.request("cloudArenaSessionDetail", buildCloudArenaSessionPath(sessionId), options) as Promise<
      CloudArenaApiResponse<"cloudArenaSessionDetail">
    >;
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
    ) as Promise<CloudArenaApiResponse<"cloudArenaSessionActions">>;
  }

  resetCloudArenaSession(sessionId: string, options?: { signal?: AbortSignal }) {
    return this.request(
      "cloudArenaSessionReset",
      buildCloudArenaSessionResetPath(sessionId),
      {
        ...options,
        method: "POST",
      },
    ) as Promise<CloudArenaApiResponse<"cloudArenaSessionReset">>;
  }
}

export function createCloudArcanumApiClient(
  options: CloudArcanumApiClientOptions,
): CloudArcanumApiClient {
  return new CloudArcanumApiClient(options);
}

export function createCloudArenaApiClient(
  options: CloudArcanumApiClientOptions,
): CloudArenaApiClient {
  return new CloudArenaApiClient(options);
}
