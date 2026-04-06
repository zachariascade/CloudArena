import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  GOSPEL_BOOK_CONFIGS,
  buildGospelsManifest,
  parseGospelRawSource,
  validateGospelChapters,
  validateGospelsChapterBands,
} from "../src/biblical/gospels-pilot.js";

async function main(): Promise<void> {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const sourceDirectory = path.join(rootDir, "data", "sources", "kjv");
  const manifest = buildGospelsManifest();
  const books = [];

  await mkdir(sourceDirectory, { recursive: true });

  for (const config of GOSPEL_BOOK_CONFIGS) {
    const rawSource = await readFile(path.join(rootDir, config.rawSourcePath), "utf8");
    const chapters = parseGospelRawSource(rawSource, config);

    validateGospelChapters(config.book, chapters);

    books.push({
      book: config.book,
      chapters,
    });

    await writeFile(
      path.join(rootDir, config.normalizedSourcePath),
      `${JSON.stringify(
        {
          book: config.book,
          chapters,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
  }

  validateGospelsChapterBands();

  await writeFile(
    path.join(sourceDirectory, "gospels.json"),
    `${JSON.stringify({ manifest, books }, null, 2)}\n`,
    "utf8",
  );
  await writeFile(
    path.join(sourceDirectory, "gospels.manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  process.stdout.write(
    `Wrote normalized Gospel sources for ${books.length} books to ${path.relative(rootDir, path.join(sourceDirectory, "gospels.json"))}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
