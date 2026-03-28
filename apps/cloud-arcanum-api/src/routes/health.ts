import { cloudArcanumApiRoutes } from "../../../../src/cloud-arcanum/api-contract.js";

import type { CloudArcanumApiRouteModule } from "./index.js";

export const registerCloudArcanumApiHealthRoute: CloudArcanumApiRouteModule = async (
  app,
  context,
): Promise<void> => {
  app.get(cloudArcanumApiRoutes.health, async () => {
    return {
      data: {
        app: context.services.app.name,
        status: "ok",
      },
    };
  });
};
