import type { CSSProperties, MouseEventHandler, ReactElement } from "react";

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

  const style: CSSProperties | undefined = position
    ? {
        left: `${position.left}px`,
        top: `${position.top}px`,
      }
    : undefined;

  return (
    <aside
      className="panel trace-viewer-panel cloud-arena-inspector-panel"
      aria-live="polite"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={style}
    >
      <div className="cloud-arena-inspector-definition">
        <strong className="cloud-arena-inspector-definition-title">Card Definition</strong>
        <pre className="cloud-arena-inspector-definition-json">{definitionJson}</pre>
      </div>
    </aside>
  );
}
