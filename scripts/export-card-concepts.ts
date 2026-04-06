import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type CardRecord = {
  id: string;
  name: string;
  title: string | null;
  slug: string;
  setId: string;
  typeLine: string;
  status: string;
};

type ListEntry = {
  sourceFile: string;
  listName: string;
  section: string;
  isImplemented: boolean;
  originalName: string;
  simpleName: string;
  title: string | null;
  typeLine: string;
  concept: string;
  cardId: string | null;
  cardSetId: string | null;
  cardStatus: string | null;
};

type ConceptRule = {
  matcher: RegExp;
  concept: string;
};

const CARD_LIST_DIRECTORY = ["docs", "content", "biblical-series"];
const CARD_DATA_DIRECTORY = ["data", "cards"];
const OUTPUT_DIRECTORY = ["exports", "card-concepts"];
const OUTPUT_FILENAME = "all-card-concepts.csv";

const CONCEPT_RULES: ConceptRule[] = [
  {
    matcher: /MESSIANIC_FULFILLMENT_CARD_LIST\.md$/,
    concept: "Gospels",
  },
  {
    matcher: /EARLY_WORLD_CARD_LIST\.md$/,
    concept: "Genesis",
  },
  {
    matcher: /PATRIARCHS_CARD_LIST\.md$/,
    concept: "Genesis",
  },
];

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedEntries = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return listFiles(entryPath);
      }

      if (entry.isFile()) {
        return [entryPath];
      }

      return [];
    }),
  );

  return nestedEntries.flat().sort((left, right) => left.localeCompare(right));
}

function normalizeText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[’']/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function parseSimpleNameAndTitle(rawName: string): {
  simpleName: string;
  title: string | null;
} {
  const parts = rawName.split(", ");

  if (parts.length < 2) {
    return {
      simpleName: rawName,
      title: null,
    };
  }

  return {
    simpleName: parts[0],
    title: parts.slice(1).join(", "),
  };
}

function buildCardLookup(cards: CardRecord[]): Map<string, CardRecord> {
  const lookup = new Map<string, CardRecord>();

  for (const card of cards) {
    const combinedName = card.title ? `${card.name}, ${card.title}` : card.name;
    const candidates = new Set<string>([
      normalizeText(combinedName),
      normalizeText(card.name),
      normalizeText(card.slug.replaceAll("_", " ")),
    ]);

    for (const candidate of candidates) {
      if (!lookup.has(candidate)) {
        lookup.set(candidate, card);
      }
    }
  }

  return lookup;
}

function resolveConcept(filePath: string): string {
  const matchedRule = CONCEPT_RULES.find((rule) => rule.matcher.test(filePath));
  return matchedRule?.concept ?? "Biblical";
}

function parseListName(markdown: string, filePath: string): string {
  const headingMatch = markdown.match(/^#\s+(.+)$/m);

  if (headingMatch) {
    return headingMatch[1].trim();
  }

  return path.basename(filePath, ".md");
}

function parseEntriesFromMarkdown(
  markdown: string,
  sourceFile: string,
  cardLookup: Map<string, CardRecord>,
): ListEntry[] {
  const lines = markdown.split(/\r?\n/);
  const entries: ListEntry[] = [];
  const listName = parseListName(markdown, sourceFile);
  const concept = resolveConcept(sourceFile);
  let currentSection = "Uncategorized";

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    const entryMatch = line.match(/^- \[(x| )\] (.+?)\s+—\s+`(.+)`$/);
    if (!entryMatch) {
      continue;
    }

    const rawName = entryMatch[2].trim();
    const { simpleName, title } = parseSimpleNameAndTitle(rawName);
    const matchedCard = cardLookup.get(normalizeText(rawName));

    entries.push({
      sourceFile,
      listName,
      section: currentSection,
      isImplemented: entryMatch[1] === "x",
      originalName: rawName,
      simpleName,
      title,
      typeLine: entryMatch[3].trim(),
      concept,
      cardId: matchedCard?.id ?? null,
      cardSetId: matchedCard?.setId ?? null,
      cardStatus: matchedCard?.status ?? null,
    });
  }

  return entries;
}

async function loadCards(cardsDirectory: string): Promise<CardRecord[]> {
  const files = (await listFiles(cardsDirectory)).filter((filePath) =>
    filePath.endsWith(".json"),
  );

  const cards = await Promise.all(
    files.map(async (filePath) => {
      const raw = await readFile(filePath, "utf8");
      return JSON.parse(raw) as CardRecord;
    }),
  );

  return cards.sort((left, right) => left.id.localeCompare(right.id));
}

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

function serializeCsv(entries: ListEntry[]): string {
  const header = ["simple_name", "where_its_from"];

  const rows = entries.map((entry) => [entry.simpleName, entry.concept]);

  return [header, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
}

async function main(): Promise<void> {
  const rootDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
  );
  const cardListsDirectory = path.join(rootDir, ...CARD_LIST_DIRECTORY);
  const cardsDirectory = path.join(rootDir, ...CARD_DATA_DIRECTORY);
  const outputDirectory = path.join(rootDir, ...OUTPUT_DIRECTORY);

  if (!(await pathExists(cardListsDirectory))) {
    throw new Error(`Card list directory not found: ${cardListsDirectory}`);
  }

  if (!(await pathExists(cardsDirectory))) {
    throw new Error(`Card data directory not found: ${cardsDirectory}`);
  }

  const allFiles = await listFiles(cardListsDirectory);
  const cardListFiles = allFiles.filter((filePath) =>
    filePath.endsWith("_CARD_LIST.md"),
  );

  if (cardListFiles.length === 0) {
    throw new Error(`No card list markdown files found in ${cardListsDirectory}`);
  }

  const cards = await loadCards(cardsDirectory);
  const cardLookup = buildCardLookup(cards);
  const parsedEntries = (
    await Promise.all(
      cardListFiles.map(async (filePath) => {
        const markdown = await readFile(filePath, "utf8");
        return parseEntriesFromMarkdown(
          markdown,
          path.relative(rootDir, filePath),
          cardLookup,
        );
      }),
    )
  )
    .flat()
    .sort((left, right) => {
      return (
        left.concept.localeCompare(right.concept) ||
        left.listName.localeCompare(right.listName) ||
        left.section.localeCompare(right.section) ||
        left.simpleName.localeCompare(right.simpleName) ||
        left.originalName.localeCompare(right.originalName)
      );
    });

  await mkdir(outputDirectory, { recursive: true });

  const outputPath = path.join(outputDirectory, OUTPUT_FILENAME);
  await writeFile(outputPath, `${serializeCsv(parsedEntries)}\n`, "utf8");

  console.log(
    `Wrote ${parsedEntries.length} concept rows to ${path.relative(rootDir, outputPath)}`,
  );
}

await main();
