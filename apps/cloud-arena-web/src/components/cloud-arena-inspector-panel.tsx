import type { MouseEventHandler, ReactElement } from "react";

type CloudArenaInspectorPanelProps = {
  definitionJson: string | null;
  position?: {
    left: number;
    top: number;
  } | null;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  onMouseLeave?: MouseEventHandler<HTMLElement>;
};

export function CloudArenaInspectorPanel({
  definitionJson,
  position = null,
  onMouseEnter,
  onMouseLeave,
}: CloudArenaInspectorPanelProps): ReactElement {
  if (!definitionJson) {
    return <></>;
  }

  return (
    <aside
      className="panel trace-viewer-panel cloud-arena-inspector-panel"
      aria-live="polite"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="cloud-arena-inspector-definition">
        <strong className="cloud-arena-inspector-definition-title">Card Definition</strong>
        <pre className="cloud-arena-inspector-definition-json">{definitionJson}</pre>
      </div>
    </aside>
  );
}
