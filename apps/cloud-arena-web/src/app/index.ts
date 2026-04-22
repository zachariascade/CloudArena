import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderCloudArenaWebHtml } from "./html.js";
import type { CloudArenaContentMode, CloudArenaSessionMode } from "../lib/cloud-arena-web-lib.js";

type CloudArenaWebServerOptions = {
  apiBaseUrl?: string;
  cloudArcanumApiBaseUrl?: string;
  cloudArcanumWebBaseUrl?: string;
  contentMode?: CloudArenaContentMode;
  sessionMode?: CloudArenaSessionMode;
  routerMode?: "browser" | "hash";
  host?: string;
  port?: number;
};

export function createCloudArenaWebApp(): string {
  return "cloud-arena-web";
}

const distDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = findProjectRoot(distDirectory);
const clientAssetsDirectory = path.resolve(distDirectory, "../../client");
const imagesDirectory = path.resolve(projectRoot, "images");
const cardImagesDirectory = path.resolve(projectRoot, "images/cards");

function findProjectRoot(startDirectory: string): string {
  let currentDirectory = startDirectory;

  while (true) {
    if (
      existsSync(path.resolve(currentDirectory, "package.json")) &&
      existsSync(path.resolve(currentDirectory, "images")) &&
      existsSync(path.resolve(currentDirectory, "images/cards"))
    ) {
      return currentDirectory;
    }

    const parentDirectory = path.dirname(currentDirectory);

    if (parentDirectory === currentDirectory) {
      throw new Error(`Could not find project root from ${startDirectory}.`);
    }

    currentDirectory = parentDirectory;
  }
}

function getAssetContentType(assetPath: string): string {
  if (assetPath.endsWith(".svg")) {
    return "image/svg+xml";
  }

  if (assetPath.endsWith(".jpg") || assetPath.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (assetPath.endsWith(".png")) {
    return "image/png";
  }

  if (assetPath.endsWith(".webp")) {
    return "image/webp";
  }

  if (assetPath.endsWith(".avif")) {
    return "image/avif";
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
  contentMode: CloudArenaContentMode;
  sessionMode: CloudArenaSessionMode;
  routerMode: "browser" | "hash";
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
    "http://127.0.0.1:4321";
  const contentMode = options.contentMode ?? (
    process.env.CLOUD_ARENA_CONTENT_MODE === "local" ? "local" : "remote"
  );
  const sessionMode = options.sessionMode ?? (
    process.env.CLOUD_ARENA_SESSION_MODE === "local" ? "local" : "remote"
  );
  const routerMode = options.routerMode ?? (
    process.env.CLOUD_ARENA_ROUTER_MODE === "hash" ? "hash" : "browser"
  );
  const devVersion = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

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

        if (request.url?.startsWith("/images/cards/")) {
          const imageName = decodeURIComponent(request.url.slice("/images/cards/".length));

          if (imageName.includes("..") || imageName.includes("\\") || imageName.startsWith("/")) {
            response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
            response.end("Invalid image path.");
            return;
          }

          const imagePath = path.resolve(cardImagesDirectory, imageName);
          const imageContents = await readFile(imagePath);

          response.writeHead(200, {
            "cache-control": "no-store",
            "content-type": getAssetContentType(imagePath),
          });
          response.end(imageContents);
          return;
        }

        if (request.url?.startsWith("/images/")) {
          const imageName = decodeURIComponent(request.url.slice("/images/".length));

          if (imageName.includes("..") || imageName.includes("\\") || imageName.startsWith("/")) {
            response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
            response.end("Invalid image path.");
            return;
          }

          const imagePath = path.resolve(imagesDirectory, imageName);
          const imageContents = await readFile(imagePath);

          response.writeHead(200, {
            "cache-control": "no-store",
            "content-type": getAssetContentType(imagePath),
          });
          response.end(imageContents);
          return;
        }

        if (request.url === "/__cloud-arena-dev-version") {
          response.writeHead(200, {
            "cache-control": "no-store",
            "content-type": "text/plain; charset=utf-8",
          });
          response.end(devVersion);
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
            contentMode,
            sessionMode,
            routerMode,
            undefined,
            true,
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
        contentMode,
        sessionMode,
        routerMode,
        host,
        port,
      });
    });
  });
}
