import type {
  Card,
  CardStatus,
  ImageReference,
} from "../domain/index.js";

import type {
  CardSortKey,
  DeckSortKey,
  DraftReviewLabel,
  DraftStatusSummary,
  ImagePreview,
  SetSortKey,
  SortDirection,
  UniverseSortKey,
  ValidationMessage,
  ValidationSummary,
} from "./api-contract.js";

export const unresolvedMechanicsFields = [
  "manaCost",
  "manaValue",
  "oracleText",
  "rarity",
  "power",
  "toughness",
  "loyalty",
  "defense",
] as const;

export type UnresolvedMechanicsField =
  (typeof unresolvedMechanicsFields)[number];

export type DraftStatusInput = Pick<
  Card,
  | "typeLine"
  | "status"
  | "manaCost"
  | "manaValue"
  | "oracleText"
  | "rarity"
  | "power"
  | "toughness"
  | "loyalty"
  | "defense"
>;

export type ImagePreviewInput = {
  image: ImageReference;
  alt: string;
  publicUrl?: string | null;
  pathExists?: boolean;
  artist?: string | null;
  sourceUrl?: string | null;
  license?: string | null;
  creditText?: string | null;
  sourceNotes?: string | null;
  requestedThemeId?: string | null;
  resolvedThemeId?: string | null;
  fellBack?: boolean;
};

export const cardSortKeys = [
  "name",
  "updatedAt",
  "createdAt",
  "status",
] as const satisfies readonly CardSortKey[];

export const deckSortKeys = ["name", "format"] as const satisfies readonly DeckSortKey[];

export const setSortKeys = ["name", "code"] as const satisfies readonly SetSortKey[];

export const universeSortKeys = ["name"] as const satisfies readonly UniverseSortKey[];

export const sortDirections = ["asc", "desc"] as const satisfies readonly SortDirection[];

export function formatCardDisplayName(
  name: string,
  title: string | null | undefined,
): string {
  return title ? `${name}, ${title}` : name;
}

function isNullishOrEmptyString(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

function typeLineIncludes(typeLine: string, typeToken: string): boolean {
  return typeLine.toLowerCase().includes(typeToken.toLowerCase());
}

function isFieldRelevant(
  input: DraftStatusInput,
  field: UnresolvedMechanicsField,
): boolean {
  switch (field) {
    case "power":
    case "toughness":
      return typeLineIncludes(input.typeLine, "creature");
    case "loyalty":
      return typeLineIncludes(input.typeLine, "planeswalker");
    case "defense":
      return typeLineIncludes(input.typeLine, "battle");
    case "manaCost":
    case "manaValue":
    case "oracleText":
    case "rarity":
    default:
      return true;
  }
}

export function getDraftReviewLabel(
  status: CardStatus,
  hasUnresolvedMechanics: boolean,
): DraftReviewLabel {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "balanced") {
    return hasUnresolvedMechanics ? "Needs review" : "Ready for review";
  }

  if (status === "templating") {
    return "Templating";
  }

  return "Draft";
}

export function getUnresolvedMechanicsFields(
  input: DraftStatusInput,
): UnresolvedMechanicsField[] {
  return unresolvedMechanicsFields.filter(
    (field) => isFieldRelevant(input, field) && isNullishOrEmptyString(input[field]),
  );
}

export function deriveDraftStatusSummary(
  input: DraftStatusInput,
): DraftStatusSummary {
  const unresolvedFields = getUnresolvedMechanicsFields(input);
  const hasUnresolvedMechanics = unresolvedFields.length > 0;

  return {
    status: input.status,
    isDraftLike: input.status === "draft" || input.status === "templating",
    hasUnresolvedMechanics,
    unresolvedFields,
    reviewLabel: getDraftReviewLabel(input.status, hasUnresolvedMechanics),
  };
}

export function deriveValidationSummary(
  errors: ValidationMessage[] | undefined,
): ValidationSummary {
  const errorCount = errors?.length ?? 0;

  return {
    hasErrors: errorCount > 0,
    errorCount,
  };
}

export function buildImagePreview({
  image,
  alt,
  publicUrl,
  pathExists = true,
  artist,
  sourceUrl,
  license,
  creditText,
  sourceNotes,
  requestedThemeId = null,
  resolvedThemeId = null,
  fellBack = false,
}: ImagePreviewInput): ImagePreview {
  const sourcePath = image.path;
  const resolvedPublicUrl = publicUrl ?? sourcePath;
  const hasUsableSource = !isNullishOrEmptyString(sourcePath) && pathExists;
  const resolvedArtist = artist ?? image.artist ?? null;
  const resolvedSourceUrl = sourceUrl ?? image.sourceUrl ?? null;
  const resolvedLicense = license ?? image.license ?? null;
  const resolvedCreditText = creditText ?? image.creditText ?? null;
  const resolvedSourceNotes = sourceNotes ?? image.sourceNotes ?? null;

  if (!hasUsableSource) {
    return {
      kind: "missing",
      sourcePath,
      publicUrl: null,
      isRenderable: false,
      alt,
      artist: resolvedArtist,
      sourceUrl: resolvedSourceUrl,
      license: resolvedLicense,
      creditText: resolvedCreditText,
      sourceNotes: resolvedSourceNotes,
      requestedThemeId,
      resolvedThemeId,
      fellBack,
    };
  }

  return {
    kind: image.type,
    sourcePath,
    publicUrl: resolvedPublicUrl,
    isRenderable: resolvedPublicUrl !== null,
    alt,
    artist: resolvedArtist,
    sourceUrl: resolvedSourceUrl,
    license: resolvedLicense,
    creditText: resolvedCreditText,
    sourceNotes: resolvedSourceNotes,
    requestedThemeId,
    resolvedThemeId,
    fellBack,
  };
}

export function parseCardSortKey(value: string | undefined): CardSortKey | undefined {
  return cardSortKeys.find((candidate) => candidate === value);
}

export function parseDeckSortKey(value: string | undefined): DeckSortKey | undefined {
  return deckSortKeys.find((candidate) => candidate === value);
}

export function parseSetSortKey(value: string | undefined): SetSortKey | undefined {
  return setSortKeys.find((candidate) => candidate === value);
}

export function parseUniverseSortKey(
  value: string | undefined,
): UniverseSortKey | undefined {
  return universeSortKeys.find((candidate) => candidate === value);
}

export function parseSortDirection(
  value: string | undefined,
): SortDirection | undefined {
  return sortDirections.find((candidate) => candidate === value);
}
