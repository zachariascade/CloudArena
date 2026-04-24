import type {
  CloudArenaActionRequest,
  CloudArenaCreateSessionRequest,
  CloudArenaSessionRouteParams,
  CloudArenaSessionScenarioId,
} from "../../../../src/cloud-arena/api-contract.js";
import { cloudArenaApiRoutes } from "../../../../src/cloud-arena/api-contract.js";
import type { BattleAction } from "../../../../src/cloud-arena/index.js";

import {
  CloudArenaFinishedBattleError,
  CloudArenaInvalidActionError,
  CloudArenaSessionNotFoundError,
} from "../services/cloud-arena-sessions.js";
import type { CloudArenaApiRouteModule } from "./index.js";

class CloudArenaInvalidSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudArenaInvalidSetupError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const allowedScenarioIds: CloudArenaSessionScenarioId[] = [
  "demon_pack",
  "lake_of_ice",
  "imp_caller",
];

function parseCreateSessionBody(body: unknown): CloudArenaCreateSessionRequest {
  if (body === undefined) {
    return {};
  }

  if (!isRecord(body)) {
    throw new CloudArenaInvalidSetupError("Session request body must be an object.");
  }

  const { scenarioId, deckId, seed } = body;
  const { shuffleDeck } = body;

  if (scenarioId !== undefined && !allowedScenarioIds.includes(scenarioId as CloudArenaSessionScenarioId)) {
    throw new CloudArenaInvalidSetupError(
      `scenarioId must be one of ${allowedScenarioIds.map((id) => `"${id}"`).join(", ")}.`,
    );
  }

  if (deckId !== undefined && (typeof deckId !== "string" || deckId.length === 0)) {
    throw new CloudArenaInvalidSetupError("deckId must be a non-empty string when provided.");
  }

  if (
    seed !== undefined &&
    (!Number.isInteger(seed) || typeof seed !== "number" || seed <= 0)
  ) {
    throw new CloudArenaInvalidSetupError("seed must be a positive integer.");
  }

  if (shuffleDeck !== undefined && typeof shuffleDeck !== "boolean") {
    throw new CloudArenaInvalidSetupError("shuffleDeck must be a boolean.");
  }

  return {
    scenarioId: scenarioId as CloudArenaCreateSessionRequest["scenarioId"],
    deckId: deckId as CloudArenaCreateSessionRequest["deckId"],
    seed: seed as number | undefined,
    shuffleDeck: shuffleDeck as boolean | undefined,
  };
}

function parseActionBody(body: unknown): BattleAction {
  if (!isRecord(body) || !isRecord(body.action)) {
    throw new Error("Action request body must include an action object.");
  }

  return (body as CloudArenaActionRequest).action;
}

function sendCloudArenaRouteError(
  error: unknown,
  reply: { status: (code: number) => { send: (payload: unknown) => unknown } },
) {
  if (error instanceof CloudArenaSessionNotFoundError) {
    return reply.status(404).send({
      error: {
        code: "not_found",
        message: error.message,
      },
    });
  }

  if (error instanceof CloudArenaInvalidActionError) {
    return reply.status(400).send({
      error: {
        code: "invalid_request",
        message: error.message,
      },
    });
  }

  if (error instanceof CloudArenaFinishedBattleError) {
    return reply.status(409).send({
      error: {
        code: "invalid_request",
        message: error.message,
      },
    });
  }

  if (error instanceof CloudArenaInvalidSetupError) {
    return reply.status(400).send({
      error: {
        code: "invalid_request",
        message: error.message,
      },
    });
  }

  if (error instanceof Error) {
    return reply.status(400).send({
      error: {
        code: "invalid_request",
        message: error.message,
      },
    });
  }

  throw error;
}

export const registerCloudArenaRoutes: CloudArenaApiRouteModule = async (
  app,
  context,
): Promise<void> => {
  app.post(cloudArenaApiRoutes.cloudArenaSessions, async (request, reply) => {
    try {
      const body = parseCreateSessionBody(request.body);

      return {
        data: context.services.cloudArenaSessions.createSession(body),
      };
    } catch (error) {
      return sendCloudArenaRouteError(error, reply);
    }
  });

  app.get(cloudArenaApiRoutes.cloudArenaSessionDetail, async (request, reply) => {
    try {
      const { sessionId } = request.params as CloudArenaSessionRouteParams;

      return {
        data: context.services.cloudArenaSessions.getSession(sessionId),
      };
    } catch (error) {
      return sendCloudArenaRouteError(error, reply);
    }
  });

  app.post(cloudArenaApiRoutes.cloudArenaSessionActions, async (request, reply) => {
    try {
      const { sessionId } = request.params as CloudArenaSessionRouteParams;
      const action = parseActionBody(request.body);

      return {
        data: context.services.cloudArenaSessions.applyAction(sessionId, action),
      };
    } catch (error) {
      return sendCloudArenaRouteError(error, reply);
    }
  });

  app.post(cloudArenaApiRoutes.cloudArenaSessionReset, async (request, reply) => {
    try {
      const { sessionId } = request.params as CloudArenaSessionRouteParams;

      return {
        data: context.services.cloudArenaSessions.resetSession(sessionId),
      };
    } catch (error) {
      return sendCloudArenaRouteError(error, reply);
    }
  });
};
