import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

type CategoryMember = {
  pageid: number;
  ns: number;
  title: string;
  type?: "page" | "subcat" | "file";
};

type CategoryMembersResponse = {
  continue?: {
    cmcontinue?: string;
  };
  query?: {
    categorymembers?: CategoryMember[];
  };
};

type PageCategory = {
  title: string;
};

type QueryPage = {
  pageid?: number;
  ns?: number;
  title: string;
  categories?: PageCategory[];
};

type CategoriesResponse = {
  query?: {
    pages?: Record<string, QueryPage>;
  };
};

type PersonRecord = {
  rawTitle: string;
  simpleName: string;
  whereItsFrom: string;
  category: string;
};

const API_URL = "https://bible.fandom.com/api.php";
const OUTPUT_DIRECTORY = ["exports", "bible-wiki-people"];
const OUTPUT_FILENAME = "people.csv";
const CATEGORY_FIELD = "Person";
const ROOT_CATEGORY = "Category:People";
const PAGE_BATCH_SIZE = 50;

const BOOK_ORDER = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
  "Tobit",
  "Judith",
  "Wisdom",
  "Sirach",
  "Baruch",
  "1 Maccabees",
  "2 Maccabees",
];

const GOSPELS = new Set(["Matthew", "Mark", "Luke", "John"]);
const OLD_TESTAMENT_BOOKS = new Set(BOOK_ORDER.slice(0, 39));
const NEW_TESTAMENT_BOOKS = new Set(BOOK_ORDER.slice(39, 66));
const DEUTEROCANONICAL_BOOKS = new Set(BOOK_ORDER.slice(66));

const BOOK_ALIASES = new Map<string, string>(
  BOOK_ORDER.flatMap((book) => {
    const variants = new Set<string>([
      book,
      `Book of ${book}`,
      `People in ${book}`,
      `People in the Book of ${book}`,
      `${book} people`,
    ]);

    if (GOSPELS.has(book)) {
      variants.add(`Gospel of ${book}`);
      variants.add(`People in the Gospel of ${book}`);
    }

    return [...variants].map((variant) => [variant.toLowerCase(), book]);
  }),
);

function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

function serializeCsv(records: PersonRecord[]): string {
  const rows = [
    ["simple_name", "where_its_from", "category"].join(","),
    ...records.map((record) =>
      [
        record.simpleName,
        record.whereItsFrom,
        record.category,
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ];

  return `${rows.join("\n")}\n`;
}

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

async function fetchJson<T>(params: URLSearchParams): Promise<T> {
  params.set("format", "json");
  const response = await fetch(`${API_URL}?${params.toString()}`, {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Bible Wiki API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchCategoryMembers(categoryTitle: string): Promise<CategoryMember[]> {
  const members: CategoryMember[] = [];
  let cmcontinue: string | undefined;

  do {
    const params = new URLSearchParams({
      action: "query",
      list: "categorymembers",
      cmtitle: categoryTitle,
      cmlimit: "max",
      cmprop: "ids|title|type",
    });

    if (cmcontinue) {
      params.set("cmcontinue", cmcontinue);
    }

    const payload = await fetchJson<CategoryMembersResponse>(params);
    members.push(...(payload.query?.categorymembers ?? []));
    cmcontinue = payload.continue?.cmcontinue;
  } while (cmcontinue);

  return members;
}

async function crawlPeoplePages(): Promise<Map<number, string>> {
  const pendingCategories = [ROOT_CATEGORY];
  const visitedCategories = new Set<string>();
  const pages = new Map<number, string>();

  while (pendingCategories.length > 0) {
    const categoryTitle = pendingCategories.shift();

    if (!categoryTitle || visitedCategories.has(categoryTitle)) {
      continue;
    }

    visitedCategories.add(categoryTitle);

    const members = await fetchCategoryMembers(categoryTitle);

    for (const member of members) {
      if (member.ns === 14 || member.type === "subcat") {
        if (!visitedCategories.has(member.title)) {
          pendingCategories.push(member.title);
        }
        continue;
      }

      if (member.ns === 0) {
        pages.set(member.pageid, member.title);
      }
    }
  }

  return pages;
}

async function fetchPageCategories(pageTitles: string[]): Promise<Map<string, string[]>> {
  const categoryLookup = new Map<string, string[]>();

  for (const batch of chunk(pageTitles, PAGE_BATCH_SIZE)) {
    const params = new URLSearchParams({
      action: "query",
      prop: "categories",
      titles: batch.join("|"),
      cllimit: "max",
      clshow: "!hidden",
    });

    const payload = await fetchJson<CategoriesResponse>(params);
    const pages = Object.values(payload.query?.pages ?? {});

    for (const page of pages) {
      categoryLookup.set(
        page.title,
        (page.categories ?? []).map((category) => category.title),
      );
    }
  }

  return categoryLookup;
}

function simplifyName(title: string): string {
  return title
    .replace(/,\s+.+$/u, "")
    .replace(/\s*\([^)]*\)\s*$/u, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function normalizeCategoryTitle(categoryTitle: string): string {
  return categoryTitle.replace(/^Category:/u, "").trim();
}

function extractBooksFromCategory(categoryName: string): string[] {
  const normalized = normalizeCategoryTitle(categoryName);
  const matches = new Set<string>();
  const directBook = BOOK_ALIASES.get(normalized.toLowerCase());

  if (directBook) {
    matches.add(directBook);
  }

  for (const book of BOOK_ORDER) {
    const patterns = [
      new RegExp(`(^|\\b)${escapeRegExp(book)}(\\b|$)`, "i"),
      new RegExp(`Book of ${escapeRegExp(book)}`, "i"),
      new RegExp(`Gospel of ${escapeRegExp(book)}`, "i"),
      new RegExp(`People in (the )?(Book of |Gospel of )?${escapeRegExp(book)}`, "i"),
      new RegExp(`${escapeRegExp(book)} people`, "i"),
    ];

    if (patterns.some((pattern) => pattern.test(normalized))) {
      matches.add(book);
    }
  }

  return [...matches];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function inferWhereItsFrom(categoryTitles: string[]): string {
  const normalizedCategories = categoryTitles.map(normalizeCategoryTitle);
  const bookMatches = new Set<string>();
  const hasOldTestamentCategory = normalizedCategories.some((category) =>
    /(^|\b)old testament(\b|$)/i.test(category),
  );
  const hasNewTestamentCategory = normalizedCategories.some((category) =>
    /(^|\b)new testament(\b|$)/i.test(category),
  );

  for (const categoryTitle of categoryTitles) {
    for (const match of extractBooksFromCategory(categoryTitle)) {
      bookMatches.add(match);
    }
  }

  const oldTestamentBooks = [...bookMatches].filter((book) =>
    OLD_TESTAMENT_BOOKS.has(book),
  );
  const newTestamentBooks = [...bookMatches].filter((book) =>
    NEW_TESTAMENT_BOOKS.has(book),
  );
  const deuterocanonicalBooks = [...bookMatches].filter((book) =>
    DEUTEROCANONICAL_BOOKS.has(book),
  );

  if (hasOldTestamentCategory && oldTestamentBooks.length > 0) {
    return pickPreferredBook(oldTestamentBooks);
  }

  if (hasNewTestamentCategory && newTestamentBooks.length > 0) {
    return pickPreferredBook(newTestamentBooks);
  }

  if (hasOldTestamentCategory && newTestamentBooks.length > 0) {
    return "Old Testament";
  }

  if (hasNewTestamentCategory && oldTestamentBooks.length > 0) {
    return "New Testament";
  }

  if (oldTestamentBooks.length > 0) {
    return pickPreferredBook(oldTestamentBooks);
  }

  if (newTestamentBooks.length > 0) {
    return pickPreferredBook(newTestamentBooks);
  }

  if (deuterocanonicalBooks.length > 0) {
    return pickPreferredBook(deuterocanonicalBooks);
  }

  if (hasOldTestamentCategory) {
    return "Old Testament";
  }

  if (hasNewTestamentCategory) {
    return "New Testament";
  }

  return "Unknown";
}

function pickPreferredBook(matches: string[]): string {
  const uniqueMatches = [...new Set(matches)];

  if (uniqueMatches.length > 1 && uniqueMatches.every((book) => GOSPELS.has(book))) {
    return "Gospels";
  }

  return uniqueMatches.sort(
    (left, right) => BOOK_ORDER.indexOf(left) - BOOK_ORDER.indexOf(right),
  )[0];
}

async function main(): Promise<void> {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDirectory, "..", "..");
  const outputDirectory = path.join(projectRoot, ...OUTPUT_DIRECTORY);
  const outputPath = path.join(outputDirectory, OUTPUT_FILENAME);

  const pages = await crawlPeoplePages();
  const pageTitles = [...pages.values()].sort((left, right) =>
    left.localeCompare(right),
  );
  const categoryLookup = await fetchPageCategories(pageTitles);

  const records = pageTitles
    .map((pageTitle) => ({
      rawTitle: pageTitle,
      simpleName: simplifyName(pageTitle),
      whereItsFrom: inferWhereItsFrom(categoryLookup.get(pageTitle) ?? []),
      category: CATEGORY_FIELD,
    }))
    .sort((left, right) => left.rawTitle.localeCompare(right.rawTitle));

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, serializeCsv(records), "utf8");

  console.log(
    JSON.stringify(
      {
        outputPath,
        recordCount: records.length,
      },
      null,
      2,
    ),
  );
}

await main();
