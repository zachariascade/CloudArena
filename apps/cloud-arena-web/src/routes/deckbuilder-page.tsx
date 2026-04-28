import type { ReactElement } from "react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import type {
  CloudArenaCardSummary,
  CloudArenaDeckCardEntry,
  CloudArenaDeckDetail,
  CloudArenaDeckKind,
  CloudArenaDeckSummary,
  CloudArenaDeckWriteRequest,
} from "../../../../src/cloud-arena/api-contract.js";
import {
  CloudArenaAppShell,
  ErrorState,
  LoadingState,
} from "../components/index.js";
import { DisplayCard } from "../components/display-card.js";
import {
  CloudArcanumApiClientError,
  createCloudArenaContentController,
  type CloudArenaContentMode,
} from "../lib/cloud-arena-web-lib.js";
import { mapArenaHandCardToDisplayCard } from "../lib/display-card.js";

type CloudArenaDeckBuilderPageProps = {
  apiBaseUrl: string;
  contentMode: CloudArenaContentMode;
  cloudArcanumWebBaseUrl: string;
};

type DeckBuilderStatus = "loading" | "ready" | "error";
type DeckBuilderSourceKind = "new" | CloudArenaDeckKind;
type DeckBuilderSelectionOption = {
  id: string;
  label: string;
  description: string;
  kind: DeckBuilderSourceKind;
  disabled?: boolean;
};
type DeckBuilderSelectionGroup = {
  label: string;
  options: DeckBuilderSelectionOption[];
};
type DeckBuilderCreateModalDraft = {
  name: string;
  tagsText: string;
  notes: string;
};
type DeckBuilderCreateModalMode = "create" | "save_as";

type DeckBuilderDraft = {
  sourceId: string | null;
  sourceKind: DeckBuilderSourceKind;
  name: string;
  notes: string;
  tagsText: string;
  cards: CloudArenaDeckCardEntry[];
};

const ALL_CARD_TYPES_OPTION = "all";
const NEW_DECK_OPTION = "__new__";

export function createEmptyDraft(): DeckBuilderDraft {
  return {
    sourceId: null,
    sourceKind: "new",
    name: "New deck",
    notes: "",
    tagsText: "",
    cards: [],
  };
}

function normalizeDeckBuilderDraft(draft: Partial<DeckBuilderDraft>): DeckBuilderDraft {
  return {
    sourceId: draft.sourceId ?? null,
    sourceKind: draft.sourceKind ?? "new",
    name: draft.name ?? "New deck",
    notes: draft.notes ?? "",
    tagsText: draft.tagsText ?? "",
    cards: Array.isArray(draft.cards)
      ? draft.cards.map((entry) => ({
          cardId: entry.cardId,
          quantity: entry.quantity,
        }))
      : [],
  };
}

export function cloneEntries(entries: CloudArenaDeckCardEntry[]): CloudArenaDeckCardEntry[] {
  return entries.map((entry) => ({ ...entry }));
}

function createEmptyCreateModalDraft(): DeckBuilderCreateModalDraft {
  return {
    name: "New deck",
    tagsText: "",
    notes: "",
  };
}

export function buildCreateModalDraftFromDeckDraft(
  draft: DeckBuilderDraft,
): DeckBuilderCreateModalDraft {
  return {
    name: draft.name,
    tagsText: draft.tagsText,
    notes: draft.notes,
  };
}

export function buildDraftFingerprint(draft: DeckBuilderDraft): string {
  const safeDraft = normalizeDeckBuilderDraft(draft);

  return JSON.stringify({
    sourceId: safeDraft.sourceId,
    sourceKind: safeDraft.sourceKind,
    name: safeDraft.name.trim(),
    notes: safeDraft.notes.trim(),
    tagsText: safeDraft.tagsText.trim(),
    cards: safeDraft.cards.map((entry) => [entry.cardId, entry.quantity]),
  });
}

export function buildDraftFromDetail(detail: CloudArenaDeckDetail): DeckBuilderDraft {
  return {
    sourceId: detail.id,
    sourceKind: detail.kind,
    name: detail.name ?? "New deck",
    notes: detail.notes ?? "",
    tagsText: detail.tags.join(", "),
    cards: cloneEntries(detail.cards),
  };
}

export function buildDeckWriteRequest(draft: DeckBuilderDraft): CloudArenaDeckWriteRequest {
  const safeDraft = normalizeDeckBuilderDraft(draft);
  const tags = safeDraft.tagsText
    .split(/[\n,]/g)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  const notes = safeDraft.notes.trim();

  return {
    name: safeDraft.name.trim(),
    cards: safeDraft.cards
      .filter((entry) => entry.quantity > 0)
      .map((entry) => ({ ...entry })),
    tags: tags.length > 0 ? Array.from(new Set(tags)) : undefined,
    notes: notes.length > 0 ? notes : null,
  };
}

export function summarizeDeckCards(cards: CloudArenaDeckCardEntry[]): {
  cardCount: number;
  uniqueCardCount: number;
} {
  return {
    cardCount: cards.reduce((total, entry) => total + entry.quantity, 0),
    uniqueCardCount: cards.length,
  };
}

export function toggleDeckCardSelection(
  cards: CloudArenaDeckCardEntry[],
  cardId: string,
): CloudArenaDeckCardEntry[] {
  if (cards.some((entry) => entry.cardId === cardId)) {
    return cards
      .filter((entry) => entry.cardId !== cardId)
      .map((entry) => ({ ...entry }));
  }

  return [...cloneEntries(cards), { cardId, quantity: 1 }];
}

export function isDeckCardSelected(cards: CloudArenaDeckCardEntry[], cardId: string): boolean {
  return cards.some((entry) => entry.cardId === cardId && entry.quantity > 0);
}

export function getDeckCardQuantity(cards: CloudArenaDeckCardEntry[], cardId: string): number {
  return cards.find((entry) => entry.cardId === cardId)?.quantity ?? 0;
}

export function incrementDeckCard(
  cards: CloudArenaDeckCardEntry[],
  cardId: string,
  quantity = 1,
): CloudArenaDeckCardEntry[] {
  if (quantity <= 0) {
    return cloneEntries(cards);
  }

  let found = false;

  return cards.map((entry) => {
    if (entry.cardId !== cardId) {
      return { ...entry };
    }

    found = true;
    return {
      ...entry,
      quantity: entry.quantity + quantity,
    };
  }).concat(
    found
      ? []
      : [{ cardId, quantity }],
  );
}

export function decrementDeckCard(
  cards: CloudArenaDeckCardEntry[],
  cardId: string,
  quantity = 1,
): CloudArenaDeckCardEntry[] {
  return cards
    .flatMap((entry) => {
      if (entry.cardId !== cardId) {
        return [{ ...entry }];
      }

      const nextQuantity = entry.quantity - quantity;
      if (nextQuantity > 0) {
        return [{
          ...entry,
          quantity: nextQuantity,
        }];
      }

      return [];
    });
}

export function filterCards(
  cards: CloudArenaCardSummary[],
  searchText: string,
  cardType: string,
): CloudArenaCardSummary[] {
  const normalizedSearch = searchText.trim().toLowerCase();

  return cards.filter((card) => {
    const matchesType =
      cardType === ALL_CARD_TYPES_OPTION || card.cardTypes.includes(cardType);
    const haystack = [
      card.name,
      card.typeLine,
      card.effectSummary,
      ...card.cardTypes,
      ...card.subtypes,
    ]
      .join(" ")
      .toLowerCase();

    return matchesType && (normalizedSearch.length === 0 || haystack.includes(normalizedSearch));
  });
}

export function buildDeckSelectionGroups(
  decks: CloudArenaDeckSummary[] | null,
  selectedDeckId: string,
): DeckBuilderSelectionGroup[] {
  const availableDecks = decks ?? [];
  const presetDecks = availableDecks.filter((deck) => deck.kind === "preset");
  const savedDecks = availableDecks.filter((deck) => deck.kind === "saved");
  const presetOptions: DeckBuilderSelectionOption[] = presetDecks.length > 0
    ? presetDecks.map((deck) => ({
        id: deck.id,
        label: deck.name,
        description: `${deck.cardCount} cards, ${deck.uniqueCardCount} unique`,
        kind: deck.kind,
      }))
    : [
        {
          id: "master_deck",
          label: "Master Deck",
          description: "All available player cards",
          kind: "preset",
        },
        {
          id: "starter_deck",
          label: "Wide Angels",
          description: "Token angels and blessing scale",
          kind: "preset",
        },
        {
          id: "counters",
          label: "Counters",
          description: "Creature shells with plus and minus counter play",
          kind: "preset",
        },
        {
          id: "tall_creatures",
          label: "Tall Creatures",
          description: "Grow one or two bigger bodies",
          kind: "preset",
        },
        {
          id: "mixed_guardian",
          label: "Mixed Guardian",
          description: "Balanced baseline battle",
          kind: "preset",
        },
      ];
  const savedOptions: DeckBuilderSelectionOption[] = savedDecks.map((deck) => ({
    id: deck.id,
    label: deck.name,
    description: `${deck.cardCount} cards, ${deck.uniqueCardCount} unique`,
    kind: deck.kind,
  }));
  const injectedSelectedOption =
    selectedDeckId.length > 0 &&
    selectedDeckId !== NEW_DECK_OPTION &&
    !presetOptions.some((option) => option.id === selectedDeckId) &&
    !savedOptions.some((option) => option.id === selectedDeckId)
      ? {
          id: selectedDeckId,
          label: `Selected deck ${selectedDeckId}`,
          description: "Current draft",
          kind: "saved" as const,
        }
      : null;

  return [
    {
      label: "Current draft",
      options: [
        {
          id: NEW_DECK_OPTION,
          label: "Add new deck",
          description: "Start from the current selected cards",
          kind: "new",
        },
      ],
    },
    {
      label: "Built-in presets",
      options: presetOptions,
    },
    {
      label: "Saved decks",
      options: injectedSelectedOption ? [injectedSelectedOption, ...savedOptions] : savedOptions,
    },
    {
      label: "Actions",
      options: [
        {
          id: NEW_DECK_OPTION,
          label: "Add new deck",
          description: "Create a deck from the current selection",
          kind: "new",
        },
      ],
    },
  ];
}

function getDeckSourceLabel(sourceKind: DeckBuilderSourceKind): string {
  switch (sourceKind) {
    case "preset":
      return "Built-in preset";
    case "saved":
      return "Saved deck";
    case "new":
    default:
      return "New draft";
  }
}

function getDeckActionLabel(sourceKind: DeckBuilderSourceKind): string {
  switch (sourceKind) {
    case "saved":
      return "Update deck";
    case "preset":
      return "Save as deck";
    case "new":
    default:
      return "Save deck";
  }
}

export function CloudArenaDeckBuilderPage({
  apiBaseUrl,
  contentMode,
  cloudArcanumWebBaseUrl,
}: CloudArenaDeckBuilderPageProps): ReactElement {
  const content = useMemo(
    () => createCloudArenaContentController({ apiBaseUrl, mode: contentMode }),
    [apiBaseUrl, contentMode],
  );
  const [status, setStatus] = useState<DeckBuilderStatus>("loading");
  const [error, setError] = useState<Error | CloudArcanumApiClientError | null>(null);
  const [cards, setCards] = useState<CloudArenaCardSummary[]>([]);
  const [decks, setDecks] = useState<CloudArenaDeckSummary[]>([]);
  const [draft, setDraft] = useState<DeckBuilderDraft>(createEmptyDraft);
  const [cardSearch, setCardSearch] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [isCreateDeckModalOpen, setIsCreateDeckModalOpen] = useState(false);
  const [createModalDraft, setCreateModalDraft] = useState<DeckBuilderCreateModalDraft>(createEmptyCreateModalDraft);
  const [createModalMode, setCreateModalMode] = useState<DeckBuilderCreateModalMode>("create");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deckCatalogWarning, setDeckCatalogWarning] = useState<string | null>(null);
  const draftFingerprintRef = useRef(buildDraftFingerprint(createEmptyDraft()));
  const deferredCardSearch = useDeferredValue(cardSearch);
  const safeDraft = useMemo(() => normalizeDeckBuilderDraft(draft), [draft]);

  const deckStats = useMemo(() => summarizeDeckCards(safeDraft.cards), [safeDraft.cards]);
  const deckSelectionGroups = useMemo(
    () => buildDeckSelectionGroups(decks, safeDraft.sourceId ?? NEW_DECK_OPTION),
    [decks, safeDraft.sourceId],
  );
  const selectedDeckOption = useMemo(
    () => deckSelectionGroups.flatMap((group) => group.options).find((option) => option.id === safeDraft.sourceId) ?? null,
    [deckSelectionGroups, safeDraft.sourceId],
  );
  const filteredCards = useMemo(
    () => filterCards(cards, deferredCardSearch, ALL_CARD_TYPES_OPTION)
      .filter((card) => !showSelectedOnly || isDeckCardSelected(safeDraft.cards, card.id)),
    [cards, deferredCardSearch, safeDraft.cards, showSelectedOnly],
  );
  const isDirty = useMemo(
    () => buildDraftFingerprint(safeDraft) !== draftFingerprintRef.current,
    [safeDraft],
  );
  const startBattleHref = safeDraft.sourceId
    ? `/run?deck=${encodeURIComponent(safeDraft.sourceId)}`
    : "/run";

  async function refreshCatalog(): Promise<void> {
    const [cardsResult, decksResult] = await Promise.allSettled([
      content.listCloudArenaCards(),
      content.listCloudArenaDecks(),
    ]);

    if (cardsResult.status === "rejected") {
      throw cardsResult.reason;
    }

    setCards(cardsResult.value.data);

    if (decksResult.status === "rejected") {
      setDecks([]);
      setDeckCatalogWarning(
        decksResult.reason instanceof Error ? decksResult.reason.message : "Saved decks could not be loaded.",
      );
    } else {
      setDecks(decksResult.value.data);
      setDeckCatalogWarning(null);
    }
  }

  async function loadDeck(deckId: string): Promise<void> {
    const response = await content.getCloudArenaDeck(deckId);
    const nextDraft = buildDraftFromDetail(response.data);

    setDraft(nextDraft);
    draftFingerprintRef.current = buildDraftFingerprint(nextDraft);
  }

  async function handleSaveDraft(): Promise<void> {
    if (safeDraft.name.trim().length === 0) {
      return;
    }

    if (deckStats.cardCount < 10) {
      setError(new Error("A deck needs at least 10 selected cards."));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const body = buildDeckWriteRequest(safeDraft);
      const response =
        safeDraft.sourceKind === "saved" && safeDraft.sourceId
          ? await content.updateCloudArenaDeck(safeDraft.sourceId, body)
          : await content.createCloudArenaDeck(body);

      const nextDraft = buildDraftFromDetail(response.data);
      setDraft(nextDraft);
      draftFingerprintRef.current = buildDraftFingerprint(nextDraft);
      await refreshCatalog();
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteDraft(): Promise<void> {
    if (!safeDraft.sourceId || safeDraft.sourceKind !== "saved") {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await content.deleteCloudArenaDeck(safeDraft.sourceId);
      await refreshCatalog();
      const nextDraft = createEmptyDraft();
      setDraft(nextDraft);
      draftFingerprintRef.current = buildDraftFingerprint(nextDraft);
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSelectDeck(deckId: string): Promise<void> {
    setError(null);
    await loadDeck(deckId);
  }

  function openCreateDeckModal(draft?: DeckBuilderDraft): void {
    setCreateModalDraft(
      draft ? buildCreateModalDraftFromDeckDraft(draft) : createEmptyCreateModalDraft(),
    );
    setCreateModalMode(draft ? "save_as" : "create");
    setIsCreateDeckModalOpen(true);
  }

  function closeCreateDeckModal(): void {
    setIsCreateDeckModalOpen(false);
    setCreateModalMode("create");
  }

  function handleSelectCard(cardId: string): void {
    setDraft((current) => ({
      ...current,
      cards: toggleDeckCardSelection(normalizeDeckBuilderDraft(current).cards, cardId),
    }));
  }

  function handleIncreaseCardCopies(cardId: string): void {
    setDraft((current) => ({
      ...current,
      cards: incrementDeckCard(normalizeDeckBuilderDraft(current).cards, cardId, 1),
    }));
  }

  function handleDecreaseCardCopies(cardId: string): void {
    setDraft((current) => ({
      ...current,
      cards: decrementDeckCard(normalizeDeckBuilderDraft(current).cards, cardId, 1),
    }));
  }

  async function handleCreateDeckFromModal(): Promise<void> {
    if (createModalDraft.name.trim().length === 0) {
      setError(new Error("Deck name is required."));
      return;
    }

    if (deckStats.cardCount < 10) {
      setError(new Error("A new deck needs at least 10 selected cards."));
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await content.createCloudArenaDeck({
        name: createModalDraft.name.trim(),
        tags: createModalDraft.tagsText
          .split(/[\n,]/g)
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        notes: createModalDraft.notes.trim().length > 0 ? createModalDraft.notes.trim() : null,
        cards: safeDraft.cards.map((entry) => ({ ...entry })),
      });

      closeCreateDeckModal();
      await refreshCatalog();
      await loadDeck(response.data.id);
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function load(): Promise<void> {
      setStatus("loading");
      setError(null);

      try {
        await refreshCatalog();

        if (!isCancelled) {
          const nextDraft = createEmptyDraft();
          setDraft(nextDraft);
          draftFingerprintRef.current = buildDraftFingerprint(nextDraft);
        }

        if (!isCancelled) {
          setStatus("ready");
        }
      } catch (nextError: unknown) {
        if (!isCancelled) {
          setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
          setStatus("error");
        }
      }
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, [content]);

  if (status === "loading") {
    return (
      <CloudArenaAppShell cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl} fullBleed>
        <LoadingState title="Loading deck builder" description="Fetching the card catalog and saved decks." />
      </CloudArenaAppShell>
    );
  }

  if (status === "error") {
    return (
      <CloudArenaAppShell cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl} fullBleed>
        <ErrorState
          title="Deck builder failed to load"
          description="The deckbuilder could not reach the content API."
          details={error ? <p>{error.message}</p> : undefined}
        />
      </CloudArenaAppShell>
    );
  }

  return (
    <CloudArenaAppShell cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl} fullBleed>
      <section className="cloud-arena-start-screen cloud-arena-run-screen cloud-arena-deckbuilder">
        <div className="cloud-arena-start-backdrop" aria-hidden="true">
          <span className="cloud-arena-start-orb cloud-arena-start-orb-left" />
          <span className="cloud-arena-start-orb cloud-arena-start-orb-right" />
          <span className="cloud-arena-start-rift" />
          <span className="cloud-arena-start-rift cloud-arena-start-rift-secondary" />
        </div>

        <div className="cloud-arena-start-hero cloud-arena-run-hero cloud-arena-deckbuilder-layout">
          <header className="cloud-arena-start-copy cloud-arena-run-copy cloud-arena-deckbuilder-header">
            <div className="cloud-arena-deckbuilder-heading">
              <h2 className="cloud-arena-deckbuilder-title">Deck Builder</h2>
              <p className="cloud-arena-deckbuilder-subtitle">
                Switch decks, tune the list, and save new versions from the catalog below.
              </p>
            </div>
            <Link className="cloud-arena-start-menu-item cloud-arena-deckbuilder-back" to="/">
              <strong>← Back</strong>
            </Link>
          </header>

          <div className="cloud-arena-start-stage cloud-arena-deckbuilder-stage">
            <section className="cloud-arena-run-column cloud-arena-deckbuilder-column">
              <div className="cloud-arena-run-scroll-pane cloud-arena-deckbuilder-scroll-pane">
                <div className="deckbuilder-shell">
                  <section className="panel deckbuilder-top-panel">
                    <div className="deckbuilder-top-row">
                      <label className="field deckbuilder-deck-select">
                        <span>Deck</span>
                        <select
                          value={safeDraft.sourceId ?? NEW_DECK_OPTION}
                          onChange={(event) => {
                            const nextDeckId = event.target.value;

                            if (nextDeckId === NEW_DECK_OPTION) {
                              openCreateDeckModal();
                              event.currentTarget.value = safeDraft.sourceId ?? NEW_DECK_OPTION;
                              return;
                            }

                            void handleSelectDeck(nextDeckId);
                          }}
                        >
                          {deckSelectionGroups.map((group) => (
                            <optgroup key={group.label} label={group.label}>
                              {group.options.map((option) => (
                                <option key={option.id} value={option.id} disabled={option.disabled}>
                                  {option.label} - {option.description}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </label>

                      <div className="deckbuilder-top-actions">
                        <button
                          type="button"
                          className="primary-button"
                          onClick={() => void handleSaveDraft()}
                          disabled={isSaving}
                        >
                          {isSaving
                            ? "Saving..."
                            : safeDraft.sourceKind === "saved"
                              ? "Save changes"
                              : "Save as deck"}
                        </button>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => openCreateDeckModal()}
                        >
                          Add new deck
                        </button>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => void handleDeleteDraft()}
                          disabled={isDeleting || safeDraft.sourceKind !== "saved" || safeDraft.sourceId === null}
                        >
                          {isDeleting ? "Deleting..." : "Delete deck"}
                        </button>
                        {startBattleHref ? (
                          <Link className="ghost-button" to={startBattleHref}>
                            Start battle
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    <div className="deckbuilder-metadata-grid">
                      <label className="field">
                        <span>Deck name</span>
                        <input
                          type="text"
                          value={safeDraft.name}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              name: event.target.value,
                            }))
                          }
                          placeholder="Deck name"
                        />
                      </label>
                      <label className="field">
                        <span>Tags</span>
                        <input
                          type="text"
                          value={safeDraft.tagsText}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              tagsText: event.target.value,
                            }))
                          }
                          placeholder="control, tokens, lightning"
                        />
                      </label>
                      <label className="field">
                        <span>Notes</span>
                        <input
                          type="text"
                          value={safeDraft.notes}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              notes: event.target.value,
                            }))
                          }
                          placeholder="Optional deck notes"
                        />
                      </label>
                    </div>

                    <div className="status-chip-row deckbuilder-status-row">
                      <span className="card-face-status">{selectedDeckOption?.label ?? safeDraft.name}</span>
                      <span className="card-face-status">Cards: {deckStats.cardCount}</span>
                      <span className="card-face-status">Unique: {deckStats.uniqueCardCount}</span>
                      <span className="card-face-status">{getDeckSourceLabel(safeDraft.sourceKind)}</span>
                      {deckStats.cardCount < 10 ? <span className="card-face-status">Need 10 cards to save</span> : null}
                      {isDirty ? <span className="card-face-status">Unsaved changes</span> : null}
                    </div>
                  </section>

                  {deckCatalogWarning ? (
                    <section className="panel warning-callout deckbuilder-warning-panel">
                      <strong>Saved decks unavailable</strong>
                      <p>{deckCatalogWarning}</p>
                      <p>You can still use the card grid and save new decks from the current selection.</p>
                    </section>
                  ) : null}

                  <section className="panel deckbuilder-catalog-panel">
                    <div className="deckbuilder-catalog-header">
                      <div>
                        <div className="section-kicker">Card Catalog</div>
                        <h2>Tap cards to add or remove them</h2>
                        <p>
                          Selected cards stay in color. Unselected cards are greyed out. Use search and the
                          selected-only filter to narrow the grid.
                        </p>
                      </div>
                      <div className="deckbuilder-catalog-controls">
                        <label className="field">
                          <span>Search cards</span>
                          <input
                            type="search"
                            value={cardSearch}
                            onChange={(event) => setCardSearch(event.target.value)}
                            placeholder="Search by name, type, or rules text"
                          />
                        </label>
                        <label className="toggle-chip">
                          <input
                            type="checkbox"
                            checked={showSelectedOnly}
                            onChange={(event) => setShowSelectedOnly(event.target.checked)}
                          />
                          <span>Selected only</span>
                        </label>
                      </div>
                    </div>

                    <div className="deckbuilder-card-grid">
                      {filteredCards.map((card) => {
                        const isSelected = isDeckCardSelected(safeDraft.cards, card.id);
                        const cardQuantity = getDeckCardQuantity(safeDraft.cards, card.id);
                        const model = mapArenaHandCardToDisplayCard(
                          {
                            instanceId: card.id,
                            definitionId: card.id,
                            name: card.name,
                            cost: card.cost,
                            effectSummary: card.effectSummary,
                          },
                          {
                            isPlayable: false,
                          },
                        );

                        return (
                          <div
                            key={card.id}
                            className={`deckbuilder-card-button${isSelected ? " is-selected" : ""}`}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                            onClick={() => handleSelectCard(card.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleSelectCard(card.id);
                              }
                            }}
                          >
                            <div className="deckbuilder-card-controls">
                              <div className="deckbuilder-card-copy-controls">
                                <button
                                  type="button"
                                  className="deckbuilder-card-copy-button"
                                  aria-label={`Remove one copy of ${card.name}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDecreaseCardCopies(card.id);
                                  }}
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  className="deckbuilder-card-copy-button"
                                  aria-label={`Add one copy of ${card.name}`}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleIncreaseCardCopies(card.id);
                                  }}
                                >
                                  +
                                </button>
                              </div>
                              {isSelected ? (
                                <span className="deckbuilder-card-selection-chip">{cardQuantity}</span>
                              ) : null}
                            </div>
                            <DisplayCard model={model} className="deckbuilder-card-face" />
                          </div>
                        );
                      })}
                      {filteredCards.length === 0 ? (
                        <div className="card deckbuilder-empty-state">
                          <strong>No cards found.</strong>
                          <p>Try a different search term or turn off the selected-only filter.</p>
                        </div>
                      ) : null}
                    </div>
                  </section>
                </div>
              </div>
            </section>
          </div>

          {isCreateDeckModalOpen ? (
            <div className="deckbuilder-modal-backdrop" role="presentation" onClick={closeCreateDeckModal}>
              <div
                className="panel deckbuilder-modal"
                role="dialog"
                aria-modal="true"
                aria-label={createModalMode === "save_as" ? "Save as deck" : "Create new deck"}
                onClick={(event) => event.stopPropagation()}
              >
                <header className="deckbuilder-modal-header">
                  <strong>{createModalMode === "save_as" ? "Save as deck" : "Create new deck"}</strong>
                  <span>
                    {createModalMode === "save_as"
                      ? "This will save the current selected card set as a new deck."
                      : "Start a new deck from the current card selection."}
                  </span>
                </header>
                {deckStats.cardCount < 10 ? (
                  <p className="deckbuilder-modal-error">
                    You need at least 10 cards selected before this deck can be saved.
                  </p>
                ) : null}
                <div className="deckbuilder-modal-fields">
                  <label className="field">
                    <span>Deck name</span>
                    <input
                      type="text"
                      value={createModalDraft.name}
                      onChange={(event) =>
                        setCreateModalDraft((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="New deck"
                    />
                  </label>
                  <label className="field">
                    <span>Tags</span>
                    <input
                      type="text"
                      value={createModalDraft.tagsText}
                      onChange={(event) =>
                        setCreateModalDraft((current) => ({
                          ...current,
                          tagsText: event.target.value,
                        }))
                      }
                      placeholder="control, tokens"
                    />
                  </label>
                  <label className="field">
                    <span>Notes</span>
                    <input
                      type="text"
                      value={createModalDraft.notes}
                      onChange={(event) =>
                        setCreateModalDraft((current) => ({
                          ...current,
                          notes: event.target.value,
                        }))
                      }
                      placeholder="Optional deck notes"
                    />
                  </label>
                </div>
                <div className="deckbuilder-modal-actions">
                  <button
                    type="button"
                    className="primary-button"
                    disabled={isSaving || deckStats.cardCount < 10}
                    onClick={() => void handleCreateDeckFromModal()}
                  >
                    {isSaving
                      ? createModalMode === "save_as"
                        ? "Saving..."
                        : "Creating..."
                      : createModalMode === "save_as"
                        ? "Save deck"
                        : "Create deck"}
                  </button>
                  <button type="button" className="ghost-button" onClick={closeCreateDeckModal}>
                    Cancel
                  </button>
                </div>
                {error ? <p className="deckbuilder-modal-error">{error.message}</p> : null}
              </div>
            </div>
          ) : null}

          {error ? (
            <section className="panel deckbuilder-error-panel">
              <strong>Deckbuilder error</strong>
              <p>{error.message}</p>
            </section>
          ) : null}
        </div>
      </section>
    </CloudArenaAppShell>
  );
}
