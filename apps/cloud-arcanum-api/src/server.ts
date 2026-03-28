import type { CloudArcanumApiAppOptions } from "./app.js";

import { createCloudArcanumApiServer } from "./app.js";

export type CloudArcanumApiServerOptions = CloudArcanumApiAppOptions & {
  host?: string;
  port?: number;
};

export async function startCloudArcanumApiServer(
  options: CloudArcanumApiServerOptions = {},
): Promise<{ host: string; port: number }> {
  const host = options.host ?? process.env.CLOUD_ARCANUM_API_HOST ?? "127.0.0.1";
  const port = options.port ?? Number(process.env.CLOUD_ARCANUM_API_PORT ?? "4310");
  const server = createCloudArcanumApiServer(options);

  await server.listen({ host, port });

  return { host, port };
}

export { createCloudArcanumApiServer };
