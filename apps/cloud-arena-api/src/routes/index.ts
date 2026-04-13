import type { FastifyInstance, FastifyPluginAsync } from "fastify";

import { registerCloudArenaRoutes } from "./cloud-arena.js";
import type { CloudArenaApiServices } from "../services/index.js";

export type CloudArenaApiRouteContext = {
  services: CloudArenaApiServices;
};

export type CloudArenaApiRouteModule = FastifyPluginAsync<CloudArenaApiRouteContext>;

export const cloudArenaApiRouteModules: CloudArenaApiRouteModule[] = [
  registerCloudArenaRoutes,
];

export async function registerCloudArenaApiRoutes(
  app: FastifyInstance,
  context: CloudArenaApiRouteContext,
): Promise<void> {
  for (const routeModule of cloudArenaApiRouteModules) {
    await app.register(routeModule, context);
  }
}
