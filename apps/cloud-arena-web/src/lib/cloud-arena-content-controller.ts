import type {
  CloudArenaApiContractName,
  CloudArenaApiContracts,
  CloudArenaCardListQuery,
  CloudArenaDeckListQuery,
  CloudArenaDeckWriteRequest,
} from "../../../../src/cloud-arena/api-contract.js";

import { createCloudArenaApiClient } from "./cloud-arena-api-client.js";
import { createCloudArenaLocalDeckRepository } from "./cloud-arena-local-decks.js";

type CloudArenaApiResponse<TName extends CloudArenaApiContractName> =
  CloudArenaApiContracts[TName]["response"];

export type CloudArenaContentMode = "local" | "remote";

export type CloudArenaContentController = {
  createCloudArenaDeck: (
    body: CloudArenaDeckWriteRequest,
    options?: { signal?: AbortSignal },
  ) => Promise<CloudArenaApiResponse<"cloudArenaDeckDetail">>;
  deleteCloudArenaDeck: (
    deckId: string,
    options?: { signal?: AbortSignal },
  ) => Promise<CloudArenaApiResponse<"cloudArenaDeckDelete">>;
  getCloudArenaDeck: (
    deckId: string,
    options?: { signal?: AbortSignal },
  ) => Promise<CloudArenaApiResponse<"cloudArenaDeckDetail">>;
  listCloudArenaCards: (
    query?: CloudArenaCardListQuery,
    options?: { signal?: AbortSignal },
  ) => Promise<CloudArenaApiResponse<"cloudArenaCards">>;
  listCloudArenaDecks: (
    query?: CloudArenaDeckListQuery,
    options?: { signal?: AbortSignal },
  ) => Promise<CloudArenaApiResponse<"cloudArenaDecks">>;
  updateCloudArenaDeck: (
    deckId: string,
    body: CloudArenaDeckWriteRequest,
    options?: { signal?: AbortSignal },
  ) => Promise<CloudArenaApiResponse<"cloudArenaDeckDetail">>;
};

export type CloudArenaContentControllerOptions = {
  apiBaseUrl: string;
  mode?: CloudArenaContentMode;
};

export function createCloudArenaContentController({
  apiBaseUrl,
  mode = "remote",
}: CloudArenaContentControllerOptions): CloudArenaContentController {
  if (mode === "local") {
    return createCloudArenaLocalDeckRepository();
  }

  return createCloudArenaApiClient({ baseUrl: apiBaseUrl });
}
