import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderCloudArenaWebHtml } from "./html.js";

type CloudArenaWebServerOptions = {
  apiBaseUrl?: string;
  cloudArcanumApiBaseUrl?: string;
  cloudArcanumWebBaseUrl?: string;
  host?: string;
  port?: number;
};

export function createCloudArenaWebApp(): string {
  return "cloud-arena-web";
}

const distDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientAssetsDirectory = path.resolve(distDirectory, "../../client");

function getAssetContentType(assetPath: string): string {
  if (assetPath.endsWith(".svg")) {
    return "image/svg+xml";
  }

  if (assetPath.endsWith(".js")) {
    return "text/javascript; charset=utf-8";
  }

  if (assetPath.endsWith(".map")) {
    return "application/json; charset=utf-8";
  }

  return "application/octet-stream";
}

export function startCloudArenaWebApp(
  options: CloudArenaWebServerOptions = {},
): Promise<{
  apiBaseUrl: string;
  cloudArcanumApiBaseUrl: string;
  cloudArcanumWebBaseUrl: string;
  host: string;
  port: number;
}> {
  const host = options.host ?? process.env.CLOUD_ARENA_WEB_HOST ?? "127.0.0.1";
  const port = options.port ?? Number(process.env.CLOUD_ARENA_WEB_PORT ?? "4321");
  const apiBaseUrl =
    options.apiBaseUrl ?? process.env.CLOUD_ARENA_API_BASE_URL ?? "http://127.0.0.1:4311";
  const cloudArcanumApiBaseUrl =
    options.cloudArcanumApiBaseUrl ??
    process.env.CLOUD_ARCANUM_API_BASE_URL ??
    "http://127.0.0.1:4310";
  const cloudArcanumWebBaseUrl =
    options.cloudArcanumWebBaseUrl ??
    process.env.CLOUD_ARCANUM_WEB_BASE_URL ??
    "http://127.0.0.1:4320";

  return new Promise((resolve, reject) => {
    const server = createServer(async (request, response) => {
      try {
        if (request.url?.startsWith("/assets/")) {
          const assetName = request.url.slice("/assets/".length);

          if (assetName.includes("/") || assetName.includes("\\")) {
            response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
            response.end("Invalid asset path.");
            return;
          }

          const assetPath = path.resolve(clientAssetsDirectory, assetName);
          const assetContents = await readFile(assetPath);

          response.writeHead(200, {
            "cache-control": "no-store",
            "content-type": getAssetContentType(assetPath),
          });
          response.end(assetContents);
          return;
        }

        response.writeHead(200, {
          "cache-control": "no-store",
          "content-type": "text/html; charset=utf-8",
        });
        response.end(
          renderCloudArenaWebHtml(
            cloudArcanumApiBaseUrl,
            apiBaseUrl,
            cloudArcanumWebBaseUrl,
          ),
        );
      } catch (error) {
        response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
        response.end(
          error instanceof Error ? error.message : "Failed to render Cloud Arena web app.",
        );
      }
    });

    server.once("error", reject);
    server.listen(port, host, () => {
      resolve({
        apiBaseUrl,
        cloudArcanumApiBaseUrl,
        cloudArcanumWebBaseUrl,
        host,
        port,
      });
    });
  });
}
