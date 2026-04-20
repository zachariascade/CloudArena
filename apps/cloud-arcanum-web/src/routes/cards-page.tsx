import type { ChangeEvent, CSSProperties, FormEvent, ReactElement } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, Link } from "react-router-dom";

import type {
  CardListItem,
  CardsListMeta,
  FilterMetadata,
  SetDetail,
} from "../../../../src/cloud-arcanum/api-contract.js";
import {
  cardColors,
  cardRarities,
  cardStatuses,
} from "../../../../src/domain/index.js";
import type { SetId } from "../../../../src/domain/index.js";
import {
  DisplayCard,
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
} from "../components/index.js";
import {
  CloudArcanumApiClientError,
  buildCardListQueryString,
  buildPrintableCardsPagePath,
  createCloudArcanumApiClient,
  mapCloudArcanumCardToDisplayCard,
  parseCardListQuery,
  useApiRequest,
} from "../lib/cloud-arcanum-lib.js";

type CardsPageProps = {
  apiBaseUrl: string;
};

type ListResourceState<TItem, TMeta extends { total: number; filtersApplied: Record<string, unknown> }> =
  {
    data: {
      items: TItem[];
      meta: TMeta;
    } | null;
    error: Error | CloudArcanumApiClientError | null;
    status: "idle" | "loading" | "success" | "error";
  };

function formatApiErrorDetails(error: Error | CloudArcanumApiClientError): ReactElement {
  if (error instanceof CloudArcanumApiClientError) {
    return (
      <p>
        Route <code>{error.route}</code> returned status <code>{error.status}</code>
        {error.code ? (
          <>
            {" "}
            with code <code>{error.code}</code>
          </>
        ) : null}
        .
      </p>
    );
  }

  return <p>{error.message}</p>;
}

function buildFallbackFilterMetadata(): FilterMetadata {
  return {
    colors: [...cardColors],
    decks: [],
    rarities: [...cardRarities],
    sets: [],
    statuses: [...cardStatuses],
    universes: [],
  };
}

function mergeFilterMetadata(
  metadata: FilterMetadata | null,
  fallback: FilterMetadata,
): FilterMetadata {
  return {
    colors: metadata?.colors.length ? metadata.colors : fallback.colors,
    decks: metadata?.decks ?? fallback.decks,
    rarities: metadata?.rarities.length ? metadata.rarities : fallback.rarities,
    sets: metadata?.sets ?? fallback.sets,
    statuses: metadata?.statuses.length ? metadata.statuses : fallback.statuses,
    universes: metadata?.universes ?? fallback.universes,
  };
}

function toggleStringInArray(values: string[] | undefined, value: string): string[] | undefined {
  const current = values ?? [];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return next.length > 0 ? next : undefined;
}

function updateSearchParams(
  currentSearchParams: URLSearchParams,
  nextQueryString: string,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
): void {
  const nextSearchParams = new URLSearchParams(nextQueryString);
  const current = currentSearchParams.toString();
  const next = nextSearchParams.toString();

  if (current === next) {
    return;
  }

  setSearchParams(nextSearchParams, { preventScrollReset: true });
}

function CardsFilters({
  filterMetadata,
  filterMetadataUnavailable,
  query,
  searchParams,
  setSearchParams,
}: {
  filterMetadata: FilterMetadata;
  filterMetadataUnavailable: boolean;
  query: ReturnType<typeof parseCardListQuery>;
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}): ReactElement {
  function pushQuery(nextQuery: ReturnType<typeof parseCardListQuery>): void {
    updateSearchParams(searchParams, buildCardListQueryString(nextQuery), setSearchParams);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") ?? "").trim();

    pushQuery({
      ...query,
      page: undefined,
      q: q.length > 0 ? q : undefined,
    });
  }

  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>): void {
    const { name, value } = event.currentTarget;
    pushQuery({
      ...query,
      page: undefined,
      themeId: name === "setId" ? undefined : query.themeId,
      [name]: value.length > 0 ? value : undefined,
    });
  }

  function handleBooleanChange(event: ChangeEvent<HTMLSelectElement>): void {
    const { name, value } = event.currentTarget;
    const nextValue =
      value === "true" ? true : value === "false" ? false : undefined;

    pushQuery({
      ...query,
      page: undefined,
      [name]: nextValue,
    });
  }

  function handleMultiToggle(
    key: "color" | "rarity" | "status",
    value: string,
  ): void {
    pushQuery({
      ...query,
      page: undefined,
      [key]: toggleStringInArray(query[key], value),
    });
  }

  function clearFilters(): void {
    setSearchParams(new URLSearchParams(), { preventScrollReset: true });
  }

  const printableCardsPath = buildPrintableCardsPagePath({
    ...query,
    page: undefined,
    pageSize: undefined,
  });

  return (
    <section className="panel filters-panel">
      <div className="filters-header">
        <div>
          <strong>Search and filters</strong>
          <p>Filter the card catalog and keep the current view easy to return to.</p>
        </div>
        <div className="summary-row">
          <Link className="ghost-button" to={printableCardsPath}>
            Print sheet
          </Link>
          <button className="ghost-button" onClick={clearFilters} type="button">
            Clear all
          </button>
        </div>
      </div>

      <form className="search-form" onSubmit={handleSearchSubmit}>
        <label className="field">
          <span>Search cards</span>
          <input defaultValue={query.q ?? ""} name="q" placeholder="Name, title, slug, type, tag..." />
        </label>
        <button className="primary-button" type="submit">
          Apply
        </button>
      </form>

      <details className="filters-disclosure">
        <summary className="filters-disclosure-toggle">Show filters and sorting</summary>

        <div className="filters-disclosure-content">
          <div className="filters-grid">
            <label className="field">
              <span>Deck</span>
              <select name="deckId" onChange={handleSelectChange} value={query.deckId ?? ""}>
                <option value="">All decks</option>
                {filterMetadata.decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Universe</span>
              <select name="universeId" onChange={handleSelectChange} value={query.universeId ?? ""}>
                <option value="">All universes</option>
                {filterMetadata.universes.map((universe) => (
                  <option key={universe.id} value={universe.id}>
                    {universe.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Set</span>
              <select name="setId" onChange={handleSelectChange} value={query.setId ?? ""}>
                <option value="">All sets</option>
                {filterMetadata.sets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.name} ({set.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Sort</span>
              <select name="sort" onChange={handleSelectChange} value={query.sort ?? "name"}>
                <option value="name">Name</option>
                <option value="updatedAt">Updated</option>
                <option value="createdAt">Created</option>
                <option value="status">Status</option>
              </select>
            </label>

            <label className="field">
              <span>Direction</span>
              <select
                name="direction"
                onChange={handleSelectChange}
                value={query.direction ?? "asc"}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>

            <label className="field">
              <span>Has image</span>
              <select
                name="hasImage"
                onChange={handleBooleanChange}
                value={
                  query.hasImage === undefined ? "" : query.hasImage ? "true" : "false"
                }
              >
                <option value="">Any</option>
                <option value="true">Image available</option>
                <option value="false">No image</option>
              </select>
            </label>

            <label className="field">
              <span>Unresolved mechanics</span>
              <select
                name="hasUnresolvedMechanics"
                onChange={handleBooleanChange}
                value={
                  query.hasUnresolvedMechanics === undefined
                    ? ""
                    : query.hasUnresolvedMechanics
                      ? "true"
                      : "false"
                }
              >
                <option value="">Any</option>
                <option value="true">Has unresolved fields</option>
                <option value="false">Resolved only</option>
              </select>
            </label>
          </div>

          <div className="toggle-groups">
            <fieldset className="toggle-group">
              <legend>Status</legend>
              <div className="toggle-row">
                {filterMetadata.statuses.map((status) => (
                  <label key={status} className="toggle-chip">
                    <input
                      checked={query.status?.includes(status) ?? false}
                      onChange={() => handleMultiToggle("status", status)}
                      type="checkbox"
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="toggle-group">
              <legend>Colors</legend>
              <div className="toggle-row">
                {filterMetadata.colors.map((color) => (
                  <label key={color} className="toggle-chip">
                    <input
                      checked={query.color?.includes(color) ?? false}
                      onChange={() => handleMultiToggle("color", color)}
                      type="checkbox"
                    />
                    <span>{color}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="toggle-group">
              <legend>Rarity</legend>
              <div className="toggle-row">
                {filterMetadata.rarities.map((rarity) => (
                  <label key={rarity} className="toggle-chip">
                    <input
                      checked={query.rarity?.includes(rarity) ?? false}
                      onChange={() => handleMultiToggle("rarity", rarity)}
                      type="checkbox"
                    />
                    <span>{rarity}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {filterMetadataUnavailable ? (
            <p>Some filter options may be limited until the catalog metadata is available.</p>
          ) : null}
        </div>
      </details>
    </section>
  );
}

function SetThemePanel({
  selectedSet,
  query,
  searchParams,
  setSearchParams,
}: {
  selectedSet: SetDetail;
  query: ReturnType<typeof parseCardListQuery>;
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}): ReactElement | null {
  if (selectedSet.themes.length <= 1) {
    return null;
  }

  return (
    <section className="panel filters-panel">
      <div className="filters-header">
        <div>
          <strong>Set art theme</strong>
          <p>
            Preview <strong>{selectedSet.name}</strong> with a different art theme without
            changing the canonical set JSON.
          </p>
        </div>
      </div>

      <div className="filters-grid">
        <label className="field">
          <span>Theme</span>
          <select
            value={query.themeId ?? ""}
            onChange={(event) =>
              updateSearchParams(
                searchParams,
                buildCardListQueryString({
                  ...query,
                  page: undefined,
                  themeId: event.currentTarget.value || undefined,
                }),
                setSearchParams,
              )
            }
          >
            <option value="">
              Set default
              {selectedSet.activeThemeId ? ` (${selectedSet.activeThemeId})` : ""}
            </option>
            {selectedSet.themes.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function CardCatalogPreviewModal({
  card,
  hasNextCard,
  hasPreviousCard,
  onClose,
  onShowNextCard,
  onShowPreviousCard,
}: {
  card: CardListItem;
  hasNextCard: boolean;
  hasPreviousCard: boolean;
  onClose: () => void;
  onShowNextCard: () => void;
  onShowPreviousCard: () => void;
}): ReactElement | null {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogId = useId();

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowLeft" && hasPreviousCard) {
        event.preventDefault();
        onShowPreviousCard();
        return;
      }

      if (event.key === "ArrowRight" && hasNextCard) {
        event.preventDefault();
        onShowNextCard();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasNextCard, hasPreviousCard, onClose, onShowNextCard, onShowPreviousCard]);

  if (typeof document === "undefined") {
    return null;
  }

  const modal = (
    <div
      className="card-preview-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        id={dialogId}
        aria-label={`${card.name} preview`}
        aria-modal="true"
        className="card-preview-modal card-catalog-preview-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="card-preview-toolbar">
          <button
            aria-label="Close preview"
            className="card-preview-close"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="card-preview-stage">
          <button
            aria-label="Previous card"
            className="card-preview-nav card-preview-nav-left"
            disabled={!hasPreviousCard}
            onClick={onShowPreviousCard}
            type="button"
          >
            ←
          </button>
          <div className="card-preview-shell card-catalog-preview-shell">
            <DisplayCard
              className="card-catalog-preview-card"
              model={mapCloudArcanumCardToDisplayCard(card)}
            />
          </div>
          <button
            aria-label="Next card"
            className="card-preview-nav card-preview-nav-right"
            disabled={!hasNextCard}
            onClick={onShowNextCard}
            type="button"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export function CardsPage({ apiBaseUrl }: CardsPageProps): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const [previewCardIndex, setPreviewCardIndex] = useState<number | null>(null);
  const searchParamsKey = searchParams.toString();
  const query = parseCardListQuery(searchParams);
  const api = createCloudArcanumApiClient({ baseUrl: apiBaseUrl });

  useEffect(() => {
    setPreviewCardIndex(null);
  }, [searchParamsKey]);

  const cardsState = useApiRequest(
    async (signal) => {
      const response = await api.listCards(query, { signal });
      return { items: response.data, meta: response.meta };
    },
    [apiBaseUrl, searchParamsKey],
  ) as ListResourceState<CardListItem, CardsListMeta>;

  const filtersState = useApiRequest(
    async (signal) => {
      const response = await api.getMetaFilters({ signal });
      return response.data;
    },
    [apiBaseUrl],
  );

  const selectedSetState = useApiRequest(
    async (signal) => {
      if (!query.setId) {
        return null;
      }

      const response = await api.getSetDetailWithQuery(
        { setId: query.setId as SetId },
        { themeId: query.themeId },
        { signal },
      );
      return response.data;
    },
    [apiBaseUrl, query.setId, query.themeId],
  );

  const fallbackFilters = buildFallbackFilterMetadata();
  const filterMetadata = mergeFilterMetadata(filtersState.data, fallbackFilters);
  const filterMetadataUnavailable = filtersState.status === "error";

  return (
    <PageLayout>
      <CardsFilters
        filterMetadata={filterMetadata}
        filterMetadataUnavailable={filterMetadataUnavailable}
        query={query}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />

      {selectedSetState.status === "success" && selectedSetState.data ? (
        <SetThemePanel
          selectedSet={selectedSetState.data}
          query={query}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      ) : null}

      {cardsState.status === "loading" || cardsState.status === "idle" ? (
        <LoadingState
          title="Loading cards"
          description="Getting the latest card list."
        />
      ) : null}

      {cardsState.status === "error" && cardsState.error ? (
        <ErrorState
          title="Cards unavailable"
          description="We couldn't load cards right now."
          details={
            <>
              {formatApiErrorDetails(cardsState.error)}
              <p>Please try again in a moment.</p>
            </>
          }
        />
      ) : null}

      {cardsState.status === "success" && cardsState.data ? (
        (() => {
          const items = cardsState.data.items;
          const previewCard =
            previewCardIndex === null ? null : items[previewCardIndex] ?? null;

          function showPreviousPreviewCard(): void {
            setPreviewCardIndex((currentIndex) =>
              currentIndex === null ? null : Math.max(0, currentIndex - 1),
            );
          }

          function showNextPreviewCard(): void {
            setPreviewCardIndex((currentIndex) =>
              currentIndex === null
                ? null
                : Math.min(items.length - 1, currentIndex + 1),
            );
          }

          return items.length > 0 ? (
            <>
              <div className="summary-row">
                <div className="summary-pill">
                  <strong>{items.length}</strong> of{" "}
                  <strong>{cardsState.data.meta.total}</strong>
                </div>
              </div>
              <section className="cards-gallery cards-gallery-printlike">
                {items.map((card, index) => {
                  const stackSlot = Math.min(index, 10);
                  const cardStyle: CSSProperties & Record<string, string | number> = {
                    zIndex: index + 1,
                    ["--card-stack-shift"]: `${stackSlot * 0.42}rem`,
                    ["--card-stack-lift"]: `${stackSlot * 0.06}rem`,
                    ["--card-stack-tilt"]: `${((index % 5) - 2) * 0.3}deg`,
                  };

                  return (
                    <button
                      key={card.id}
                      aria-label={`Open ${card.name}`}
                      aria-haspopup="dialog"
                      className="card-face-link"
                      onClick={() => setPreviewCardIndex(index)}
                      style={cardStyle}
                      type="button"
                    >
                      <DisplayCard model={mapCloudArcanumCardToDisplayCard(card)} />
                    </button>
                  );
                })}
              </section>
              {previewCard ? (
                <CardCatalogPreviewModal
                  card={previewCard}
                  hasNextCard={previewCardIndex !== null && previewCardIndex < items.length - 1}
                  hasPreviousCard={previewCardIndex !== null && previewCardIndex > 0}
                  onClose={() => setPreviewCardIndex(null)}
                  onShowNextCard={showNextPreviewCard}
                  onShowPreviousCard={showPreviousPreviewCard}
                />
              ) : null}
            </>
          ) : (
          <EmptyState
            title="No cards matched"
            description="No cards match the current filters."
            actions={
              <p>Try clearing filters or broadening your search.</p>
            }
          />
          );
        })()
      ) : null}
    </PageLayout>
  );
}
