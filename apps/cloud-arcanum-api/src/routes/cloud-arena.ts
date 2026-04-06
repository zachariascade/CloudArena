import type {
  CloudArenaActionRequest,
  CloudArenaCreateSessionRequest,
} from "../../../../src/cloud-arcanum/api-contract.js";
import { cloudArcanumApiRoutes } from "../../../../src/cloud-arcanum/api-contract.js";
import type { BattleAction } from "../../../../src/cloud-arena/index.js";

import {
  CloudArenaInvalidActionError,
  CloudArenaSessionNotFoundError,
} from "../services/cloud-arena-sessions.js";
import type { CloudArcanumApiRouteModule } from "./index.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCreateSessionBody(body: unknown): CloudArenaCreateSessionRequest {
  if (body === undefined) {
    return {};
  }

  if (!isRecord(body)) {
    throw new Error("Session request body must be an object.");
  }

  const { scenarioId, seed } = body;

  if (scenarioId !== undefined && scenarioId !== "mixed_guardian") {
    throw new Error('scenarioId must be "mixed_guardian".');
  }

  if (
    seed !== undefined &&
    (!Number.isInteger(seed) || typeof seed !== "number" || seed <= 0)
  ) {
    throw new Error("seed must be a positive integer.");
  }

  return {
    scenarioId: scenarioId as CloudArenaCreateSessionRequest["scenarioId"],
    seed: seed as number | undefined,
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

export const registerCloudArcanumCloudArenaRoutes: CloudArcanumApiRouteModule = async (
  app,
  context,
): Promise<void> => {
  app.post(cloudArcanumApiRoutes.cloudArenaSessions, async (request, reply) => {
    try {
      const body = parseCreateSessionBody(request.body);

      return {
        data: context.services.cloudArenaSessions.createSession(body),
      };
    } catch (error) {
      return sendCloudArenaRouteError(error, reply);
    }
  });

  app.get(cloudArcanumApiRoutes.cloudArenaSessionDetail, async (request, reply) => {
    try {
      const { sessionId } = request.params as { sessionId: string };

      return {
        data: context.services.cloudArenaSessions.getSession(sessionId),
      };
    } catch (error) {
      return sendCloudArenaRouteError(error, reply);
    }
  });

  app.post(cloudArcanumApiRoutes.cloudArenaSessionActions, async (request, reply) => {
    try {
      const { sessionId } = request.params as { sessionId: string };
      const action = parseActionBody(request.body);

      return {
        data: context.services.cloudArenaSessions.applyAction(sessionId, action),
      };
    } catch (error) {
      return sendCloudArenaRouteError(error, reply);
    }
  });

  app.post(cloudArcanumApiRoutes.cloudArenaSessionReset, async (request, reply) => {
    try {
      const { sessionId } = request.params as { sessionId: string };

      return {
        data: context.services.cloudArenaSessions.resetSession(sessionId),
      };
    } catch (error) {
      return sendCloudArenaRouteError(error, reply);
    }
  });
};
