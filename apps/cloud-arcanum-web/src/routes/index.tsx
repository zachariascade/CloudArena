import type { ReactElement } from "react";
import {
  Link,
  Navigate,
  Outlet,
  createBrowserRouter,
  isRouteErrorResponse,
  useRouteError,
} from "react-router-dom";

import type {
  CardsListMeta,
  CardListItem,
} from "../../../../src/cloud-arcanum/api-contract.js";
import {
  AppShell,
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
} from "../components/index.js";
import {
  CloudArcanumApiClientError,
  createCloudArcanumApiClient,
  useApiRequest,
} from "../lib/index.js";
import { CardDetailPage } from "./card-detail-page.js";
import { CardsPage } from "./cards-page.js";
import { DecksPage } from "./decks-page.js";
import { SetsPage } from "./sets-page.js";
import { UniversesPage } from "./universes-page.js";

type AppRouteContext = {
  apiBaseUrl: string;
};

function AppFrame({ apiBaseUrl }: AppRouteContext): ReactElement {
  void apiBaseUrl;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function RouteErrorBoundary(): ReactElement {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <PageLayout
        kicker="Route error"
        title="This page could not be rendered"
        description="The route matched, but something went wrong while resolving it."
      >
        <ErrorState
          title={`Request failed with ${error.status}`}
          description={error.statusText || "The router reported an unexpected failure."}
          details={
            <p>
              Return to <Link className="text-link" to="/cards">cards</Link>, then use the main
              navigation to continue browsing.
            </p>
          }
        />
      </PageLayout>
    );
  }

  const message = error instanceof Error ? error.message : "Unexpected route error.";

  return (
    <PageLayout
      kicker="Route error"
      title="This page could not be rendered"
      description="The router hit an unexpected exception."
    >
      <ErrorState
        title="Unhandled route error"
        description="A route-level error boundary caught a failure before the app could finish rendering."
        details={<p>{message}</p>}
      />
    </PageLayout>
  );
}

function NotFoundPage(): ReactElement {
  return (
    <PageLayout
      kicker="Not found"
      title="Route not found"
      description="The URL does not match a known Cloud Arcanum page."
    >
      <EmptyState
        title="There is nothing at this address."
        description="Start with cards, then move to decks, sets, or universes if you want a narrower view."
        actions={
          <ul>
            <li>
              <Link className="text-link" to="/cards">
                Return to cards
              </Link>
            </li>
            <li>
              <Link className="text-link" to="/decks">
                Browse decks
              </Link>
            </li>
            <li>
              <Link className="text-link" to="/sets">
                Browse sets
              </Link>
            </li>
            <li>
              <Link className="text-link" to="/universes">
                Browse universes
              </Link>
            </li>
          </ul>
        }
      />
    </PageLayout>
  );
}

function formatFiltersApplied(filtersApplied: Record<string, unknown>): ReactElement {
  const entries = Object.entries(filtersApplied);

  if (entries.length === 0) {
    return (
      <p>
        No query-string filters are applied right now. Add params like <code>?q=angel</code> or{" "}
        <code>?sort=name&amp;direction=asc</code> to exercise the helpers.
      </p>
    );
  }

  return (
    <dl className="query-list">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt>
            <strong>{key}</strong>
          </dt>
          <dd>
            <code>{JSON.stringify(value)}</code>
          </dd>
        </div>
      ))}
    </dl>
  );
}

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

type ListResourceState<TItem, TMeta extends { total: number; filtersApplied: Record<string, unknown> }> =
  {
    data: {
      items: TItem[];
      meta: TMeta;
    } | null;
    error: Error | CloudArcanumApiClientError | null;
    status: "idle" | "loading" | "success" | "error";
  };

type ListPageProps<TItem, TMeta extends { total: number; filtersApplied: Record<string, unknown> }> = {
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  heading: string;
  kicker: string;
  listLabel: string;
  state: ListResourceState<TItem, TMeta>;
};

function ListResourcePage<TItem, TMeta extends { total: number; filtersApplied: Record<string, unknown> }>({
  description,
  emptyDescription,
  emptyTitle,
  heading,
  kicker,
  listLabel,
  state,
}: ListPageProps<TItem, TMeta>): ReactElement {
  return (
    <PageLayout kicker={kicker} title={heading} description={description}>
      {state.status === "loading" || state.status === "idle" ? (
        <LoadingState
          title={`Loading ${listLabel.toLowerCase()}`}
          description="Fetching the list route with typed query parsing and shared async UI primitives."
        />
      ) : null}
      {state.status === "error" && state.error ? (
        <ErrorState
          title={`${listLabel} request failed`}
          description="The route hook is working, but the API request did not return a successful response."
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
            <section className="panel">
              <strong>Filters applied</strong>
              <div style={{ height: "0.75rem" }} />
              {formatFiltersApplied(state.data.meta.filtersApplied)}
            </section>
            <section className="grid">
              {state.data.items.slice(0, 6).map((item, index) => (
                <article key={index} className="card">
                  <strong>{listLabel} result {index + 1}</strong>
                  <code>{JSON.stringify(item, null, 2)}</code>
                </article>
              ))}
            </section>
          </div>
        ) : (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actions={
              <>
                {formatFiltersApplied(state.data.meta.filtersApplied)}
                <p>
                  This route is deep-linkable, so you can safely reload or share the current URL.
                </p>
              </>
            }
          />
        )
      ) : null}
    </PageLayout>
  );
}

export function createCloudArcanumRouter(context: AppRouteContext) {
  return createBrowserRouter([
    {
      path: "/",
      element: <AppFrame apiBaseUrl={context.apiBaseUrl} />,
      children: [
        {
          index: true,
          element: <Navigate replace to="/cards" />,
        },
        {
          path: "cards",
          element: <CardsPage apiBaseUrl={context.apiBaseUrl} />,
        },
        {
          path: "cards/:cardId",
          element: <CardDetailPage apiBaseUrl={context.apiBaseUrl} />,
        },
        {
          path: "decks",
          element: <DecksPage apiBaseUrl={context.apiBaseUrl} />,
        },
        {
          path: "sets",
          element: <SetsPage apiBaseUrl={context.apiBaseUrl} />,
        },
        {
          path: "universes",
          element: <UniversesPage apiBaseUrl={context.apiBaseUrl} />,
        },
        {
          path: "*",
          element: <NotFoundPage />,
        },
      ],
      errorElement: (
        <AppShell>
          <RouteErrorBoundary />
        </AppShell>
      ),
    },
  ]);
}
