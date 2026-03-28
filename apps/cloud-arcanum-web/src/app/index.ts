import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderCloudArcanumWebHtml } from "./html.js";

type CloudArcanumWebServerOptions = {
  apiBaseUrl?: string;
  host?: string;
  port?: number;
};

export function createCloudArcanumWebApp(): string {
  return "cloud-arcanum-web";
}

const distDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientBundlePath = path.resolve(distDirectory, "../../client/app.js");

async function readClientBundle(): Promise<string> {
  return readFile(clientBundlePath, "utf8");
}

export function startCloudArcanumWebApp(
  options: CloudArcanumWebServerOptions = {},
): Promise<{ host: string; port: number; apiBaseUrl: string }> {
  const host = options.host ?? process.env.CLOUD_ARCANUM_WEB_HOST ?? "127.0.0.1";
  const port = options.port ?? Number(process.env.CLOUD_ARCANUM_WEB_PORT ?? "4320");
  const apiBaseUrl =
    options.apiBaseUrl ?? process.env.CLOUD_ARCANUM_API_BASE_URL ?? "http://127.0.0.1:4310";

  return new Promise((resolve, reject) => {
    const server = createServer(async (request, response) => {
      try {
        if (request.url === "/assets/app.js") {
          const clientBundle = await readClientBundle();

          response.writeHead(200, {
            "cache-control": "no-store",
            "content-type": "text/javascript; charset=utf-8",
          });
          response.end(clientBundle);
          return;
        }

        response.writeHead(200, {
          "cache-control": "no-store",
          "content-type": "text/html; charset=utf-8",
        });
        response.end(renderCloudArcanumWebHtml(apiBaseUrl));
      } catch (error) {
        response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
        response.end(
          error instanceof Error ? error.message : "Failed to render Cloud Arcanum web app.",
        );
      }
    });

    server.once("error", reject);
    server.listen(port, host, () => {
      resolve({ host, port, apiBaseUrl });
    });
  });
}
