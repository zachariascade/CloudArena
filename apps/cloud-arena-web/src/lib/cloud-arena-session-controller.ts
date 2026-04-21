import type {
  CloudArenaActionRequest,
  CloudArenaApiContractName,
  CloudArenaApiContracts,
  CloudArenaCreateSessionRequest,
} from "../../../../src/cloud-arena/api-contract.js";

import { createCloudArenaApiClient } from "./cloud-arena-api-client.js";
import {
  createCloudArenaLocalSessionService,
} from "./cloud-arena-local-session.js";

type CloudArenaApiResponse<TName extends CloudArenaApiContractName> =
  CloudArenaApiContracts[TName]["response"];

export type CloudArenaSessionMode = "local" | "remote";

export type CloudArenaSessionController = {
  applyCloudArenaAction: (
    sessionId: string,
    body: CloudArenaActionRequest,
    options?: { signal?: AbortSignal },
  ) => Promise<CloudArenaApiResponse<"cloudArenaSessionActions">>;
  createCloudArenaSession: (
    body?: CloudArenaCreateSessionRequest,
    options?: { signal?: AbortSignal },
  ) => Promise<CloudArenaApiResponse<"cloudArenaSessions">>;
  getCloudArenaSession: (
    sessionId: string,
    options?: { signal?: AbortSignal },
  ) => Promise<CloudArenaApiResponse<"cloudArenaSessionDetail">>;
  resetCloudArenaSession: (
    sessionId: string,
    options?: { signal?: AbortSignal },
  ) => Promise<CloudArenaApiResponse<"cloudArenaSessionReset">>;
};

export type CloudArenaSessionControllerOptions = {
  apiBaseUrl: string;
  mode?: CloudArenaSessionMode;
};

export function createCloudArenaSessionController({
  apiBaseUrl,
  mode = "remote",
}: CloudArenaSessionControllerOptions): CloudArenaSessionController {
  if (mode === "local") {
    return createCloudArenaLocalSessionService();
  }

  return createCloudArenaApiClient({ baseUrl: apiBaseUrl });
}
