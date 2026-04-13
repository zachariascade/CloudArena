import type { ReactElement } from "react";

import type { TraceViewerEventGroup } from "../lib/cloud-arena-trace-view-model.js";
import { formatTraceEvent } from "../lib/index.js";

type CloudArenaLogPanelProps = {
  groups: TraceViewerEventGroup[];
  framed?: boolean;
  title?: string;
};

export function CloudArenaLogPanel({
  framed = true,
  groups,
  title = "Battle log",
}: CloudArenaLogPanelProps): ReactElement {
  const content = (
    <>
      <strong>{title}</strong>
      <div className="trace-viewer-log-groups">
        {groups.map((group) => (
          <section key={`turn-${group.turnNumber}`} className="trace-viewer-log-group">
            <div className="trace-viewer-log-turn">Turn {group.turnNumber}</div>
            <ol className="trace-viewer-log">
              {group.events.map(({ event, isCurrentEvent }, index) => (
                <li
                  key={`${event.type}-${event.turnNumber}-${index}`}
                  className={isCurrentEvent ? "trace-viewer-log-current" : undefined}
                >
                  {formatTraceEvent(event)}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );

  if (!framed) {
    return <div className="trace-viewer-log-panel">{content}</div>;
  }

  return <section className="panel trace-viewer-log-panel">{content}</section>;
}
