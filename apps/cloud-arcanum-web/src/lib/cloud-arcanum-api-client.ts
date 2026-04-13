import type {
  CardDetailQuery,
  CloudArcanumApiContracts,
  CloudArcanumApiQuery,
  EntityValidationRouteParams,
  CardRouteParams,
  DeckRouteParams,
  SetRouteParams,
  SetDetailQuery,
  UniverseRouteParams,
} from "../../../../src/cloud-arcanum/api-contract.js";
import {
  buildCloudArcanumCardDetailPath,
  buildCloudArcanumDeckDetailPath,
  buildCloudArcanumEntityValidationPath,
  buildCloudArcanumSetDetailPath,
  buildCloudArcanumUniverseDetailPath,
  cloudArcanumApiRoutes,
} from "../../../../src/cloud-arcanum/api-contract.js";

import {
  buildCardListQueryString,
  buildDeckListQueryString,
  buildSetDetailQueryString,
  buildSetListQueryString,
  buildUniverseListQueryString,
} from "./query-string.js";
import {
  BaseCloudApiClient,
  type CloudApiClientOptions,
} from "./base-api-client.js";

type CloudArcanumRouteName = keyof CloudArcanumApiContracts;
type CloudArcanumApiResponse<TName extends CloudArcanumRouteName> =
  CloudArcanumApiContracts[TName]["response"];

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

export function createCloudArcanumApiClient(
  options: CloudApiClientOptions,
): CloudArcanumApiClient {
  return new CloudArcanumApiClient(options);
}
