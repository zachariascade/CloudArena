import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ensureRequiredAnchors,
  loadExodusConceptRecords,
  loadExodusSourceDocument,
  serializeIntermediateCsv,
  validateChapterBands,
  validateConceptRecords,
  validateExodusChapters,
} from "../src/biblical/exodus-pilot.js";

async function main(): Promise<void> {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const sourceDirectory = path.join(rootDir, "data", "sources", "kjv");
  const exportsDirectory = path.join(rootDir, "exports", "card-concepts");
  const sourceDocument = await loadExodusSourceDocument(path.join(sourceDirectory, "exodus.json"));
  const records = await loadExodusConceptRecords(path.join(sourceDirectory, "exodus.concepts.json"));

  validateExodusChapters(sourceDocument.chapters);
  validateChapterBands();
  validateConceptRecords(records);
  ensureRequiredAnchors(records);

  await mkdir(exportsDirectory, { recursive: true });
  await writeFile(
    path.join(exportsDirectory, "exodus-concepts.csv"),
    serializeIntermediateCsv(records),
    "utf8",
  );

  process.stdout.write(
    `Wrote ${records.length} Exodus concept rows to ${path.relative(rootDir, path.join(exportsDirectory, "exodus-concepts.csv"))}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
