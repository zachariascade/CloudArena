import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildExodusManifest,
  parseExodusRawSource,
  validateChapterBands,
  validateExodusChapters,
} from "../src/biblical/exodus-pilot.js";

async function main(): Promise<void> {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const sourceDirectory = path.join(rootDir, "data", "sources", "kjv");
  const rawSourcePath = path.join(sourceDirectory, "exodus.raw.txt");
  const normalizedSourcePath = path.join(sourceDirectory, "exodus.json");
  const manifestPath = path.join(sourceDirectory, "exodus.manifest.json");
  const rawSource = await readFile(rawSourcePath, "utf8");
  const chapters = parseExodusRawSource(rawSource);

  validateExodusChapters(chapters);
  validateChapterBands();

  await mkdir(sourceDirectory, { recursive: true });
  await writeFile(
    normalizedSourcePath,
    `${JSON.stringify(
      {
        manifest: buildExodusManifest(),
        chapters,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await writeFile(
    manifestPath,
    `${JSON.stringify(buildExodusManifest(), null, 2)}\n`,
    "utf8",
  );

  process.stdout.write(
    `Wrote normalized Exodus source with ${chapters.length} chapters to ${path.relative(rootDir, normalizedSourcePath)}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
