import type { FormEvent, ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";

import type {
  DeckListItem,
  DecksListMeta,
  FilterMetadata,
} from "../../../../src/cloud-arcanum/api-contract.js";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
} from "../components/index.js";
import {
  buildCardsPagePath,
  CloudArcanumApiClientError,
  buildDeckListQueryString,
  createCloudArcanumApiClient,
  parseDeckListQuery,
  useApiRequest,
} from "../lib/index.js";

type DecksPageProps = {
  apiBaseUrl: string;
};

type DeckSortDirection = "asc" | "desc";

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

function updateSearchParams(
  currentSearchParams: URLSearchParams,
  nextQueryString: string,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
): void {
  const nextSearchParams = new URLSearchParams(nextQueryString);

  if (currentSearchParams.toString() === nextSearchParams.toString()) {
    return;
  }

  setSearchParams(nextSearchParams, { preventScrollReset: true });
}

function DeckSignalBadge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "warning" | "danger";
}): ReactElement {
  return <span className={`signal-badge ${tone}`}>{label}</span>;
}

function DecksFilters({
  filterMetadata,
  metadataUnavailable,
  query,
  searchParams,
  setSearchParams,
}: {
  filterMetadata: FilterMetadata | null;
  metadataUnavailable: boolean;
  query: ReturnType<typeof parseDeckListQuery>;
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}): ReactElement {
  const hasExpandedFilters =
    query.containsCardId !== undefined ||
    query.universeId !== undefined ||
    query.setId !== undefined ||
    query.sort !== undefined ||
    query.direction !== undefined;

  function pushQuery(nextQuery: ReturnType<typeof parseDeckListQuery>): void {
    updateSearchParams(searchParams, buildDeckListQueryString(nextQuery), setSearchParams);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") ?? "").trim();
    const containsCardId = String(formData.get("containsCardId") ?? "").trim();

    pushQuery({
      ...query,
      containsCardId: containsCardId || undefined,
      page: undefined,
      q: q || undefined,
    });
  }

  function handleClearFilters(): void {
    setSearchParams(new URLSearchParams(), { preventScrollReset: true });
  }

  const selectedSort = query.sort ?? "name";
  const selectedDirection = query.direction ?? "asc";

  return (
    <section className="panel filters-panel">
      <div className="filters-header">
        <div>
          <strong>Search and filter decks</strong>
          <p>Find decks by name, universe, set, or card.</p>
        </div>
        <button type="button" className="ghost-button" onClick={handleClearFilters}>
          Clear filters
        </button>
      </div>

      <form className="search-form" onSubmit={handleSearchSubmit}>
        <label className="field">
          <span>Search decks</span>
          <input
            type="search"
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Try Tribe of Promise"
          />
        </label>
        <details className="filters-disclosure" open={hasExpandedFilters}>
          <summary className="filters-disclosure-toggle">Show filters and sorting</summary>

          <div className="filters-disclosure-content">
            <div className="filters-grid">
              <label className="field">
                <span>Contains card id</span>
                <input
                  type="search"
                  name="containsCardId"
                  defaultValue={query.containsCardId ?? ""}
                  placeholder="card_0123"
                />
              </label>

              <label className="field">
                <span>Universe</span>
                <select
                  value={query.universeId ?? ""}
                  onChange={(event) =>
                    pushQuery({
                      ...query,
                      page: undefined,
                      universeId: event.currentTarget.value || undefined,
                    })
                  }
                >
                  <option value="">All universes</option>
                  {(filterMetadata?.universes ?? []).map((universe) => (
                    <option key={universe.id} value={universe.id}>
                      {universe.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Set</span>
                <select
                  value={query.setId ?? ""}
                  onChange={(event) =>
                    pushQuery({
                      ...query,
                      page: undefined,
                      setId: event.currentTarget.value || undefined,
                    })
                  }
                >
                  <option value="">All sets</option>
                  {(filterMetadata?.sets ?? []).map((set) => (
                    <option key={set.id} value={set.id}>
                      {set.name} ({set.code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Sort</span>
                <select
                  value={`${selectedSort}:${selectedDirection}`}
                  onChange={(event) => {
                    const [sort, direction] = event.currentTarget.value.split(":") as [
                      "format" | "name",
                      DeckSortDirection,
                    ];

                    pushQuery({
                      ...query,
                      direction,
                      page: undefined,
                      sort,
                    });
                  }}
                >
                  <option value="name:asc">Name A-Z</option>
                  <option value="name:desc">Name Z-A</option>
                  <option value="format:asc">Format A-Z</option>
                  <option value="format:desc">Format Z-A</option>
                </select>
              </label>
            </div>

            {metadataUnavailable ? (
              <div className="warning-callout neutral-callout">
                <strong>Some filters are still loading</strong>
                <p>Universe and set options will appear once the full catalog metadata is ready.</p>
              </div>
            ) : null}
          </div>
        </details>

        <button type="submit" className="primary-button">
          Apply deck query
        </button>
      </form>
    </section>
  );
}

function DeckListCard({ deck }: { deck: DeckListItem }): ReactElement {
  return (
    <article className="deck-result">
      <div className="deck-result-header">
        <div>
          <h3>
            <Link className="text-link" to={buildCardsPagePath({ deckId: deck.id })}>
              {deck.name}
            </Link>
          </h3>
          <p>
            {deck.format} deck in{" "}
            <Link className="text-link" to={buildCardsPagePath({ universeId: deck.universe.id })}>
              {deck.universe.name}
            </Link>
          </p>
        </div>
        <div className="card-result-signals">
          <DeckSignalBadge
            label={deck.commander ? "Commander assigned" : "Commander TBD"}
            tone={deck.commander ? "neutral" : "warning"}
          />
          <DeckSignalBadge
            label={
              deck.validation.hasErrors
                ? `${deck.validation.errorCount} validation issues`
                : "Validation clean"
            }
            tone={deck.validation.hasErrors ? "danger" : "neutral"}
          />
        </div>
      </div>

      <div className="deck-stat-grid">
        <div className="meta-tile">
          <span>Total cards</span>
          <strong>{deck.cardCount}</strong>
        </div>
        <div className="meta-tile">
          <span>Unique cards</span>
          <strong>{deck.uniqueCardCount}</strong>
        </div>
        <div className="meta-tile">
          <span>Sets represented</span>
          <strong>{deck.setCount}</strong>
        </div>
        <div className="meta-tile">
          <span>Commander</span>
          <strong>{deck.commander?.name ?? "Unassigned"}</strong>
        </div>
      </div>

      <div className="card-result-tags">
        {deck.tags.length > 0 ? (
          deck.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))
        ) : (
          <span className="tag-chip">No tags</span>
        )}
      </div>
    </article>
  );
}

export function DecksPage({ apiBaseUrl }: DecksPageProps): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = parseDeckListQuery(searchParams);
  const api = createCloudArcanumApiClient({ baseUrl: apiBaseUrl });

  const decksState = useApiRequest(
    async (signal) => {
      const response = await api.listDecks(query, { signal });
      return { items: response.data, meta: response.meta };
    },
    [apiBaseUrl, searchParams.toString()],
  );

  const metadataState = useApiRequest(
    async (signal) => {
      const response = await api.getMetaFilters({ signal });
      return response.data;
    },
    [apiBaseUrl],
  );

  const filterMetadataUnavailable = metadataState.status === "error";
  const filterMetadata =
    metadataState.status === "success" && metadataState.data ? metadataState.data : null;

  return (
    <PageLayout
      kicker="Browse decks"
      title="Decks"
      description="Search decks, review commanders, and open the cards they contain."
    >
      <DecksFilters
        filterMetadata={filterMetadata}
        metadataUnavailable={filterMetadataUnavailable}
        query={query}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />

      {decksState.status === "loading" || decksState.status === "idle" ? (
        <LoadingState
          title="Loading decks"
          description="Getting the latest deck list."
        />
      ) : null}

      {decksState.status === "error" && decksState.error ? (
        <ErrorState
          title="Decks unavailable"
          description="We couldn't load decks right now."
          details={formatApiErrorDetails(decksState.error)}
        />
      ) : null}

      {decksState.status === "success" && decksState.data ? (
        decksState.data.items.length > 0 ? (
          <div className="data-list">
            <div className="summary-row">
              <div className="summary-pill">
                Total <strong>{decksState.data.meta.total}</strong>
              </div>
              <div className="summary-pill">
                Loaded <strong>{decksState.data.items.length}</strong>
              </div>
              <div className="summary-pill">
                Query <strong>{query.q ? `"${query.q}"` : "All decks"}</strong>
              </div>
            </div>

            <div className="deck-results">
              {decksState.data.items.map((deck) => (
                <DeckListCard key={deck.id} deck={deck} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No decks matched"
            description="No decks match the current filters."
            actions={
              <p>Try clearing filters or searching for a broader term like <code>?q=promise</code>.</p>
            }
          />
        )
      ) : null}
    </PageLayout>
  );
}
