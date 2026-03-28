import { cloudArcanumApiRoutes } from "../../../../src/cloud-arcanum/api-contract.js";
import { buildDeckDetail } from "../services/view-models.js";
import { queryDecks } from "../services/queries.js";

import type { CloudArcanumApiRouteModule } from "./index.js";
import { getInvalidQueryErrorMessage, parseDeckListQuery } from "./shared.js";

export const registerCloudArcanumApiDeckRoutes: CloudArcanumApiRouteModule = async (
  app,
  context,
): Promise<void> => {
  app.get(cloudArcanumApiRoutes.decks, async (request, reply) => {
    let parsedQuery;

    try {
      parsedQuery = parseDeckListQuery(
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
    return queryDecks(normalized, parsedQuery);
  });

  app.get(cloudArcanumApiRoutes.deckDetail, async (request, reply) => {
    const { deckId } = request.params as { deckId: string };
    const normalized = await context.services.loadNormalizedData();
    const deckRecord = normalized.indexes.decksById.get(deckId);

    if (!deckRecord) {
      return reply.status(404).send({
        error: {
          code: "not_found",
          message: `Deck "${deckId}" was not found.`,
        },
      });
    }

    return {
      data: buildDeckDetail(normalized, deckRecord),
    };
  });
};
