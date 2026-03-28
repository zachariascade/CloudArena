import type { FastifyInstance, FastifyPluginAsync } from "fastify";

import { registerCloudArcanumApiHealthRoute } from "./health.js";
import { registerCloudArcanumApiMetaRoute } from "./meta.js";
import { registerCloudArcanumApiCardRoutes } from "./cards.js";
import { registerCloudArcanumApiDeckRoutes } from "./decks.js";
import { registerCloudArcanumApiSetRoutes } from "./sets.js";
import { registerCloudArcanumApiUniverseRoutes } from "./universes.js";
import { registerCloudArcanumApiValidationRoutes } from "./validation.js";
import type { CloudArcanumApiLoaders } from "../loaders/index.js";
import type { CloudArcanumApiServices } from "../services/index.js";

export type CloudArcanumApiRouteContext = {
  loaders: CloudArcanumApiLoaders;
  services: CloudArcanumApiServices;
};

export type CloudArcanumApiRouteModule = FastifyPluginAsync<CloudArcanumApiRouteContext>;

export const cloudArcanumApiRouteModules: CloudArcanumApiRouteModule[] = [
  registerCloudArcanumApiHealthRoute,
  registerCloudArcanumApiMetaRoute,
  registerCloudArcanumApiCardRoutes,
  registerCloudArcanumApiDeckRoutes,
  registerCloudArcanumApiSetRoutes,
  registerCloudArcanumApiUniverseRoutes,
  registerCloudArcanumApiValidationRoutes,
];

export async function registerCloudArcanumApiRoutes(
  app: FastifyInstance,
  context: CloudArcanumApiRouteContext,
): Promise<void> {
  for (const routeModule of cloudArcanumApiRouteModules) {
    await app.register(routeModule, context);
  }
}
