import type { FastifyReply } from "fastify";

import {
  cloudArenaApiRoutes,
  type CloudArenaCardListQuery,
  type CloudArenaDeckListQuery,
  type CloudArenaDeckRouteParams,
  type CloudArenaDeckWriteRequest,
} from "../../../../src/cloud-arena/api-contract.js";
import {
  createCloudArenaSavedDeck,
  deleteCloudArenaSavedDeck,
  getCloudArenaDeckDetailByIdAsync,
  listCloudArenaCardSummaries,
  listCloudArenaDeckSummaries,
  CloudArenaSavedDeckNotFoundError,
  CloudArenaSavedDeckValidationError,
  updateCloudArenaSavedDeck,
} from "../services/cloud-arena-decks.js";
import type { CloudArenaApiRouteModule } from "./index.js";
import type { CardAvailabilityStatus } from "../../../../src/cloud-arena/core/types.js";

class CloudArenaInvalidContentRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudArenaInvalidContentRequestError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCardListQuery(query: unknown): CloudArenaCardListQuery {
  if (!isRecord(query)) {
    return {};
  }

  const availabilityStatus =
    query.availabilityStatus === "ready" ||
    query.availabilityStatus === "in_progress" ||
    query.availabilityStatus === "all"
      ? (query.availabilityStatus as CardAvailabilityStatus | "all")
      : undefined;

  return {
    q: typeof query.q === "string" ? query.q : undefined,
    cardType: typeof query.cardType === "string" ? query.cardType : undefined,
    availabilityStatus,
  };
}

function parseDeckListQuery(query: unknown): CloudArenaDeckListQuery {
  if (!isRecord(query)) {
    return {};
  }

  const kind = query.kind === "preset" || query.kind === "saved" ? query.kind : undefined;

  return {
    q: typeof query.q === "string" ? query.q : undefined,
    kind,
    containsCardId: typeof query.containsCardId === "string" ? query.containsCardId : undefined,
  };
}

function parseDeckWriteRequest(body: unknown): CloudArenaDeckWriteRequest {
  if (!isRecord(body)) {
    throw new CloudArenaInvalidContentRequestError("Deck request body must be an object.");
  }

  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    throw new CloudArenaInvalidContentRequestError("Deck name must be a non-empty string.");
  }

  if (!Array.isArray(body.cards)) {
    throw new CloudArenaInvalidContentRequestError("Deck cards must be an array.");
  }

  const cards = body.cards.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new CloudArenaInvalidContentRequestError(`cards[${index}] must be an object.`);
    }

    if (typeof entry.cardId !== "string" || entry.cardId.trim().length === 0) {
      throw new CloudArenaInvalidContentRequestError(`cards[${index}].cardId must be a string.`);
    }

    if (typeof entry.quantity !== "number" || !Number.isInteger(entry.quantity)) {
      throw new CloudArenaInvalidContentRequestError(`cards[${index}].quantity must be an integer.`);
    }

    return {
      cardId: entry.cardId,
      quantity: entry.quantity,
    };
  });

  const tags =
    body.tags === undefined
      ? undefined
      : Array.isArray(body.tags)
        ? body.tags.map((tag, index) => {
            if (typeof tag !== "string") {
              throw new CloudArenaInvalidContentRequestError(`tags[${index}] must be a string.`);
            }

            return tag;
          })
        : (() => {
            throw new CloudArenaInvalidContentRequestError("tags must be an array of strings.");
          })();

  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
    throw new CloudArenaInvalidContentRequestError("notes must be a string or null.");
  }

  return {
    name: body.name,
    cards,
    tags,
    notes: body.notes === undefined ? undefined : body.notes,
  };
}

function sendCloudArenaContentRouteError(
  error: unknown,
  reply: FastifyReply,
): boolean {
  if (error instanceof CloudArenaSavedDeckNotFoundError) {
    void reply.status(404).send({
      error: {
        code: "not_found",
        message: error.message,
      },
    });
    return true;
  }

  if (error instanceof CloudArenaSavedDeckValidationError) {
    void reply.status(400).send({
      error: {
        code: "invalid_request",
        message: error.message,
      },
    });
    return true;
  }

  if (error instanceof CloudArenaInvalidContentRequestError) {
    void reply.status(400).send({
      error: {
        code: "invalid_request",
        message: error.message,
      },
    });
    return true;
  }

  if (error instanceof Error) {
    void reply.status(400).send({
      error: {
        code: "invalid_request",
        message: error.message,
      },
    });
    return true;
  }

  return false;
}

export const registerCloudArenaContentRoutes: CloudArenaApiRouteModule = async (
  app,
): Promise<void> => {
  app.get(cloudArenaApiRoutes.cloudArenaCards, async (request, reply) => {
    try {
      const query = parseCardListQuery(request.query);

      return {
        data: listCloudArenaCardSummaries(query),
      };
    } catch (error) {
      if (!sendCloudArenaContentRouteError(error, reply)) {
        throw error;
      }
      return undefined;
    }
  });

  app.get(cloudArenaApiRoutes.cloudArenaDecks, async (request, reply) => {
    try {
      const query = parseDeckListQuery(request.query);

      return {
        data: listCloudArenaDeckSummaries(query),
      };
    } catch (error) {
      if (!sendCloudArenaContentRouteError(error, reply)) {
        throw error;
      }
      return undefined;
    }
  });

  app.get(cloudArenaApiRoutes.cloudArenaDeckDetail, async (request, reply) => {
    try {
      const { deckId } = request.params as CloudArenaDeckRouteParams;
      const deck = await getCloudArenaDeckDetailByIdAsync(deckId);

      if (!deck) {
        throw new CloudArenaSavedDeckNotFoundError(deckId);
      }

      return {
        data: deck,
      };
    } catch (error) {
      if (!sendCloudArenaContentRouteError(error, reply)) {
        throw error;
      }
      return undefined;
    }
  });

  app.post(cloudArenaApiRoutes.cloudArenaDecks, async (request, reply) => {
    try {
      const body = parseDeckWriteRequest(request.body);
      const record = await createCloudArenaSavedDeck(body);
      const deck = await getCloudArenaDeckDetailByIdAsync(record.data.id);

      if (!deck) {
        throw new CloudArenaSavedDeckNotFoundError(record.data.id);
      }

      return {
        data: deck,
      };
    } catch (error) {
      if (!sendCloudArenaContentRouteError(error, reply)) {
        throw error;
      }
      return undefined;
    }
  });

  app.put(cloudArenaApiRoutes.cloudArenaDeckDetail, async (request, reply) => {
    try {
      const { deckId } = request.params as CloudArenaDeckRouteParams;
      const body = parseDeckWriteRequest(request.body);
      await updateCloudArenaSavedDeck(deckId, body);
      const deck = await getCloudArenaDeckDetailByIdAsync(deckId);

      if (!deck) {
        throw new CloudArenaSavedDeckNotFoundError(deckId);
      }

      return {
        data: deck,
      };
    } catch (error) {
      if (!sendCloudArenaContentRouteError(error, reply)) {
        throw error;
      }
      return undefined;
    }
  });

  app.delete(cloudArenaApiRoutes.cloudArenaDeckDetail, async (request, reply) => {
    try {
      const { deckId } = request.params as CloudArenaDeckRouteParams;
      await deleteCloudArenaSavedDeck(deckId);

      return {
        data: {
          deleted: true,
          deckId,
        },
      };
    } catch (error) {
      return sendCloudArenaContentRouteError(error, reply);
    }
  });
};
