import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ensureGenesisRequiredAnchors,
  loadGenesisConceptRecords,
  loadGenesisSourceDocument,
  serializeGenesisIntermediateCsv,
  validateGenesisChapterBands,
  validateGenesisChapters,
  validateGenesisConceptRecords,
} from "../src/biblical/genesis-pilot.js";

async function main(): Promise<void> {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const sourceDirectory = path.join(rootDir, "data", "sources", "kjv");
  const exportsDirectory = path.join(rootDir, "exports", "card-concepts");
  const sourceDocument = await loadGenesisSourceDocument(path.join(sourceDirectory, "genesis.json"));
  const records = await loadGenesisConceptRecords(path.join(sourceDirectory, "genesis.concepts.json"));

  validateGenesisChapters(sourceDocument.chapters);
  validateGenesisChapterBands();
  validateGenesisConceptRecords(records);
  ensureGenesisRequiredAnchors(records);

  await mkdir(exportsDirectory, { recursive: true });
  await writeFile(
    path.join(exportsDirectory, "genesis-concepts.csv"),
    serializeGenesisIntermediateCsv(records),
    "utf8",
  );

  process.stdout.write(
    `Wrote ${records.length} Genesis concept rows to ${path.relative(rootDir, path.join(exportsDirectory, "genesis-concepts.csv"))}\n`,
  );
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});

