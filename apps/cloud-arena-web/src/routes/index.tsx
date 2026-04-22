import type { ReactElement } from "react";
import {
  Link,
  createBrowserRouter,
  createHashRouter,
  isRouteErrorResponse,
  useRouteError,
} from "react-router-dom";

import { CloudArenaAppShell, ErrorState, PageLayout } from "../components/index.js";
import type { CloudArenaContentMode, CloudArenaSessionMode } from "../lib/cloud-arena-web-lib.js";
import { CloudArenaDeckBuilderPage } from "./deckbuilder-page.js";
import { CloudArenaInteractivePage } from "./interactive-page.js";
import { CloudArenaStartPage } from "./start-page.js";
import { CloudArenaSetupPage } from "./setup-page.js";

type CloudArenaRouteContext = {
  apiBaseUrl: string;
  contentMode: CloudArenaContentMode;
  sessionMode: CloudArenaSessionMode;
  routerMode?: "browser" | "hash";
  cloudArcanumWebBaseUrl: string;
};

function CloudArenaRouteErrorBoundary({
  cloudArcanumWebBaseUrl,
}: {
  cloudArcanumWebBaseUrl: string;
}): ReactElement {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <PageLayout
        kicker="Route error"
        title="This Arena page could not be rendered"
        description="The route matched, but something went wrong while resolving it."
      >
        <ErrorState
          title={`Request failed with ${error.status}`}
          description={error.statusText || "The router reported an unexpected failure."}
          details={
            <p>
              Return to the <Link className="text-link" to="/">start menu</Link>, or{" "}
              <a className="text-link" href={`${cloudArcanumWebBaseUrl.replace(/\/$/, "")}/cards`}>
                card catalog
              </a>
              .
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
      title="This Arena page could not be rendered"
      description="The router hit an unexpected exception."
    >
      <ErrorState
        title="Unhandled route error"
        description="A route-level error boundary caught a failure before the Arena UI could finish rendering."
        details={<p>{message}</p>}
      />
    </PageLayout>
  );
}

export function createCloudArenaRouter(context: CloudArenaRouteContext) {
  const routes = [
    {
      path: "/",
      element: (
        <CloudArenaStartPage
          apiBaseUrl={context.apiBaseUrl}
          contentMode={context.contentMode}
          cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl}
        />
      ),
      errorElement: (
        <CloudArenaAppShell cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl}>
          <CloudArenaRouteErrorBoundary cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl} />
        </CloudArenaAppShell>
      ),
    },
    {
      path: "/battle",
      element: (
        <CloudArenaInteractivePage
          apiBaseUrl={context.apiBaseUrl}
          contentMode={context.contentMode}
          sessionMode={context.sessionMode}
          cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl}
        />
      ),
      errorElement: (
        <CloudArenaAppShell cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl}>
          <CloudArenaRouteErrorBoundary cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl} />
        </CloudArenaAppShell>
      ),
    },
    {
      path: "/run",
      element: (
        <CloudArenaSetupPage
          apiBaseUrl={context.apiBaseUrl}
          contentMode={context.contentMode}
          cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl}
        />
      ),
      errorElement: (
        <CloudArenaAppShell cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl}>
          <CloudArenaRouteErrorBoundary cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl} />
        </CloudArenaAppShell>
      ),
    },
    {
      path: "/decks",
      element: (
        <CloudArenaDeckBuilderPage
          apiBaseUrl={context.apiBaseUrl}
          contentMode={context.contentMode}
          cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl}
        />
      ),
      errorElement: (
        <CloudArenaAppShell cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl}>
          <CloudArenaRouteErrorBoundary cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl} />
        </CloudArenaAppShell>
      ),
    },
  ];

  return context.routerMode === "hash"
    ? createHashRouter(routes)
    : createBrowserRouter(routes);
}
