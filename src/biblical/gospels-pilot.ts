import { readFile } from "node:fs/promises";

export type GospelBook = "Matthew" | "Mark" | "Luke" | "John";

export type GospelVerse = {
  chapter: number;
  verse: number;
  text: string;
};

export type GospelChapter = {
  chapter: number;
  verses: GospelVerse[];
  text: string;
};

export type GospelBookConfig = {
  book: GospelBook;
  bookNumber: number;
  chapterCount: number;
  rawSourcePath: string;
  normalizedSourcePath: string;
};

export type GospelsSourceManifest = {
  sourcePeriod: "Gospels";
  books: GospelBookConfig[];
};

export type GospelSourceDocument = {
  book: GospelBook;
  chapters: GospelChapter[];
};

export type GospelsSourceDocument = {
  manifest: GospelsSourceManifest;
  books: GospelSourceDocument[];
};

export type GospelsConceptCategory =
  | "Person"
  | "Place"
  | "Relic"
  | "Item"
  | "Event"
  | "Creature"
  | "Miracle"
  | "Judgment"
  | "Law/Rite"
  | "Theme/Symbol";

export type GospelsConceptRecord = {
  simple_name: string;
  source_book: GospelBook;
  source_period: "Gospels";
  category: GospelsConceptCategory;
  chapter_start: number;
  chapter_end: number;
  confidence: number;
  notes: string;
};

export const GOSPELS_SOURCE_PERIOD = "Gospels";

export const GOSPEL_BOOK_CONFIGS: readonly GospelBookConfig[] = [
  {
    book: "Matthew",
    bookNumber: 40,
    chapterCount: 28,
    rawSourcePath: "data/sources/kjv/matthew.raw.txt",
    normalizedSourcePath: "data/sources/kjv/matthew.json",
  },
  {
    book: "Mark",
    bookNumber: 41,
    chapterCount: 16,
    rawSourcePath: "data/sources/kjv/mark.raw.txt",
    normalizedSourcePath: "data/sources/kjv/mark.json",
  },
  {
    book: "Luke",
    bookNumber: 42,
    chapterCount: 24,
    rawSourcePath: "data/sources/kjv/luke.raw.txt",
    normalizedSourcePath: "data/sources/kjv/luke.json",
  },
  {
    book: "John",
    bookNumber: 43,
    chapterCount: 21,
    rawSourcePath: "data/sources/kjv/john.raw.txt",
    normalizedSourcePath: "data/sources/kjv/john.json",
  },
] as const;

export const GOSPELS_CHAPTER_BANDS = GOSPEL_BOOK_CONFIGS.map((config) => ({
  book: config.book,
  start: 1,
  end: config.chapterCount,
})) as readonly { book: GospelBook; start: number; end: number }[];

export const GOSPELS_HYBRID_WORKFLOW = [
  "Start with a fast curated brainstorm of obvious Gospel card concepts before doing any verse-by-verse pass.",
  "Use the brainstorm as a seed checklist while scanning Matthew, Mark, Luke, and John for missing people, places, miracles, items, parables, and themes.",
  "Merge duplicate or overlapping concepts across books into the single strongest card-facing label instead of keeping every retelling.",
  "Keep the canonical JSON rich and traceable, then emit one intermediate CSV for downstream card work.",
] as const;

export const GOSPELS_REQUIRED_ANCHORS = [
  "Jesus Christ",
  "Mary",
  "John the Baptist",
  "Peter",
  "Bethlehem",
  "Nazareth",
  "Jordan River",
  "Water into Wine",
  "Feeding of the Five Thousand",
  "The Good Samaritan",
  "The Prodigal Son",
  "Transfiguration",
  "Triumphal Entry",
  "The Last Supper",
  "Gethsemane",
  "Crucifixion",
  "Resurrection",
  "Road to Emmaus",
  "Great Commission",
  "Ascension",
] as const;

const GOSPELS_CATEGORY_SET = new Set<GospelsConceptCategory>([
  "Person",
  "Place",
  "Relic",
  "Item",
  "Event",
  "Creature",
  "Miracle",
  "Judgment",
  "Law/Rite",
  "Theme/Symbol",
]);

const GOSPEL_BOOK_SET = new Set<GospelBook>(GOSPEL_BOOK_CONFIGS.map((config) => config.book));

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeConceptKey(value: string): string {
  return normalizeWhitespace(value)
    .normalize("NFKD")
    .replace(/[’']/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .toLowerCase();
}

export function getGospelBookConfig(book: GospelBook): GospelBookConfig {
  const config = GOSPEL_BOOK_CONFIGS.find((candidate) => candidate.book === book);

  if (!config) {
    throw new Error(`Missing configuration for Gospel book "${book}".`);
  }

  return config;
}

export function parseGospelRawSource(rawText: string, config: GospelBookConfig): GospelChapter[] {
  const cleanedText = rawText.replace(/^\uFEFF/, "");
  const lines = cleanedText.split(/\r?\n/);
  const verses: GospelVerse[] = [];
  const verseLinePattern = new RegExp(
    `^${String(config.bookNumber).padStart(2, "0")}:(\\d{3}):(\\d{3})\\s+(.*)$`,
  );
  let currentVerse: GospelVerse | null = null;
  let inBookBody = false;

  for (const line of lines) {
    if (!inBookBody) {
      if (line.includes(`Book ${String(config.bookNumber).padStart(2, "0")}`) && line.includes(config.book)) {
        inBookBody = true;
      }
      continue;
    }

    if (line.includes("*** END OF THE PROJECT GUTENBERG EBOOK")) {
      break;
    }

    const verseMatch = line.match(verseLinePattern);

    if (verseMatch) {
      const chapter = Number.parseInt(verseMatch[1], 10);
      const verse = Number.parseInt(verseMatch[2], 10);
      const text = normalizeWhitespace(verseMatch[3]);

      currentVerse = { chapter, verse, text };
      verses.push(currentVerse);
      continue;
    }

    if (currentVerse && line.trim().length > 0) {
      currentVerse.text = normalizeWhitespace(`${currentVerse.text} ${line.trim()}`);
    }
  }

  const chapters = new Map<number, GospelVerse[]>();

  for (const verse of verses) {
    const chapterVerses = chapters.get(verse.chapter) ?? [];
    chapterVerses.push(verse);
    chapters.set(verse.chapter, chapterVerses);
  }

  return [...chapters.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([chapter, chapterVerses]) => ({
      chapter,
      verses: chapterVerses.sort((left, right) => left.verse - right.verse),
      text: chapterVerses.map((verse) => `${verse.verse}. ${verse.text}`).join("\n"),
    }));
}

export function validateGospelChapters(book: GospelBook, chapters: GospelChapter[]): void {
  const config = getGospelBookConfig(book);

  if (chapters.length !== config.chapterCount) {
    throw new Error(
      `Expected ${config.chapterCount} chapters in ${book}, found ${chapters.length}.`,
    );
  }

  const chapterMap = new Map(chapters.map((chapter) => [chapter.chapter, chapter]));

  for (let chapter = 1; chapter <= config.chapterCount; chapter += 1) {
    const chapterRecord = chapterMap.get(chapter);

    if (!chapterRecord) {
      throw new Error(`Missing ${book} chapter ${chapter}.`);
    }

    if (chapterRecord.verses.length === 0) {
      throw new Error(`${book} chapter ${chapter} did not contain any verses.`);
    }
  }
}

export function validateGospelsChapterBands(): void {
  for (const config of GOSPEL_BOOK_CONFIGS) {
    const coveredChapters = new Map<number, number>();

    for (const band of GOSPELS_CHAPTER_BANDS.filter((candidate) => candidate.book === config.book)) {
      for (let chapter = band.start; chapter <= band.end; chapter += 1) {
        coveredChapters.set(chapter, (coveredChapters.get(chapter) ?? 0) + 1);
      }
    }

    for (let chapter = 1; chapter <= config.chapterCount; chapter += 1) {
      if (coveredChapters.get(chapter) !== 1) {
        throw new Error(`Expected ${config.book} chapter ${chapter} to be assigned exactly once.`);
      }
    }
  }
}

export function buildGospelsManifest(): GospelsSourceManifest {
  return {
    sourcePeriod: GOSPELS_SOURCE_PERIOD,
    books: [...GOSPEL_BOOK_CONFIGS],
  };
}

export async function loadGospelsSourceDocument(filePath: string): Promise<GospelsSourceDocument> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as GospelsSourceDocument;
}

export async function loadGospelsConceptRecords(filePath: string): Promise<GospelsConceptRecord[]> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as GospelsConceptRecord[];
}

export function validateGospelsConceptRecords(records: GospelsConceptRecord[]): void {
  const seenKeys = new Set<string>();

  for (const record of records) {
    if (normalizeWhitespace(record.simple_name).length === 0) {
      throw new Error("Encountered a blank simple_name in Gospel concept records.");
    }

    if (!GOSPEL_BOOK_SET.has(record.source_book)) {
      throw new Error(`Unexpected source_book "${record.source_book}".`);
    }

    if (record.source_period !== GOSPELS_SOURCE_PERIOD) {
      throw new Error(`Unexpected source_period "${record.source_period}".`);
    }

    if (!GOSPELS_CATEGORY_SET.has(record.category)) {
      throw new Error(`Unexpected Gospel concept category "${record.category}".`);
    }

    const config = getGospelBookConfig(record.source_book);

    if (
      record.chapter_start < 1 ||
      record.chapter_start > config.chapterCount ||
      record.chapter_end < 1 ||
      record.chapter_end > config.chapterCount ||
      record.chapter_start > record.chapter_end
    ) {
      throw new Error(
        `Invalid ${record.source_book} chapter span ${record.chapter_start}-${record.chapter_end} for "${record.simple_name}".`,
      );
    }

    if (record.confidence < 0 || record.confidence > 1) {
      throw new Error(`Invalid confidence for "${record.simple_name}".`);
    }

    const duplicateKey = normalizeConceptKey(record.simple_name);

    if (seenKeys.has(duplicateKey)) {
      throw new Error(`Duplicate Gospel concept record "${record.simple_name}".`);
    }

    seenKeys.add(duplicateKey);
  }
}

export function ensureGospelsRequiredAnchors(records: GospelsConceptRecord[]): void {
  const recordNames = new Set(records.map((record) => normalizeConceptKey(record.simple_name)));

  for (const anchor of GOSPELS_REQUIRED_ANCHORS) {
    if (!recordNames.has(normalizeConceptKey(anchor))) {
      throw new Error(`Missing required Gospel anchor "${anchor}".`);
    }
  }
}

export function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

export function serializeGospelsIntermediateCsv(records: GospelsConceptRecord[]): string {
  const rows = [
    [
      "simple_name",
      "source_book",
      "source_period",
      "category",
      "chapter_start",
      "chapter_end",
      "confidence",
      "notes",
    ].join(","),
    ...records.map((record) =>
      [
        record.simple_name,
        record.source_book,
        record.source_period,
        record.category,
        String(record.chapter_start),
        String(record.chapter_end),
        record.confidence.toFixed(2),
        record.notes,
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ];

  return `${rows.join("\n")}\n`;
}
