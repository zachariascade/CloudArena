import type {
  CloudArenaActionRequest,
  CloudArenaApiContractName,
  CloudArenaApiContracts,
  CloudArenaCreateSessionRequest,
} from "../../../../src/cloud-arena/api-contract.js";
import {
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
}

export function createCloudArenaApiClient(
  options: CloudApiClientOptions,
): CloudArenaApiClient {
  return new CloudArenaApiClient(options);
}
