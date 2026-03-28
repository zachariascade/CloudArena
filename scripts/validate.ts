import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ZodTypeAny } from "zod";

import {
  cardSchema,
  deckSchema,
  setSchema,
  universeSchema,
  type Card,
  type Deck,
  type SetRecord,
  type Universe,
} from "../src/domain/index.js";

type EntityKind = "cards" | "decks" | "sets" | "universes";

type ParsedEntityMap = {
  cards: Card;
  decks: Deck;
  sets: SetRecord;
  universes: Universe;
};

type ValidationTarget<TKind extends EntityKind> = {
  kind: TKind;
  directory: string;
  schema: ZodTypeAny;
};

export type ValidationMessage = {
  file?: string;
  message: string;
};

type ParsedRecord<TKind extends EntityKind> = {
  file: string;
  data: ParsedEntityMap[TKind];
};

export type ValidationResult = {
  counts: {
    universes: number;
    sets: number;
    cards: number;
    decks: number;
    totalFiles: number;
  };
  errors: ValidationMessage[];
};

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listJsonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return listJsonFiles(entryPath);
      }

      if (entry.isFile() && entry.name.endsWith(".json")) {
        return [entryPath];
      }

      return [];
    }),
  );

  return nestedFiles.flat().sort((left, right) => left.localeCompare(right));
}

function relativePath(rootDir: string, filePath: string): string {
  return path.relative(rootDir, filePath);
}

function formatIssuePath(issuePath: (string | number)[]): string {
  if (issuePath.length === 0) {
    return "";
  }

  return issuePath
    .map((segment) =>
      typeof segment === "number" ? `[${segment}]` : `.${segment}`,
    )
    .join("")
    .replace(/^\./, "");
}

async function parseTarget<TKind extends EntityKind>(
  target: ValidationTarget<TKind>,
  rootDir: string,
  errors: ValidationMessage[],
): Promise<ParsedRecord<TKind>[]> {
  if (!(await pathExists(target.directory))) {
    return [];
  }

  const files = await listJsonFiles(target.directory);
  const parsed: ParsedRecord<TKind>[] = [];

  for (const file of files) {
    const displayFile = relativePath(rootDir, file);
    const raw = await readFile(file, "utf8");

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      errors.push({
        file: displayFile,
        message: `Invalid JSON: ${detail}`,
      });
      continue;
    }

    const result = target.schema.safeParse(json);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const issuePath = formatIssuePath(issue.path);
        errors.push({
          file: displayFile,
          message: issuePath ? `${issuePath}: ${issue.message}` : issue.message,
        });
      }
      continue;
    }

    const filenameId = path
      .basename(file, ".json")
      .split("_")
      .slice(0, 2)
      .join("_");

    if (filenameId !== result.data.id) {
      errors.push({
        file: displayFile,
        message: `Filename ID prefix "${filenameId}" does not match record id "${result.data.id}".`,
      });
    }

    parsed.push({
      file,
      data: result.data as ParsedEntityMap[TKind],
    });
  }

  return parsed;
}

function checkDuplicateIds<TKind extends EntityKind>(
  kind: TKind,
  records: ParsedRecord<TKind>[],
  rootDir: string,
  errors: ValidationMessage[],
): void {
  const seen = new Map<string, string>();

  for (const record of records) {
    const currentFile = relativePath(rootDir, record.file);
    const previousFile = seen.get(record.data.id);

    if (previousFile) {
      errors.push({
        file: currentFile,
        message: `Duplicate ${kind.slice(0, -1)} id "${record.data.id}" also found in ${previousFile}.`,
      });
      continue;
    }

    seen.set(record.data.id, currentFile);
  }
}

function validateRelationships(
  universes: ParsedRecord<"universes">[],
  sets: ParsedRecord<"sets">[],
  cards: ParsedRecord<"cards">[],
  decks: ParsedRecord<"decks">[],
  rootDir: string,
  errors: ValidationMessage[],
): void {
  const universeIds = new Set(universes.map((record) => record.data.id));
  const setIds = new Set(sets.map((record) => record.data.id));
  const cardIds = new Set(cards.map((record) => record.data.id));

  for (const record of sets) {
    if (!universeIds.has(record.data.universeId)) {
      errors.push({
        file: relativePath(rootDir, record.file),
        message: `Unknown universeId "${record.data.universeId}".`,
      });
    }
  }

  for (const record of cards) {
    if (!setIds.has(record.data.setId)) {
      errors.push({
        file: relativePath(rootDir, record.file),
        message: `Unknown setId "${record.data.setId}".`,
      });
    }
  }

  for (const record of decks) {
    if (!universeIds.has(record.data.universeId)) {
      errors.push({
        file: relativePath(rootDir, record.file),
        message: `Unknown universeId "${record.data.universeId}".`,
      });
    }

    for (const setId of record.data.setIds) {
      if (!setIds.has(setId)) {
        errors.push({
          file: relativePath(rootDir, record.file),
          message: `Unknown setId "${setId}" in deck setIds.`,
        });
      }
    }

    if (record.data.commander && !cardIds.has(record.data.commander)) {
      errors.push({
        file: relativePath(rootDir, record.file),
        message: `Unknown commander cardId "${record.data.commander}".`,
      });
    }

    for (const entry of record.data.cards) {
      if (!cardIds.has(entry.cardId)) {
        errors.push({
          file: relativePath(rootDir, record.file),
          message: `Unknown deck cardId "${entry.cardId}".`,
        });
      }
    }
  }
}

export async function validateProject(
  rootDir = process.cwd(),
): Promise<ValidationResult> {
  const errors: ValidationMessage[] = [];
  const dataRoot = path.join(rootDir, "data");

  if (!(await pathExists(dataRoot))) {
    return {
      counts: {
        universes: 0,
        sets: 0,
        cards: 0,
        decks: 0,
        totalFiles: 0,
      },
      errors,
    };
  }

  const universeTarget: ValidationTarget<"universes"> = {
    kind: "universes",
    directory: path.join(dataRoot, "universes"),
    schema: universeSchema,
  };

  const setTarget: ValidationTarget<"sets"> = {
    kind: "sets",
    directory: path.join(dataRoot, "sets"),
    schema: setSchema,
  };

  const cardTarget: ValidationTarget<"cards"> = {
    kind: "cards",
    directory: path.join(dataRoot, "cards"),
    schema: cardSchema,
  };

  const deckTarget: ValidationTarget<"decks"> = {
    kind: "decks",
    directory: path.join(dataRoot, "decks"),
    schema: deckSchema,
  };

  const [universes, sets, cards, decks] = await Promise.all([
    parseTarget(universeTarget, rootDir, errors),
    parseTarget(setTarget, rootDir, errors),
    parseTarget(cardTarget, rootDir, errors),
    parseTarget(deckTarget, rootDir, errors),
  ]);

  checkDuplicateIds("universes", universes, rootDir, errors);
  checkDuplicateIds("sets", sets, rootDir, errors);
  checkDuplicateIds("cards", cards, rootDir, errors);
  checkDuplicateIds("decks", decks, rootDir, errors);
  validateRelationships(universes, sets, cards, decks, rootDir, errors);

  return {
    counts: {
      universes: universes.length,
      sets: sets.length,
      cards: cards.length,
      decks: decks.length,
      totalFiles: universes.length + sets.length + cards.length + decks.length,
    },
    errors,
  };
}

export async function main(): Promise<void> {
  const result = await validateProject(process.cwd());

  if (result.counts.totalFiles === 0) {
    console.log("No data directory found at data/. Nothing to validate yet.");
    return;
  }

  if (result.errors.length > 0) {
    console.error(`Validation failed with ${result.errors.length} issue(s):`);

    for (const error of result.errors) {
      if (error.file) {
        console.error(`- ${error.file}: ${error.message}`);
      } else {
        console.error(`- ${error.message}`);
      }
    }

    process.exitCode = 1;
    return;
  }

  console.log(
    `Validation passed for ${result.counts.totalFiles} file(s): ${result.counts.universes} universes, ${result.counts.sets} sets, ${result.counts.cards} cards, ${result.counts.decks} decks.`,
  );
}

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  await main();
}
