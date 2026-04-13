import type { CloudArenaApiAppOptions } from "./app.js";

import { createCloudArenaApiServer } from "./app.js";

export type CloudArenaApiServerOptions = CloudArenaApiAppOptions & {
  host?: string;
  port?: number;
};

export async function startCloudArenaApiServer(
  options: CloudArenaApiServerOptions = {},
): Promise<{ host: string; port: number }> {
  const host = options.host ?? process.env.CLOUD_ARENA_API_HOST ?? "127.0.0.1";
  const port = options.port ?? Number(process.env.CLOUD_ARENA_API_PORT ?? "4311");
  const server = createCloudArenaApiServer(options);

  await server.listen({ host, port });

  return { host, port };
}

export { createCloudArenaApiServer };
