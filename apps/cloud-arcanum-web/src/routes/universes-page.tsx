import type { FormEvent, ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";

import type { UniverseListItem } from "../../../../src/cloud-arcanum/api-contract.js";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
} from "../components/index.js";
import {
  buildCardsPagePath,
  CloudArcanumApiClientError,
  buildUniverseListQueryString,
  createCloudArcanumApiClient,
  parseUniverseListQuery,
  useApiRequest,
} from "../lib/index.js";

type UniversesPageProps = {
  apiBaseUrl: string;
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

function UniversesFilters({
  query,
  searchParams,
  setSearchParams,
}: {
  query: ReturnType<typeof parseUniverseListQuery>;
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}): ReactElement {
  const hasExpandedFilters = query.sort !== undefined || query.direction !== undefined;

  function pushQuery(nextQuery: ReturnType<typeof parseUniverseListQuery>): void {
    updateSearchParams(searchParams, buildUniverseListQueryString(nextQuery), setSearchParams);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const q = String(formData.get("q") ?? "").trim();

    pushQuery({
      ...query,
      page: undefined,
      q: q || undefined,
    });
  }

  return (
    <section className="panel filters-panel">
      <div className="filters-header">
        <div>
          <strong>Search universes</strong>
          <p>Sort universes by name or record counts, then open the sets and decks inside each one.</p>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={() => setSearchParams(new URLSearchParams(), { preventScrollReset: true })}
        >
          Clear filters
        </button>
      </div>

      <form className="search-form" onSubmit={handleSearchSubmit}>
        <label className="field">
          <span>Search universes</span>
          <input type="search" name="q" defaultValue={query.q ?? ""} placeholder="Try Biblical" />
        </label>
        <button type="submit" className="primary-button">
          Apply universe query
        </button>
      </form>

      <details className="filters-disclosure" open={hasExpandedFilters}>
        <summary className="filters-disclosure-toggle">Show filters and sorting</summary>

        <div className="filters-disclosure-content">
          <div className="filters-grid">
            <label className="field">
              <span>Sort</span>
              <select
                value={`${query.sort ?? "name"}:${query.direction ?? "asc"}`}
                onChange={(event) => {
                  const [sort, direction] = event.currentTarget.value.split(":") as [
                    "name",
                    "asc" | "desc",
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
              </select>
            </label>
          </div>
        </div>
      </details>
    </section>
  );
}

function UniverseResultCard({ item }: { item: UniverseListItem }): ReactElement {
  return (
    <article className="collection-result">
      <div className="collection-result-header">
        <div>
          <h3>
            <Link className="text-link" to={buildCardsPagePath({ universeId: item.id })}>
              {item.name}
            </Link>
          </h3>
          <p>{item.description ?? "Description pending."}</p>
        </div>
      </div>

      <div className="deck-stat-grid">
        <div className="meta-tile">
          <span>Sets</span>
          <strong>{item.setCount}</strong>
        </div>
        <div className="meta-tile">
          <span>Cards</span>
          <strong>{item.cardCount}</strong>
        </div>
        <div className="meta-tile">
          <span>Decks</span>
          <strong>{item.deckCount}</strong>
        </div>
      </div>
    </article>
  );
}

export function UniversesPage({ apiBaseUrl }: UniversesPageProps): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = parseUniverseListQuery(searchParams);
  const api = createCloudArcanumApiClient({ baseUrl: apiBaseUrl });

  const state = useApiRequest(
    async (signal) => {
      const response = await api.listUniverses(query, { signal });
      return { items: response.data, meta: response.meta };
    },
    [apiBaseUrl, searchParams.toString()],
  );

  return (
    <PageLayout
      kicker="Universe browsing"
      title="Universes"
      description="Browse top-level universes and inspect the sets and decks nested inside them."
    >
      <UniversesFilters query={query} searchParams={searchParams} setSearchParams={setSearchParams} />

      {state.status === "loading" || state.status === "idle" ? (
        <LoadingState
          title="Loading universes"
          description="Fetching universe summaries and relationship counts from the API."
        />
      ) : null}

      {state.status === "error" && state.error ? (
        <ErrorState
          title="Universe list request failed"
          description="The universe list route is wired up, but the backend did not return a successful response."
          details={formatApiErrorDetails(state.error)}
        />
      ) : null}

      {state.status === "success" && state.data ? (
        state.data.items.length > 0 ? (
          <div className="data-list">
            <div className="summary-row">
              <div className="summary-pill">
                Total <strong>{state.data.meta.total}</strong>
              </div>
              <div className="summary-pill">
                Loaded <strong>{state.data.items.length}</strong>
              </div>
            </div>

            <div className="collection-results">
              {state.data.items.map((item) => (
                <UniverseResultCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No universes matched"
            description="The request succeeded, but no universes matched the current filters."
          />
        )
      ) : null}
    </PageLayout>
  );
}
