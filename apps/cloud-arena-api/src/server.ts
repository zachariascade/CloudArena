import type { CloudArenaApiAppOptions } from "./app.js";

import { createCloudArenaApiServer } from "./app.js";

export type CloudArenaApiServerOptions = CloudArenaApiAppOptions & {
  host?: string;
  port?: number;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms).unref();
  });
}

function isAddressInUseError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: string }).code === "EADDRINUSE"
  );
}

export async function startCloudArenaApiServer(
  options: CloudArenaApiServerOptions = {},
): Promise<{ host: string; port: number }> {
  const host = options.host ?? process.env.CLOUD_ARENA_API_HOST ?? "127.0.0.1";
  const port = options.port ?? Number(process.env.CLOUD_ARENA_API_PORT ?? "4311");
  const maxAttempts = 15;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const server = createCloudArenaApiServer(options);

    try {
      await server.listen({ host, port });
      return { host, port };
    } catch (error) {
      await server.close().catch(() => undefined);

      if (!isAddressInUseError(error) || attempt === maxAttempts) {
        throw error;
      }

      await sleep(150 * attempt);
    }
  }

  throw new Error("Failed to start the Cloud Arena API server.");
}

export { createCloudArenaApiServer };
