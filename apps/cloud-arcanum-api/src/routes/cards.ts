import { cloudArcanumApiRoutes } from "../../../../src/cloud-arcanum/api-contract.js";
import { buildCardDetail } from "../services/view-models.js";
import { queryCards } from "../services/queries.js";

import type { CloudArcanumApiRouteModule } from "./index.js";
import { getInvalidQueryErrorMessage, parseCardListQuery } from "./shared.js";

export const registerCloudArcanumApiCardRoutes: CloudArcanumApiRouteModule = async (
  app,
  context,
): Promise<void> => {
  app.get(cloudArcanumApiRoutes.cards, async (request, reply) => {
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

    const normalized = await context.services.loadNormalizedData();
    return queryCards(normalized, parsedQuery);
  });

  app.get(cloudArcanumApiRoutes.cardDetail, async (request, reply) => {
    const { cardId } = request.params as { cardId: string };
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
      data: buildCardDetail(normalized, cardRecord),
    };
  });
};
