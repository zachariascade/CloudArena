import fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import fastifyCors from "@fastify/cors";

import { CLOUD_ARENA_API_NAME } from "./constants.js";
import { registerCloudArenaApiRoutes } from "./routes/index.js";
import { createCloudArenaApiServices } from "./services/index.js";

export type CloudArenaApiAppOptions = FastifyServerOptions;

export function createCloudArenaApiApp(
  options: CloudArenaApiAppOptions = {},
): FastifyInstance {
  const app = fastify({
    logger: false,
    ...options,
  });

  const services = createCloudArenaApiServices();
  const routeContext = { services };

  app.setErrorHandler((error, _request, reply) => {
    void reply.status(500).send({
      error: {
        code: "internal_error",
        message: error.message || "Internal server error.",
      },
    });
  });

  app.setNotFoundHandler((_request, reply) => {
    void reply.status(404).send({
      error: {
        code: "not_found",
        message: "Route not found.",
      },
    });
  });

  void app.register(fastifyCors, {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isLocalhostOrigin = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin);
      callback(null, isLocalhostOrigin);
    },
  });

  void app.register(async (instance) => {
    await registerCloudArenaApiRoutes(instance, routeContext);
  });

  return app;
}

export function createCloudArenaApiServer(
  options: CloudArenaApiAppOptions = {},
): FastifyInstance {
  return createCloudArenaApiApp(options);
}

export function getCloudArenaApiName(): string {
  return CLOUD_ARENA_API_NAME;
}
