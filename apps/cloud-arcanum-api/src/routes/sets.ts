import { cloudArcanumApiRoutes } from "../../../../src/cloud-arcanum/api-contract.js";
import { buildSetDetail } from "../services/view-models.js";
import { querySets } from "../services/queries.js";

import type { CloudArcanumApiRouteModule } from "./index.js";
import { getInvalidQueryErrorMessage, parseSetListQuery } from "./shared.js";

export const registerCloudArcanumApiSetRoutes: CloudArcanumApiRouteModule = async (
  app,
  context,
): Promise<void> => {
  app.get(cloudArcanumApiRoutes.sets, async (request, reply) => {
    let parsedQuery;

    try {
      parsedQuery = parseSetListQuery(
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
    return querySets(normalized, parsedQuery);
  });

  app.get(cloudArcanumApiRoutes.setDetail, async (request, reply) => {
    const { setId } = request.params as { setId: string };
    const normalized = await context.services.loadNormalizedData();
    const setRecord = normalized.indexes.setsById.get(setId);

    if (!setRecord) {
      return reply.status(404).send({
        error: {
          code: "not_found",
          message: `Set "${setId}" was not found.`,
        },
      });
    }

    return {
      data: buildSetDetail(normalized, setRecord),
    };
  });
};
