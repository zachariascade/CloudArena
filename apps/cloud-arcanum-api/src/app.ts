import { existsSync } from "node:fs";

import fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";

import {
  CLOUD_ARCANUM_API_NAME,
  CLOUD_ARCANUM_CARD_IMAGES_PUBLIC_PREFIX,
} from "./constants.js";
import { createCloudArcanumApiLoaders, type CloudArcanumApiLoaderOptions } from "./loaders/index.js";
import { registerCloudArcanumApiRoutes } from "./routes/index.js";
import { createCloudArcanumApiServices } from "./services/index.js";

export type CloudArcanumApiAppOptions = FastifyServerOptions &
  CloudArcanumApiLoaderOptions;

export function createCloudArcanumApiApp(
  options: CloudArcanumApiAppOptions = {},
): FastifyInstance {
  const { workspaceRoot, ...fastifyOptions } = options;
  const app = fastify({
    logger: false,
    ...fastifyOptions,
  });

  const loaders = createCloudArcanumApiLoaders({ workspaceRoot });
  const services = createCloudArcanumApiServices(loaders);
  const routeContext = { loaders, services };

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

  if (existsSync(loaders.paths.cardImagesRoot)) {
    void app.register(fastifyStatic, {
      root: loaders.paths.cardImagesRoot,
      prefix: CLOUD_ARCANUM_CARD_IMAGES_PUBLIC_PREFIX,
      decorateReply: false,
    });
  } else {
    app.log.warn(
      {
        path: loaders.paths.cardImagesRoot,
      },
      "Skipping card image static serving because the directory does not exist.",
    );
  }

  void app.register(async (instance) => {
    await registerCloudArcanumApiRoutes(instance, routeContext);
  });

  return app;
}

export function createCloudArcanumApiServer(
  options: CloudArcanumApiAppOptions = {},
): FastifyInstance {
  return createCloudArcanumApiApp(options);
}

export function getCloudArcanumApiName(): string {
  return CLOUD_ARCANUM_API_NAME;
}
