import type {
  CloudArenaCardListQuery,
  CloudArenaActionRequest,
  CloudArenaApiContractName,
  CloudArenaApiContracts,
  CloudArenaCreateSessionRequest,
  CloudArenaDeckListQuery,
  CloudArenaDeckWriteRequest,
} from "../../../../src/cloud-arena/api-contract.js";
import {
  buildCloudArenaCardsPath,
  buildCloudArenaDeckPath,
  buildCloudArenaDecksPath,
  buildCloudArenaSessionActionsPath,
  buildCloudArenaSessionPath,
  buildCloudArenaSessionResetPath,
  buildCloudArenaSessionsPath,
} from "../../../../src/cloud-arena/api-contract.js";

import {
  BaseCloudApiClient,
  type CloudApiClientOptions,
} from "./base-api-client.js";

type CloudArenaApiResponse<TName extends CloudArenaApiContractName> =
  CloudArenaApiContracts[TName]["response"];

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

  listCloudArenaCards(query: CloudArenaCardListQuery = {}, options?: { signal?: AbortSignal }) {
    const search = new URLSearchParams();

    if (query.q) {
      search.set("q", query.q);
    }

    if (query.cardType) {
      search.set("cardType", query.cardType);
    }

    if (query.availabilityStatus) {
      search.set("availabilityStatus", query.availabilityStatus);
    }

    const path = search.toString() ? `${buildCloudArenaCardsPath()}?${search.toString()}` : buildCloudArenaCardsPath();

    return this.request("cloudArenaCards", path, options) as Promise<CloudArenaApiResponse<"cloudArenaCards">>;
  }

  listCloudArenaDecks(query: CloudArenaDeckListQuery = {}, options?: { signal?: AbortSignal }) {
    const search = new URLSearchParams();

    if (query.q) {
      search.set("q", query.q);
    }

    if (query.kind) {
      search.set("kind", query.kind);
    }

    if (query.containsCardId) {
      search.set("containsCardId", query.containsCardId);
    }

    const path = search.toString() ? `${buildCloudArenaDecksPath()}?${search.toString()}` : buildCloudArenaDecksPath();

    return this.request("cloudArenaDecks", path, options) as Promise<CloudArenaApiResponse<"cloudArenaDecks">>;
  }

  getCloudArenaDeck(deckId: string, options?: { signal?: AbortSignal }) {
    return this.request("cloudArenaDeckDetail", buildCloudArenaDeckPath(deckId), options) as Promise<
      CloudArenaApiResponse<"cloudArenaDeckDetail">
    >;
  }

  createCloudArenaDeck(body: CloudArenaDeckWriteRequest, options?: { signal?: AbortSignal }) {
    return this.request("cloudArenaDecks", buildCloudArenaDecksPath(), {
      ...options,
      body,
      method: "POST",
    }) as unknown as Promise<CloudArenaApiResponse<"cloudArenaDeckDetail">>;
  }

  updateCloudArenaDeck(deckId: string, body: CloudArenaDeckWriteRequest, options?: { signal?: AbortSignal }) {
    return this.request("cloudArenaDeckDetail", buildCloudArenaDeckPath(deckId), {
      ...options,
      body,
      method: "PUT",
    }) as unknown as Promise<CloudArenaApiResponse<"cloudArenaDeckDetail">>;
  }

  deleteCloudArenaDeck(deckId: string, options?: { signal?: AbortSignal }) {
    return this.request("cloudArenaDeckDelete", buildCloudArenaDeckPath(deckId), {
      ...options,
      method: "DELETE",
    }) as unknown as Promise<CloudArenaApiResponse<"cloudArenaDeckDelete">>;
  }
}

export function createCloudArenaApiClient(
  options: CloudApiClientOptions,
): CloudArenaApiClient {
  return new CloudArenaApiClient(options);
}
