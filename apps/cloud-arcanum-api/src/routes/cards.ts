import { cloudArcanumApiRoutes } from "../../../../src/cloud-arcanum/api-contract.js";
import { buildCardDetail } from "../services/view-models.js";
import {
  countCards,
  queryCardIds,
  queryCards,
  queryCardSummaries,
} from "../services/queries.js";

import type { CloudArcanumApiRouteModule } from "./index.js";
import { getInvalidQueryErrorMessage, parseCardListQuery } from "./shared.js";

export const registerCloudArcanumApiCardRoutes: CloudArcanumApiRouteModule = async (
  app,
  context,
): Promise<void> => {
  async function parseCardsQueryOrSendError(
    request: { query: unknown },
    reply: { status: (code: number) => { send: (payload: unknown) => unknown } },
  ) {
    let parsedQuery;

    try {
      parsedQuery = parseCardListQuery(
        request.query as Record<string, string | string[] | undefined>,
      );
    } catch (error) {
      return reply.status(400).send({
        error: {
          code: "invalid_query",
          message: getInvalidQueryErrorMessage(error),
        },
      });
    }

    return parsedQuery;
  }

  app.get(cloudArcanumApiRoutes.cards, async (request, reply) => {
    const parsedQuery = await parseCardsQueryOrSendError(request, reply);

    if (!parsedQuery) {
      return;
    }

    const normalized = await context.services.loadNormalizedData();
    return queryCards(normalized, parsedQuery);
  });

  app.get(cloudArcanumApiRoutes.cardsCount, async (request, reply) => {
    const parsedQuery = await parseCardsQueryOrSendError(request, reply);

    if (!parsedQuery) {
      return;
    }

    const normalized = await context.services.loadNormalizedData();
    return {
      data: countCards(normalized, parsedQuery),
    };
  });

  app.get(cloudArcanumApiRoutes.cardsIds, async (request, reply) => {
    const parsedQuery = await parseCardsQueryOrSendError(request, reply);

    if (!parsedQuery) {
      return;
    }

    const normalized = await context.services.loadNormalizedData();
    return queryCardIds(normalized, parsedQuery);
  });

  app.get(cloudArcanumApiRoutes.cardsSummary, async (request, reply) => {
    const parsedQuery = await parseCardsQueryOrSendError(request, reply);

    if (!parsedQuery) {
      return;
    }

    const normalized = await context.services.loadNormalizedData();
    return queryCardSummaries(normalized, parsedQuery);
  });

  app.get(cloudArcanumApiRoutes.cardDetail, async (request, reply) => {
    const { cardId } = request.params as { cardId: string };
    const themeId =
      typeof (request.query as { themeId?: unknown } | undefined)?.themeId === "string"
        ? ((request.query as { themeId?: string }).themeId || undefined)
        : undefined;
    const normalized = await context.services.loadNormalizedData();
    const cardRecord = normalized.indexes.cardsById.get(cardId);

    if (!cardRecord) {
      return reply.status(404).send({
        error: {
          code: "not_found",
          message: `Card "${cardId}" was not found.`,
        },
      });
    }

    return {
      data: buildCardDetail(normalized, cardRecord, { themeId }),
    };
  });
};
