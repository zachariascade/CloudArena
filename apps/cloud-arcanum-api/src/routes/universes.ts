import { cloudArcanumApiRoutes } from "../../../../src/cloud-arcanum/api-contract.js";
import { buildUniverseDetail } from "../services/view-models.js";
import { queryUniverses } from "../services/queries.js";

import type { CloudArcanumApiRouteModule } from "./index.js";
import {
  getInvalidQueryErrorMessage,
  parseUniverseListQuery,
} from "./shared.js";

export const registerCloudArcanumApiUniverseRoutes: CloudArcanumApiRouteModule = async (
  app,
  context,
): Promise<void> => {
  app.get(cloudArcanumApiRoutes.universes, async (request, reply) => {
    let parsedQuery;

    try {
      parsedQuery = parseUniverseListQuery(
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
    return queryUniverses(normalized, parsedQuery);
  });

  app.get(cloudArcanumApiRoutes.universeDetail, async (request, reply) => {
    const { universeId } = request.params as { universeId: string };
    const normalized = await context.services.loadNormalizedData();
    const universeRecord = normalized.indexes.universesById.get(universeId);

    if (!universeRecord) {
      return reply.status(404).send({
        error: {
          code: "not_found",
          message: `Universe "${universeId}" was not found.`,
        },
      });
    }

    return {
      data: buildUniverseDetail(universeRecord),
    };
  });
};
