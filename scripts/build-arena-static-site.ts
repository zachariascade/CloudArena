import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderCloudArenaWebHtml } from "../apps/cloud-arena-web/src/app/html.js";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const projectRoot = path.resolve(currentDirectory, "../..");
const clientDirectory = path.resolve(projectRoot, "dist/apps/cloud-arena-web/client");
const cardImagesDirectory = path.resolve(projectRoot, "images/cards");
const staticDirectory = path.resolve(projectRoot, "dist/apps/cloud-arena-web/static");
const staticAssetsDirectory = path.resolve(staticDirectory, "assets");
const staticCardImagesDirectory = path.resolve(staticDirectory, "images/cards");
const clientEntryFileName = "app.js";

function normalizeBaseUrl(value: string | undefined): string {
  return value ?? "";
}

await rm(staticDirectory, { recursive: true, force: true });
await mkdir(staticAssetsDirectory, { recursive: true });
await cp(clientDirectory, staticAssetsDirectory, { recursive: true });
await cp(cardImagesDirectory, staticCardImagesDirectory, { recursive: true });

const clientEntryBytes = await readFile(path.resolve(staticAssetsDirectory, clientEntryFileName));
const clientEntryHash = createHash("sha256").update(clientEntryBytes).digest("hex").slice(0, 12);
const html = renderCloudArenaWebHtml(
  normalizeBaseUrl(process.env.CLOUD_ARCANUM_API_BASE_URL),
  normalizeBaseUrl(process.env.CLOUD_ARENA_API_BASE_URL),
  normalizeBaseUrl(process.env.CLOUD_ARCANUM_WEB_BASE_URL),
  "local",
  "local",
  "hash",
  `./assets/${clientEntryFileName}?v=${clientEntryHash}`,
);

await writeFile(path.resolve(staticDirectory, "index.html"), html, "utf8");
await writeFile(path.resolve(staticDirectory, "404.html"), html, "utf8");
