import { cloudArcanumApiRoutes } from "../../../../src/cloud-arcanum/api-contract.js";

import type { CloudArcanumApiRouteModule } from "./index.js";

export const registerCloudArcanumApiValidationRoutes: CloudArcanumApiRouteModule = async (
  app,
  context,
): Promise<void> => {
  app.get(cloudArcanumApiRoutes.validationSummary, async () => {
    return {
      data: await context.services.loadValidationSummary(),
    };
  });

  app.get(cloudArcanumApiRoutes.entityValidation, async (request, reply) => {
    const { entityId } = request.params as { entityId: string };
    const entityValidation = await context.services.loadEntityValidation(entityId);

    if (!entityValidation) {
      return reply.status(404).send({
        error: {
          code: "not_found",
          message: `Entity "${entityId}" was not found.`,
        },
      });
    }

    return {
      data: entityValidation,
    };
  });
};
