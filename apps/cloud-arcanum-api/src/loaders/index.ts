import { readdir, readFile, stat } from "node:fs/promises";
import { basename, relative, resolve } from "node:path";

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
} from "../../../../src/domain/index.js";
import type { ValidationMessage } from "../../../../src/cloud-arcanum/api-contract.js";

export type CloudArcanumApiPaths = {
  workspaceRoot: string;
  dataRoot: string;
  imagesRoot: string;
  cardImagesRoot: string;
};

export type CloudArcanumApiLoaders = {
  paths: CloudArcanumApiPaths;
  loadCards: () => Promise<LoadedEntityCollection<Card>>;
  loadDecks: () => Promise<LoadedEntityCollection<Deck>>;
  loadSets: () => Promise<LoadedEntityCollection<SetRecord>>;
  loadUniverses: () => Promise<LoadedEntityCollection<Universe>>;
  loadCardImages: () => Promise<LoadedImageCollection>;
  loadSnapshot: () => Promise<CloudArcanumApiDataSnapshot>;
};

export type CloudArcanumApiLoaderOptions = {
  workspaceRoot?: string;
};

type EntityDirectoryKind = "cards" | "decks" | "sets" | "universes";

type LoadedEntityMap = {
  cards: Card;
  decks: Deck;
  sets: SetRecord;
  universes: Universe;
};

type EntityDirectoryTarget<TKind extends EntityDirectoryKind> = {
  directory: string;
  kind: TKind;
  schema: ZodTypeAny;
};

export type LoadedEntityRecord<TRecord> = {
  data: TRecord;
  filePath: string;
  relativeFilePath: string;
};

export type LoadedEntityCollection<TRecord> = {
  issues: ValidationMessage[];
  records: LoadedEntityRecord<TRecord>[];
};

export type LoadedImageRecord = {
  filePath: string;
  relativeFilePath: string;
};

export type LoadedImageCollection = {
  issues: ValidationMessage[];
  records: LoadedImageRecord[];
};

export type CloudArcanumApiDataSnapshot = {
  cards: LoadedEntityRecord<Card>[];
  decks: LoadedEntityRecord<Deck>[];
  sets: LoadedEntityRecord<SetRecord>[];
  universes: LoadedEntityRecord<Universe>[];
  cardImages: LoadedImageRecord[];
  issues: ValidationMessage[];
};

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listFilesRecursively(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(directory, entry.name);

      if (entry.isDirectory()) {
        return listFilesRecursively(entryPath);
      }

      if (entry.isFile()) {
        return [entryPath];
      }

      return [];
    }),
  );

  return nestedFiles.flat().sort((left, right) => left.localeCompare(right));
}

function formatIssuePath(issuePath: (string | number)[]): string {
  if (issuePath.length === 0) {
    return "";
  }

  return issuePath
    .map((segment) => (typeof segment === "number" ? `[${segment}]` : `.${segment}`))
    .join("")
    .replace(/^\./, "");
}

function createMissingDirectoryIssue(
  workspaceRoot: string,
  directory: string,
): ValidationMessage {
  return {
    file: relative(workspaceRoot, directory),
    message: "Directory not found.",
  };
}

async function loadEntityDirectory<TKind extends EntityDirectoryKind>(
  workspaceRoot: string,
  target: EntityDirectoryTarget<TKind>,
): Promise<LoadedEntityCollection<LoadedEntityMap[TKind]>> {
  if (!(await pathExists(target.directory))) {
    return {
      issues: [createMissingDirectoryIssue(workspaceRoot, target.directory)],
      records: [],
    };
  }

  const issues: ValidationMessage[] = [];
  const records: LoadedEntityRecord<LoadedEntityMap[TKind]>[] = [];
  const files = (await listFilesRecursively(target.directory)).filter((filePath) =>
    filePath.endsWith(".json"),
  );

  for (const filePath of files) {
    const relativeFilePath = relative(workspaceRoot, filePath);
    const raw = await readFile(filePath, "utf8");

    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      issues.push({
        file: relativeFilePath,
        message: `Invalid JSON: ${detail}`,
      });
      continue;
    }

    const result = target.schema.safeParse(json);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const issuePath = formatIssuePath(issue.path);
        issues.push({
          file: relativeFilePath,
          message: issuePath ? `${issuePath}: ${issue.message}` : issue.message,
        });
      }
      continue;
    }

    records.push({
      data: result.data as LoadedEntityMap[TKind],
      filePath,
      relativeFilePath,
    });
  }

  return {
    issues,
    records,
  };
}

async function loadImageDirectory(
  workspaceRoot: string,
  directory: string,
): Promise<LoadedImageCollection> {
  if (!(await pathExists(directory))) {
    return {
      issues: [createMissingDirectoryIssue(workspaceRoot, directory)],
      records: [],
    };
  }

  const records = (await listFilesRecursively(directory))
    .filter((filePath) => basename(filePath) !== ".gitkeep")
    .map((filePath) => ({
      filePath,
      relativeFilePath: relative(workspaceRoot, filePath),
    }));

  return {
    issues: [],
    records,
  };
}

export function createCloudArcanumApiLoaders(
  options: CloudArcanumApiLoaderOptions = {},
): CloudArcanumApiLoaders {
  const workspaceRoot = resolve(options.workspaceRoot ?? process.cwd());
  const paths = {
    workspaceRoot,
    dataRoot: resolve(workspaceRoot, "data"),
    imagesRoot: resolve(workspaceRoot, "images"),
    cardImagesRoot: resolve(workspaceRoot, "images", "cards"),
  };

  const loadCards = async (): Promise<LoadedEntityCollection<Card>> =>
    loadEntityDirectory(workspaceRoot, {
      directory: resolve(paths.dataRoot, "cards"),
      kind: "cards",
      schema: cardSchema,
    });

  const loadDecks = async (): Promise<LoadedEntityCollection<Deck>> =>
    loadEntityDirectory(workspaceRoot, {
      directory: resolve(paths.dataRoot, "decks"),
      kind: "decks",
      schema: deckSchema,
    });

  const loadSets = async (): Promise<LoadedEntityCollection<SetRecord>> =>
    loadEntityDirectory(workspaceRoot, {
      directory: resolve(paths.dataRoot, "sets"),
      kind: "sets",
      schema: setSchema,
    });

  const loadUniverses = async (): Promise<LoadedEntityCollection<Universe>> =>
    loadEntityDirectory(workspaceRoot, {
      directory: resolve(paths.dataRoot, "universes"),
      kind: "universes",
      schema: universeSchema,
    });

  const loadCardImages = async (): Promise<LoadedImageCollection> =>
    loadImageDirectory(workspaceRoot, paths.cardImagesRoot);

  const loadSnapshot = async (): Promise<CloudArcanumApiDataSnapshot> => {
    const [cards, decks, sets, universes, cardImages] = await Promise.all([
      loadCards(),
      loadDecks(),
      loadSets(),
      loadUniverses(),
      loadCardImages(),
    ]);

    return {
      cards: cards.records,
      decks: decks.records,
      sets: sets.records,
      universes: universes.records,
      cardImages: cardImages.records,
      issues: [
        ...cards.issues,
        ...decks.issues,
        ...sets.issues,
        ...universes.issues,
        ...cardImages.issues,
      ],
    };
  };

  return {
    paths,
    loadCards,
    loadDecks,
    loadSets,
    loadUniverses,
    loadCardImages,
    loadSnapshot,
  };
}
