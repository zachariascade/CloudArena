import type {
  CardDetail,
  CardDeckUsage,
  CardListItem,
  CardSummaryItem,
  DeckDetail,
  DeckDetailCard,
  DeckListItem,
  DraftStatusSummary,
  EntityReference,
  ImagePreview,
  SetThemeDefinition,
  SetDetail,
  SetListItem,
  UniverseDetail,
  UniverseListItem,
  ValidationSummary,
} from "../../../../src/cloud-arcanum/api-contract.js";
import {
  deriveDraftStatusSummary,
  formatCardDisplayName,
} from "../../../../src/cloud-arcanum/shared-utils.js";
import type {
  Card,
  CardColor,
  ImageReference,
  ThemeId,
} from "../../../../src/domain/index.js";
import type {
  CloudArcanumNormalizedData,
  NormalizedCardRecord,
  NormalizedDeckRecord,
  NormalizedSetRecord,
  NormalizedUniverseRecord,
} from "./index.js";

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

export function buildDraftStatusSummary(card: Card): DraftStatusSummary {
  return deriveDraftStatusSummary(card);
}

export function buildImagePreview(
  image: ImageReference,
  alt: string,
  availableImagePaths: Set<string>,
  options: {
    fallbackArtist?: string | null;
    requestedThemeId?: ThemeId | null;
    resolvedThemeId?: ThemeId | null;
  } = {},
): ImagePreview {
  if (image.type === "placeholder") {
    return {
      kind: "placeholder",
      sourcePath: image.path,
      publicUrl: null,
      isRenderable: false,
      alt,
      artist: image.artist ?? options.fallbackArtist ?? null,
      sourceUrl: image.sourceUrl ?? null,
      license: image.license ?? null,
      creditText: image.creditText ?? null,
      sourceNotes: image.sourceNotes ?? null,
      requestedThemeId: options.requestedThemeId ?? null,
      resolvedThemeId: options.resolvedThemeId ?? null,
      fellBack:
        options.requestedThemeId !== undefined &&
        options.requestedThemeId !== null &&
        options.resolvedThemeId !== null &&
        options.requestedThemeId !== options.resolvedThemeId,
    };
  }

  if (image.type === "remote") {
    return {
      kind: image.path ? "remote" : "missing",
      sourcePath: image.path,
      publicUrl: image.path,
      isRenderable: image.path !== null,
      alt,
      artist: image.artist ?? options.fallbackArtist ?? null,
      sourceUrl: image.sourceUrl ?? image.path,
      license: image.license ?? null,
      creditText: image.creditText ?? null,
      sourceNotes: image.sourceNotes ?? null,
      requestedThemeId: options.requestedThemeId ?? null,
      resolvedThemeId: options.resolvedThemeId ?? null,
      fellBack:
        options.requestedThemeId !== undefined &&
        options.requestedThemeId !== null &&
        options.resolvedThemeId !== null &&
        options.requestedThemeId !== options.resolvedThemeId,
    };
  }

  if (!image.path) {
    return {
      kind: "missing",
      sourcePath: null,
      publicUrl: null,
      isRenderable: false,
      alt,
      artist: image.artist ?? options.fallbackArtist ?? null,
      sourceUrl: image.sourceUrl ?? null,
      license: image.license ?? null,
      creditText: image.creditText ?? null,
      sourceNotes: image.sourceNotes ?? null,
      requestedThemeId: options.requestedThemeId ?? null,
      resolvedThemeId: options.resolvedThemeId ?? null,
      fellBack: false,
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
        artist: image.artist ?? options.fallbackArtist ?? null,
        sourceUrl: image.sourceUrl ?? null,
        license: image.license ?? null,
        creditText: image.creditText ?? null,
        sourceNotes: image.sourceNotes ?? null,
        requestedThemeId: options.requestedThemeId ?? null,
        resolvedThemeId: options.resolvedThemeId ?? null,
        fellBack:
          options.requestedThemeId !== undefined &&
          options.requestedThemeId !== null &&
          options.resolvedThemeId !== null &&
          options.requestedThemeId !== options.resolvedThemeId,
      };
    }

    return {
      kind: "local",
      sourcePath: image.path,
      publicUrl: `/${normalizedPath}`,
      isRenderable: true,
      alt,
      artist: image.artist ?? options.fallbackArtist ?? null,
      sourceUrl: image.sourceUrl ?? null,
      license: image.license ?? null,
      creditText: image.creditText ?? null,
      sourceNotes: image.sourceNotes ?? null,
      requestedThemeId: options.requestedThemeId ?? null,
      resolvedThemeId: options.resolvedThemeId ?? null,
      fellBack:
        options.requestedThemeId !== undefined &&
        options.requestedThemeId !== null &&
        options.resolvedThemeId !== null &&
        options.requestedThemeId !== options.resolvedThemeId,
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
      artist: image.artist ?? options.fallbackArtist ?? null,
      sourceUrl: image.sourceUrl ?? null,
      license: image.license ?? null,
      creditText: image.creditText ?? null,
      sourceNotes: image.sourceNotes ?? null,
      requestedThemeId: options.requestedThemeId ?? null,
      resolvedThemeId: options.resolvedThemeId ?? null,
      fellBack:
        options.requestedThemeId !== undefined &&
        options.requestedThemeId !== null &&
        options.resolvedThemeId !== null &&
        options.requestedThemeId !== options.resolvedThemeId,
    };
  }

  return {
    kind: "missing",
    sourcePath: image.path,
    publicUrl: null,
    isRenderable: false,
    alt,
    artist: image.artist ?? options.fallbackArtist ?? null,
    sourceUrl: image.sourceUrl ?? null,
    license: image.license ?? null,
    creditText: image.creditText ?? null,
    sourceNotes: image.sourceNotes ?? null,
    requestedThemeId: options.requestedThemeId ?? null,
    resolvedThemeId: options.resolvedThemeId ?? null,
    fellBack:
      options.requestedThemeId !== undefined &&
      options.requestedThemeId !== null &&
      options.resolvedThemeId !== null &&
      options.requestedThemeId !== options.resolvedThemeId,
  };
}

export function buildAvailableImagePathSet(
  normalized: CloudArcanumNormalizedData,
): Set<string> {
  return new Set(normalized.snapshot.cardImages.map((record) => record.relativeFilePath));
}

function buildSetThemes(setRecord: NormalizedSetRecord | null): SetThemeDefinition[] {
  return (setRecord?.data.themes ?? []).map((theme) => ({
    id: theme.id,
    name: theme.name,
    description: theme.description ?? null,
  }));
}

function buildSetThemeContext(
  setRecord: NormalizedSetRecord | null,
  requestedThemeId?: ThemeId,
): {
  themes: SetThemeDefinition[];
  defaultThemeId: ThemeId | null;
  activeThemeId: ThemeId | null;
  requestedThemeId: ThemeId | null;
  resolvedThemeId: ThemeId | null;
} {
  const themes = buildSetThemes(setRecord);
  const declaredThemeIds = themes.map((theme) => theme.id);
  const defaultThemeId =
    setRecord?.data.defaultThemeId ??
    (declaredThemeIds.includes("default") ? "default" : null);
  const activeThemeId = setRecord?.data.activeThemeId ?? defaultThemeId;
  const effectiveRequestedThemeId = requestedThemeId ?? activeThemeId ?? defaultThemeId ?? null;
  const resolvedThemeId = effectiveRequestedThemeId
    ? declaredThemeIds.includes(effectiveRequestedThemeId)
      ? effectiveRequestedThemeId
      : activeThemeId ?? defaultThemeId ?? declaredThemeIds[0] ?? null
    : activeThemeId ?? defaultThemeId ?? declaredThemeIds[0] ?? null;

  return {
    themes,
    defaultThemeId,
    activeThemeId,
    requestedThemeId: effectiveRequestedThemeId,
    resolvedThemeId,
  };
}

function buildCardImageVariantMap(card: Card): Record<string, ImageReference> {
  const variants: Record<string, ImageReference> = {
    ...(card.images ?? {}),
  };

  if (card.image && !variants.default) {
    variants.default = card.image;
  }

  return variants;
}

function buildCardImageThemeIds(card: Card): ThemeId[] {
  return Object.keys(buildCardImageVariantMap(card)).sort((left, right) =>
    left.localeCompare(right),
  );
}

function buildCardImagePreview(
  cardRecord: NormalizedCardRecord,
  availableImagePaths: Set<string>,
  requestedThemeId?: ThemeId,
): ImagePreview {
  const alt = `${formatCardDisplayName(cardRecord.data.name, cardRecord.data.title)} artwork`;
  const themeContext = buildSetThemeContext(cardRecord.set, requestedThemeId);
  const imageVariants = buildCardImageVariantMap(cardRecord.data);
  const orderedThemeIds = Array.from(
    new Set([
      themeContext.requestedThemeId,
      themeContext.defaultThemeId,
      "default",
      ...Object.keys(imageVariants),
    ].filter((value): value is ThemeId => Boolean(value))),
  );

  let fallbackPreview: ImagePreview | null = null;

  for (const themeId of orderedThemeIds) {
    const image = imageVariants[themeId];

    if (!image) {
      continue;
    }

    const preview = buildImagePreview(image, alt, availableImagePaths, {
      fallbackArtist: cardRecord.data.artist,
      requestedThemeId: themeContext.requestedThemeId,
      resolvedThemeId: themeId,
    });

    if (!fallbackPreview) {
      fallbackPreview = preview;
    }

    if (preview.isRenderable) {
      return preview;
    }
  }

  if (fallbackPreview) {
    return fallbackPreview;
  }

  return {
    kind: "missing",
    sourcePath: null,
    publicUrl: null,
    isRenderable: false,
    alt,
    artist: cardRecord.data.artist ?? null,
    sourceUrl: null,
    license: null,
    creditText: null,
    sourceNotes: null,
    requestedThemeId: themeContext.requestedThemeId,
    resolvedThemeId: null,
    fellBack: false,
  };
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
  availableImagePaths = buildAvailableImagePathSet(normalized),
  options: {
    themeId?: ThemeId;
  } = {},
): CardListItem {
  return {
    id: cardRecord.data.id,
    name: cardRecord.data.name,
    title: cardRecord.data.title,
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
    artist: buildCardImagePreview(cardRecord, availableImagePaths, options.themeId).artist,
    set: buildCardSetReference(cardRecord),
    setCode: cardRecord.set?.data.code ?? null,
    universe: buildCardUniverseReference(cardRecord),
    image: buildCardImagePreview(cardRecord, availableImagePaths, options.themeId),
    imageThemes: buildCardImageThemeIds(cardRecord.data),
    draft: buildDraftStatusSummary(cardRecord.data),
    validation: toValidationSummary(normalized, cardRecord.relativeFilePath),
    tags: cardRecord.data.tags,
    updatedAt: cardRecord.data.updatedAt,
  };
}

export function buildCardSummaryItem(
  normalized: CloudArcanumNormalizedData,
  cardRecord: NormalizedCardRecord,
  availableImagePaths = buildAvailableImagePathSet(normalized),
  options: {
    themeId?: ThemeId;
  } = {},
): CardSummaryItem {
  return {
    id: cardRecord.data.id,
    name: cardRecord.data.name,
    title: cardRecord.data.title,
    slug: cardRecord.data.slug,
    typeLine: cardRecord.data.typeLine,
    colors: cloneCardColors(cardRecord.data.colors),
    rarity: cardRecord.data.rarity,
    status: cardRecord.data.status,
    set: buildCardSetReference(cardRecord),
    setCode: cardRecord.set?.data.code ?? null,
    universe: buildCardUniverseReference(cardRecord),
    tags: cardRecord.data.tags,
    hasImage: buildCardImagePreview(cardRecord, availableImagePaths, options.themeId)
      .isRenderable,
    hasUnresolvedMechanics: buildDraftStatusSummary(cardRecord.data).hasUnresolvedMechanics,
    updatedAt: cardRecord.data.updatedAt,
  };
}

export function buildCardDetail(
  normalized: CloudArcanumNormalizedData,
  cardRecord: NormalizedCardRecord,
  options: {
    themeId?: ThemeId;
  } = {},
): CardDetail {
  const availableImagePaths = buildAvailableImagePathSet(normalized);

  return {
    id: cardRecord.data.id,
    name: cardRecord.data.name,
    title: cardRecord.data.title,
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
    artist: buildCardImagePreview(cardRecord, availableImagePaths, options.themeId).artist,
    mechanics: cardRecord.data.mechanics,
    tags: cardRecord.data.tags,
    imagePrompt: cardRecord.data.imagePrompt,
    notes: cardRecord.data.notes,
    createdAt: cardRecord.data.createdAt,
    updatedAt: cardRecord.data.updatedAt,
    image: buildCardImagePreview(cardRecord, availableImagePaths, options.themeId),
    imageThemes: buildCardImageThemeIds(cardRecord.data),
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
        title: null,
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
    commander: deckRecord.commander
      ? {
          ...toEntityReference(deckRecord.commander),
          title: deckRecord.commander.data.title,
        }
      : null,
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

  const availableImagePaths = buildAvailableImagePathSet(normalized);

  return {
    quantity: deckCardRecord.quantity,
    card: {
      id: deckCardRecord.card.data.id,
      name: deckCardRecord.card.data.name,
      title: deckCardRecord.card.data.title,
      typeLine: deckCardRecord.card.data.typeLine,
      manaCost: deckCardRecord.card.data.manaCost,
      manaValue: deckCardRecord.card.data.manaValue,
      status: deckCardRecord.card.data.status,
      image: buildCardImagePreview(deckCardRecord.card, availableImagePaths),
      draft: buildDraftStatusSummary(deckCardRecord.card.data),
      set: buildCardSetReference(deckCardRecord.card),
    },
  };
}

export function buildDeckDetail(
  normalized: CloudArcanumNormalizedData,
  deckRecord: NormalizedDeckRecord,
): DeckDetail {
  const availableImagePaths = buildAvailableImagePathSet(normalized);
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
          title: deckRecord.commander.data.title,
          image: buildCardImagePreview(deckRecord.commander, availableImagePaths),
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
  const themeContext = buildSetThemeContext(setRecord);

  return {
    id: setRecord.data.id,
    name: setRecord.data.name,
    code: setRecord.data.code,
    universe: setRecord.universe
      ? toEntityReference(setRecord.universe)
      : createFallbackReference(setRecord.data.universeId, "Unknown Universe"),
    description: setRecord.data.description,
    themes: themeContext.themes,
    defaultThemeId: themeContext.defaultThemeId,
    activeThemeId: themeContext.activeThemeId,
    cardCount: setRecord.cards.length,
    countsByStatus: setRecord.countsByStatus,
  };
}

export function buildSetDetail(
  normalized: CloudArcanumNormalizedData,
  setRecord: NormalizedSetRecord,
  options: {
    themeId?: ThemeId;
  } = {},
): SetDetail {
  const availableImagePaths = buildAvailableImagePathSet(normalized);
  const themeContext = buildSetThemeContext(setRecord, options.themeId);
  const featuredCards = [...setRecord.cards]
    .sort((left, right) => left.data.name.localeCompare(right.data.name))
    .slice(0, 6)
    .map((cardRecord) => ({
      id: cardRecord.data.id,
      name: cardRecord.data.name,
      title: cardRecord.data.title,
      status: cardRecord.data.status,
      image: buildCardImagePreview(cardRecord, availableImagePaths, themeContext.requestedThemeId ?? undefined),
    }));

  return {
    id: setRecord.data.id,
    name: setRecord.data.name,
    code: setRecord.data.code,
    description: setRecord.data.description,
    universe: setRecord.universe
      ? toEntityReference(setRecord.universe)
      : createFallbackReference(setRecord.data.universeId, "Unknown Universe"),
    themes: themeContext.themes,
    defaultThemeId: themeContext.defaultThemeId,
    activeThemeId: themeContext.activeThemeId,
    requestedThemeId: themeContext.requestedThemeId,
    resolvedThemeId: themeContext.resolvedThemeId,
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
