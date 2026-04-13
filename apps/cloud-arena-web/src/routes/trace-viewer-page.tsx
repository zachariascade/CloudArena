import type { ReactElement } from "react";

import { CloudArenaTraceViewer, PageLayout } from "../components/index.js";
import { cloudArenaSampleTrace } from "../lib/cloud-arena-web-lib.js";

export function CloudArenaTraceViewerPage(): ReactElement {
  return (
    <PageLayout
      kicker="Cloud Arena"
      title="Trace Viewer"
      description="A first read-only viewer for one deterministic Cloud Arena simulation trace."
    >
      <CloudArenaTraceViewer trace={cloudArenaSampleTrace} />
    </PageLayout>
  );
}
