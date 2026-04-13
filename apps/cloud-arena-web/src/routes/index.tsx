import type { ReactElement } from "react";
import {
  Link,
  Outlet,
  createBrowserRouter,
  isRouteErrorResponse,
  useRouteError,
} from "react-router-dom";

import { CloudArenaAppShell, ErrorState, PageLayout } from "../components/index.js";
import { CloudArenaInteractivePage } from "./interactive-page.js";
import { CloudArenaTraceViewerPage } from "./trace-viewer-page.js";

type CloudArenaRouteContext = {
  apiBaseUrl: string;
  cloudArcanumWebBaseUrl: string;
};

function CloudArenaFrame({
  cloudArcanumWebBaseUrl,
}: {
  cloudArcanumWebBaseUrl: string;
}): ReactElement {
  return (
    <CloudArenaAppShell cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl}>
      <Outlet />
    </CloudArenaAppShell>
  );
}

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
              Return to <Link className="text-link" to="/">battle</Link>,{" "}
              <Link className="text-link" to="/trace-viewer">replay</Link>, or{" "}
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
  return createBrowserRouter([
    {
      path: "/",
      element: <CloudArenaFrame cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl} />,
      children: [
        {
          index: true,
          element: <CloudArenaInteractivePage apiBaseUrl={context.apiBaseUrl} />,
        },
        {
          path: "trace-viewer",
          element: <CloudArenaTraceViewerPage />,
        },
      ],
      errorElement: (
        <CloudArenaAppShell cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl}>
          <CloudArenaRouteErrorBoundary cloudArcanumWebBaseUrl={context.cloudArcanumWebBaseUrl} />
        </CloudArenaAppShell>
      ),
    },
  ]);
}
