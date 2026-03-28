import type {
  CardDetail,
  CardDeckUsage,
  CardListItem,
  DeckDetail,
  DeckDetailCard,
  DeckListItem,
  DraftReviewLabel,
  DraftStatusSummary,
  EntityReference,
  ImagePreview,
  SetDetail,
  SetListItem,
  UniverseDetail,
  UniverseListItem,
  ValidationSummary,
} from "../../../../src/cloud-arcanum/api-contract.js";
import type { Card, CardColor, ImageReference } from "../../../../src/domain/index.js";
import type {
  CloudArcanumNormalizedData,
  NormalizedCardRecord,
  NormalizedDeckRecord,
  NormalizedSetRecord,
  NormalizedUniverseRecord,
} from "./index.js";

const unresolvedCardFieldResolvers = [
  ["manaCost", (card: Card) => card.manaCost],
  ["manaValue", (card: Card) => card.manaValue],
  ["oracleText", (card: Card) => card.oracleText],
  ["power", (card: Card) => card.power],
  ["toughness", (card: Card) => card.toughness],
  ["loyalty", (card: Card) => card.loyalty],
  ["defense", (card: Card) => card.defense],
  ["rarity", (card: Card) => card.rarity],
] as const;

function createFallbackReference(id: string, label: string): EntityReference {
  return {
    id,
    name: label,
  };
}

function toEntityReference(record: { data: { id: string; name: string } }): EntityReference {
  return {
    id: record.data.id,
    name: record.data.name,
  };
}

function toValidationSummary(
  normalized: CloudArcanumNormalizedData,
  relativeFilePath: string,
): ValidationSummary {
  const validatorErrors = normalized.validationErrorsByFile.get(relativeFilePath);
  const errorCount =
    validatorErrors?.length ??
    normalized.issues.filter((issue) => issue.file === relativeFilePath).length;

  return {
    hasErrors: errorCount > 0,
    errorCount,
  };
}

function cloneCardColors(colors: Card["colors"]): CardColor[] {
  return colors.map((color) => color as CardColor);
}

function buildDraftReviewLabel(summary: {
  status: Card["status"];
  hasUnresolvedMechanics: boolean;
}): DraftReviewLabel {
  if (summary.status === "approved") {
    return "Approved";
  }

  if (summary.status === "balanced") {
    return summary.hasUnresolvedMechanics ? "Needs review" : "Ready for review";
  }

  if (summary.status === "templating") {
    return "Templating";
  }

  return "Draft";
}

export function buildDraftStatusSummary(card: Card): DraftStatusSummary {
  const unresolvedFields = unresolvedCardFieldResolvers
    .filter(([, getValue]) => getValue(card) === null)
    .map(([field]) => field);
  const hasUnresolvedMechanics = unresolvedFields.length > 0;

  return {
    status: card.status,
    isDraftLike: card.status === "draft" || card.status === "templating",
    hasUnresolvedMechanics,
    unresolvedFields,
    reviewLabel: buildDraftReviewLabel({
      status: card.status,
      hasUnresolvedMechanics,
    }),
  };
}

export function buildImagePreview(
  image: ImageReference,
  alt: string,
  availableImagePaths: Set<string>,
): ImagePreview {
  if (image.type === "placeholder") {
    return {
      kind: "placeholder",
      sourcePath: image.path,
      publicUrl: null,
      isRenderable: false,
      alt,
    };
  }

  if (image.type === "remote") {
    return {
      kind: image.path ? "remote" : "missing",
      sourcePath: image.path,
      publicUrl: image.path,
      isRenderable: image.path !== null,
      alt,
    };
  }

  if (!image.path) {
    return {
      kind: "missing",
      sourcePath: null,
      publicUrl: null,
      isRenderable: false,
      alt,
    };
  }

  const normalizedPath = image.path.replace(/^\.?\//, "");
  const isKnownLocalAsset = availableImagePaths.has(normalizedPath);

  if (image.type === "local") {
    if (!isKnownLocalAsset) {
      return {
        kind: "missing",
        sourcePath: image.path,
        publicUrl: null,
        isRenderable: false,
        alt,
      };
    }

    return {
      kind: "local",
      sourcePath: image.path,
      publicUrl: `/${normalizedPath}`,
      isRenderable: true,
      alt,
    };
  }

  if (image.type === "generated") {
    return {
      kind: "generated",
      sourcePath: image.path,
      publicUrl: isKnownLocalAsset
        ? `/${normalizedPath}`
        : image.path.startsWith("http://") || image.path.startsWith("https://")
          ? image.path
          : null,
      isRenderable:
        isKnownLocalAsset ||
        image.path.startsWith("http://") ||
        image.path.startsWith("https://"),
      alt,
    };
  }

  return {
    kind: "missing",
    sourcePath: image.path,
    publicUrl: null,
    isRenderable: false,
    alt,
  };
}

function buildAvailableImagePathSet(normalized: CloudArcanumNormalizedData): Set<string> {
  return new Set(normalized.snapshot.cardImages.map((record) => record.relativeFilePath));
}

function buildCardImagePreview(
  normalized: CloudArcanumNormalizedData,
  cardRecord: NormalizedCardRecord,
): ImagePreview {
  return buildImagePreview(
    cardRecord.data.image,
    `${cardRecord.data.name} artwork`,
    buildAvailableImagePathSet(normalized),
  );
}

function buildCardSetReference(cardRecord: NormalizedCardRecord): EntityReference {
  if (cardRecord.set) {
    return toEntityReference(cardRecord.set);
  }

  return createFallbackReference(cardRecord.data.setId, "Unknown Set");
}

function buildCardUniverseReference(cardRecord: NormalizedCardRecord): EntityReference {
  if (cardRecord.universe) {
    return toEntityReference(cardRecord.universe);
  }

  return createFallbackReference(
    cardRecord.set?.data.universeId ?? "universe_missing",
    "Unknown Universe",
  );
}

export function buildCardListItem(
  normalized: CloudArcanumNormalizedData,
  cardRecord: NormalizedCardRecord,
): CardListItem {
  return {
    id: cardRecord.data.id,
    name: cardRecord.data.name,
    slug: cardRecord.data.slug,
    typeLine: cardRecord.data.typeLine,
    manaCost: cardRecord.data.manaCost,
    manaValue: cardRecord.data.manaValue,
    colors: cloneCardColors(cardRecord.data.colors),
    colorIdentity: cloneCardColors(cardRecord.data.colorIdentity),
    rarity: cardRecord.data.rarity,
    status: cardRecord.data.status,
    oracleText: cardRecord.data.oracleText,
    flavorText: cardRecord.data.flavorText,
    power: cardRecord.data.power,
    toughness: cardRecord.data.toughness,
    loyalty: cardRecord.data.loyalty,
    defense: cardRecord.data.defense,
    artist: cardRecord.data.artist,
    set: buildCardSetReference(cardRecord),
    setCode: cardRecord.set?.data.code ?? null,
    universe: buildCardUniverseReference(cardRecord),
    image: buildCardImagePreview(normalized, cardRecord),
    draft: buildDraftStatusSummary(cardRecord.data),
    validation: toValidationSummary(normalized, cardRecord.relativeFilePath),
    tags: cardRecord.data.tags,
    updatedAt: cardRecord.data.updatedAt,
  };
}

export function buildCardDetail(
  normalized: CloudArcanumNormalizedData,
  cardRecord: NormalizedCardRecord,
): CardDetail {
  return {
    id: cardRecord.data.id,
    name: cardRecord.data.name,
    slug: cardRecord.data.slug,
    setId: cardRecord.data.setId,
    typeLine: cardRecord.data.typeLine,
    manaCost: cardRecord.data.manaCost,
    manaValue: cardRecord.data.manaValue,
    colors: cloneCardColors(cardRecord.data.colors),
    colorIdentity: cloneCardColors(cardRecord.data.colorIdentity),
    rarity: cardRecord.data.rarity,
    oracleText: cardRecord.data.oracleText,
    flavorText: cardRecord.data.flavorText,
    power: cardRecord.data.power,
    toughness: cardRecord.data.toughness,
    loyalty: cardRecord.data.loyalty,
    defense: cardRecord.data.defense,
    artist: cardRecord.data.artist,
    mechanics: cardRecord.data.mechanics,
    tags: cardRecord.data.tags,
    imagePrompt: cardRecord.data.imagePrompt,
    notes: cardRecord.data.notes,
    createdAt: cardRecord.data.createdAt,
    updatedAt: cardRecord.data.updatedAt,
    image: buildCardImagePreview(normalized, cardRecord),
    draft: buildDraftStatusSummary(cardRecord.data),
    validation: toValidationSummary(normalized, cardRecord.relativeFilePath),
    set: cardRecord.set
      ? {
          id: cardRecord.set.data.id,
          name: cardRecord.set.data.name,
          code: cardRecord.set.data.code,
        }
      : {
          id: cardRecord.data.setId,
          name: "Unknown Set",
          code: "UNKNOWN",
        },
    universe: buildCardUniverseReference(cardRecord),
    decks: cardRecord.decks
      .map<CardDeckUsage>(({ deck, quantity }) => ({
        id: deck.data.id,
        name: deck.data.name,
        quantity,
      }))
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
}

export function buildDeckListItem(
  normalized: CloudArcanumNormalizedData,
  deckRecord: NormalizedDeckRecord,
): DeckListItem {
  return {
    id: deckRecord.data.id,
    name: deckRecord.data.name,
    format: deckRecord.data.format,
    universe: deckRecord.universe
      ? toEntityReference(deckRecord.universe)
      : createFallbackReference(deckRecord.data.universeId, "Unknown Universe"),
    setCount: deckRecord.sets.length,
    cardCount: deckRecord.totalCards,
    uniqueCardCount: deckRecord.uniqueCards,
    commander: deckRecord.commander ? toEntityReference(deckRecord.commander) : null,
    tags: deckRecord.data.tags,
    validation: toValidationSummary(normalized, deckRecord.relativeFilePath),
  };
}

function buildDeckDetailCard(
  normalized: CloudArcanumNormalizedData,
  deckCardRecord: NormalizedDeckRecord["cards"][number],
): DeckDetailCard | null {
  if (!deckCardRecord.card) {
    return null;
  }

  return {
    quantity: deckCardRecord.quantity,
    card: {
      id: deckCardRecord.card.data.id,
      name: deckCardRecord.card.data.name,
      typeLine: deckCardRecord.card.data.typeLine,
      manaCost: deckCardRecord.card.data.manaCost,
      manaValue: deckCardRecord.card.data.manaValue,
      status: deckCardRecord.card.data.status,
      image: buildCardImagePreview(normalized, deckCardRecord.card),
      draft: buildDraftStatusSummary(deckCardRecord.card.data),
      set: buildCardSetReference(deckCardRecord.card),
    },
  };
}

export function buildDeckDetail(
  normalized: CloudArcanumNormalizedData,
  deckRecord: NormalizedDeckRecord,
): DeckDetail {
  const bySet = new Map<string, { set: EntityReference; count: number }>();

  for (const deckCardRecord of deckRecord.cards) {
    if (!deckCardRecord.card?.set) {
      continue;
    }

    const setId = deckCardRecord.card.set.data.id;
    const existing = bySet.get(setId);

    if (existing) {
      existing.count += deckCardRecord.quantity;
      continue;
    }

    bySet.set(setId, {
      set: toEntityReference(deckCardRecord.card.set),
      count: deckCardRecord.quantity,
    });
  }

  return {
    id: deckRecord.data.id,
    name: deckRecord.data.name,
    format: deckRecord.data.format,
    notes: deckRecord.data.notes,
    tags: deckRecord.data.tags,
    universe: deckRecord.universe
      ? toEntityReference(deckRecord.universe)
      : createFallbackReference(deckRecord.data.universeId, "Unknown Universe"),
    sets: deckRecord.sets.map((setRecord) => ({
      id: setRecord.data.id,
      name: setRecord.data.name,
      code: setRecord.data.code,
    })),
    commander: deckRecord.commander
      ? {
          id: deckRecord.commander.data.id,
          name: deckRecord.commander.data.name,
          image: buildCardImagePreview(normalized, deckRecord.commander),
        }
      : null,
    cards: deckRecord.cards
      .map((deckCardRecord) => buildDeckDetailCard(normalized, deckCardRecord))
      .filter((value): value is DeckDetailCard => value !== null),
    summary: {
      totalCards: deckRecord.totalCards,
      uniqueCards: deckRecord.uniqueCards,
      byStatus: deckRecord.byStatus,
      bySet: Array.from(bySet.values()).sort((left, right) =>
        left.set.name.localeCompare(right.set.name),
      ),
    },
    validation: toValidationSummary(normalized, deckRecord.relativeFilePath),
  };
}

export function buildSetListItem(
  normalized: CloudArcanumNormalizedData,
  setRecord: NormalizedSetRecord,
): SetListItem {
  return {
    id: setRecord.data.id,
    name: setRecord.data.name,
    code: setRecord.data.code,
    universe: setRecord.universe
      ? toEntityReference(setRecord.universe)
      : createFallbackReference(setRecord.data.universeId, "Unknown Universe"),
    description: setRecord.data.description,
    cardCount: setRecord.cards.length,
    countsByStatus: setRecord.countsByStatus,
  };
}

export function buildSetDetail(
  normalized: CloudArcanumNormalizedData,
  setRecord: NormalizedSetRecord,
): SetDetail {
  const featuredCards = [...setRecord.cards]
    .sort((left, right) => left.data.name.localeCompare(right.data.name))
    .slice(0, 6)
    .map((cardRecord) => ({
      id: cardRecord.data.id,
      name: cardRecord.data.name,
      status: cardRecord.data.status,
      image: buildCardImagePreview(normalized, cardRecord),
    }));

  return {
    id: setRecord.data.id,
    name: setRecord.data.name,
    code: setRecord.data.code,
    description: setRecord.data.description,
    universe: setRecord.universe
      ? toEntityReference(setRecord.universe)
      : createFallbackReference(setRecord.data.universeId, "Unknown Universe"),
    cardCount: setRecord.cards.length,
    countsByStatus: setRecord.countsByStatus,
    featuredCards,
  };
}

export function buildUniverseListItem(universeRecord: NormalizedUniverseRecord): UniverseListItem {
  return {
    id: universeRecord.data.id,
    name: universeRecord.data.name,
    description: universeRecord.data.description,
    setCount: universeRecord.sets.length,
    cardCount: universeRecord.cards.length,
    deckCount: universeRecord.decks.length,
  };
}

export function buildUniverseDetail(
  universeRecord: NormalizedUniverseRecord,
): UniverseDetail {
  return {
    id: universeRecord.data.id,
    name: universeRecord.data.name,
    description: universeRecord.data.description,
    counts: {
      sets: universeRecord.sets.length,
      cards: universeRecord.cards.length,
      decks: universeRecord.decks.length,
    },
    sets: [...universeRecord.sets]
      .sort((left, right) => left.data.name.localeCompare(right.data.name))
      .map((setRecord) => ({
        id: setRecord.data.id,
        name: setRecord.data.name,
        code: setRecord.data.code,
        cardCount: setRecord.cards.length,
      })),
    decks: [...universeRecord.decks]
      .sort((left, right) => left.data.name.localeCompare(right.data.name))
      .map((deckRecord) => ({
        id: deckRecord.data.id,
        name: deckRecord.data.name,
        format: deckRecord.data.format,
        cardCount: deckRecord.totalCards,
      })),
  };
}

export type CloudArcanumDerivedViewModels = {
  cardDetailsById: Map<string, CardDetail>;
  cardListItems: CardListItem[];
  deckDetailsById: Map<string, DeckDetail>;
  deckListItems: DeckListItem[];
  setDetailsById: Map<string, SetDetail>;
  setListItems: SetListItem[];
  universeDetailsById: Map<string, UniverseDetail>;
  universeListItems: UniverseListItem[];
};

export function buildDerivedViewModels(
  normalized: CloudArcanumNormalizedData,
): CloudArcanumDerivedViewModels {
  const cardListItems = normalized.cards.map((cardRecord) =>
    buildCardListItem(normalized, cardRecord),
  );
  const cardDetails = normalized.cards.map((cardRecord) =>
    buildCardDetail(normalized, cardRecord),
  );
  const deckListItems = normalized.decks.map((deckRecord) =>
    buildDeckListItem(normalized, deckRecord),
  );
  const deckDetails = normalized.decks.map((deckRecord) =>
    buildDeckDetail(normalized, deckRecord),
  );
  const setListItems = normalized.sets.map((setRecord) =>
    buildSetListItem(normalized, setRecord),
  );
  const setDetails = normalized.sets.map((setRecord) =>
    buildSetDetail(normalized, setRecord),
  );
  const universeListItems = normalized.universes.map((universeRecord) =>
    buildUniverseListItem(universeRecord),
  );
  const universeDetails = normalized.universes.map((universeRecord) =>
    buildUniverseDetail(universeRecord),
  );

  return {
    cardDetailsById: new Map(cardDetails.map((detail) => [detail.id, detail])),
    cardListItems,
    deckDetailsById: new Map(deckDetails.map((detail) => [detail.id, detail])),
    deckListItems,
    setDetailsById: new Map(setDetails.map((detail) => [detail.id, detail])),
    setListItems,
    universeDetailsById: new Map(universeDetails.map((detail) => [detail.id, detail])),
    universeListItems,
  };
}
