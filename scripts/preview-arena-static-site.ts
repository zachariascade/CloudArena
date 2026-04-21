import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const projectRoot = path.resolve(currentDirectory, "../..");
const staticDirectory = path.resolve(projectRoot, "dist/apps/cloud-arena-web/static");

const host = process.env.CLOUD_ARENA_STATIC_HOST ?? "127.0.0.1";
const port = Number(process.env.CLOUD_ARENA_STATIC_PORT ?? "4322");

function getContentType(filePath: string): string {
  if (filePath.endsWith(".html")) {
    return "text/html; charset=utf-8";
  }

  if (filePath.endsWith(".js")) {
    return "text/javascript; charset=utf-8";
  }

  if (filePath.endsWith(".map")) {
    return "application/json; charset=utf-8";
  }

  if (filePath.endsWith(".svg")) {
    return "image/svg+xml";
  }

  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (filePath.endsWith(".png")) {
    return "image/png";
  }

  if (filePath.endsWith(".webp")) {
    return "image/webp";
  }

  if (filePath.endsWith(".avif")) {
    return "image/avif";
  }

  return "application/octet-stream";
}

function resolveStaticPath(requestUrl: string | undefined): string {
  const url = new URL(requestUrl ?? "/", `http://${host}:${port}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/" || pathname === "/decks") {
    return path.resolve(staticDirectory, "index.html");
  }

  const relativePath = pathname.replace(/^\/+/, "");

  if (relativePath.includes("..")) {
    throw new Error("Invalid static path.");
  }

  return path.resolve(staticDirectory, relativePath);
}

const server = createServer(async (request, response) => {
  try {
    const filePath = resolveStaticPath(request.url);
    const file = await readFile(filePath);

    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": getContentType(filePath),
    });
    response.end(file);
  } catch (error) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end(error instanceof Error ? error.message : "Not found.");
  }
});

server.listen(port, host, () => {
  console.log(`Cloud Arena static preview: http://${host}:${port}`);
});
