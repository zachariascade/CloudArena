import type { FormEvent, ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";

import type {
  FilterMetadata,
  SetListItem,
} from "../../../../src/cloud-arcanum/api-contract.js";
import type { CardStatus, SetId } from "../../../../src/domain/index.js";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
} from "../components/index.js";
import {
  buildCardsPagePath,
  CloudArcanumApiClientError,
  buildSetListQueryString,
  createCloudArcanumApiClient,
  parseSetListQuery,
  useApiRequest,
} from "../lib/cloud-arcanum-lib.js";

type SetsPageProps = {
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

function toStatusTone(status: CardStatus): string {
  switch (status) {
    case "approved":
      return "approved";
    case "balanced":
      return "balanced";
    case "templating":
      return "templating";
    case "draft":
    default:
      return "draft";
  }
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

function StatusBadge({
  label,
  status,
}: {
  label: string;
  status: CardStatus;
}): ReactElement {
  return (
    <span className={`status-badge ${toStatusTone(status)}`}>
      {label}
    </span>
  );
}

function SetsFilters({
  filterMetadata,
  metadataUnavailable,
  query,
  searchParams,
  setSearchParams,
}: {
  filterMetadata: FilterMetadata | null;
  metadataUnavailable: boolean;
  query: ReturnType<typeof parseSetListQuery>;
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}): ReactElement {
  const hasExpandedFilters =
    query.universeId !== undefined || query.sort !== undefined || query.direction !== undefined;

  function pushQuery(nextQuery: ReturnType<typeof parseSetListQuery>): void {
    updateSearchParams(searchParams, buildSetListQueryString(nextQuery), setSearchParams);
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
          <strong>Search sets</strong>
          <p>Find sets by name, universe, and sort order.</p>
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
          <span>Search sets</span>
          <input type="search" name="q" defaultValue={query.q ?? ""} placeholder="Try Beginnings" />
        </label>
        <button type="submit" className="primary-button">
          Apply set query
        </button>
      </form>

      <details className="filters-disclosure" open={hasExpandedFilters}>
        <summary className="filters-disclosure-toggle">Show filters and sorting</summary>

        <div className="filters-disclosure-content">
          <div className="filters-grid">
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
              <span>Sort</span>
              <select
                value={`${query.sort ?? "name"}:${query.direction ?? "asc"}`}
                onChange={(event) => {
                  const [sort, direction] = event.currentTarget.value.split(":") as [
                    "code" | "name",
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
                <option value="code:asc">Code A-Z</option>
                <option value="code:desc">Code Z-A</option>
              </select>
            </label>
          </div>

          {metadataUnavailable ? (
            <div className="warning-callout neutral-callout">
              <strong>Some filters are still loading</strong>
              <p>The universe selector will appear once the full catalog metadata is ready.</p>
            </div>
          ) : null}
        </div>
      </details>
    </section>
  );
}

function SetResultCard({ item }: { item: SetListItem }): ReactElement {
  return (
    <article className="collection-result">
      <div className="collection-result-header">
        <div>
          <h3>
            <Link className="text-link" to={buildCardsPagePath({ setId: item.id })}>
              {item.name}
            </Link>
          </h3>
          <p>
            <strong>{item.code}</strong> in{" "}
            <Link className="text-link" to={buildCardsPagePath({ universeId: item.universe.id })}>
              {item.universe.name}
            </Link>
          </p>
        </div>
        <div className="summary-pill">
          Cards <strong>{item.cardCount}</strong>
        </div>
      </div>

      {item.description ? <p>{item.description}</p> : <p className="detail-placeholder">Description not provided.</p>}

      <div className="status-chip-row">
        <StatusBadge label={`Draft ${item.countsByStatus.draft}`} status="draft" />
        <StatusBadge label={`Templating ${item.countsByStatus.templating}`} status="templating" />
        <StatusBadge label={`Balanced ${item.countsByStatus.balanced}`} status="balanced" />
        <StatusBadge label={`Approved ${item.countsByStatus.approved}`} status="approved" />
      </div>
    </article>
  );
}

export function SetsPage({ apiBaseUrl }: SetsPageProps): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = parseSetListQuery(searchParams);
  const api = createCloudArcanumApiClient({ baseUrl: apiBaseUrl });

  const setsState = useApiRequest(
    async (signal) => {
      const response = await api.listSets(query, { signal });
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

  const filterMetadata = metadataState.status === "success" ? metadataState.data : null;

  return (
    <PageLayout>
      <SetsFilters
        filterMetadata={filterMetadata}
        metadataUnavailable={metadataState.status === "error"}
        query={query}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />

      {setsState.status === "loading" || setsState.status === "idle" ? (
        <LoadingState
          title="Loading sets"
          description="Getting the latest set list."
        />
      ) : null}

      {setsState.status === "error" && setsState.error ? (
        <ErrorState
          title="Sets unavailable"
          description="We couldn't load sets right now."
          details={formatApiErrorDetails(setsState.error)}
        />
      ) : null}

      {setsState.status === "success" && setsState.data ? (
        setsState.data.items.length > 0 ? (
          <div className="data-list">
            <div className="summary-row">
              <div className="summary-pill">
                <strong>{setsState.data.items.length}</strong> of{" "}
                <strong>{setsState.data.meta.total}</strong>
              </div>
            </div>

            <div className="collection-results">
              {setsState.data.items.map((item) => (
                <SetResultCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No sets matched"
            description="No sets match the current filters."
          />
        )
      ) : null}
    </PageLayout>
  );
}
