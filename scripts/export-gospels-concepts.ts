import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ensureGospelsRequiredAnchors,
  loadGospelsConceptRecords,
  loadGospelsSourceDocument,
  serializeGospelsIntermediateCsv,
  validateGospelChapters,
  validateGospelsChapterBands,
  validateGospelsConceptRecords,
} from "../src/biblical/gospels-pilot.js";

async function main(): Promise<void> {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const sourceDirectory = path.join(rootDir, "data", "sources", "kjv");
  const exportsDirectory = path.join(rootDir, "exports", "card-concepts");
  const sourceDocument = await loadGospelsSourceDocument(path.join(sourceDirectory, "gospels.json"));
  const records = await loadGospelsConceptRecords(path.join(sourceDirectory, "gospels.concepts.json"));

  for (const book of sourceDocument.books) {
    validateGospelChapters(book.book, book.chapters);
  }

  validateGospelsChapterBands();
  validateGospelsConceptRecords(records);
  ensureGospelsRequiredAnchors(records);

  await mkdir(exportsDirectory, { recursive: true });
  await writeFile(
    path.join(exportsDirectory, "gospels-concepts.csv"),
    serializeGospelsIntermediateCsv(records),
    "utf8",
  );

  process.stdout.write(
    `Wrote ${records.length} Gospel concept rows to ${path.relative(rootDir, path.join(exportsDirectory, "gospels-concepts.csv"))}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
