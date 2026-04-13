import type { CSSProperties, ReactElement, ReactNode } from "react";

import type { DisplayCardModel } from "../lib/display-card.js";
import { DisplayCard } from "./display-card.js";

type CloudArenaInspectorPanelProps = {
  model: DisplayCardModel | null;
  position?: {
    left: number;
    top: number;
  } | null;
  sidePanel?: ReactNode;
};

export function CloudArenaInspectorPanel({
  model,
  position = null,
  sidePanel,
}: CloudArenaInspectorPanelProps): ReactElement {
  if (!model) {
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
      style={style}
    >
      <DisplayCard
        className="cloud-arena-inspector-card"
        model={model}
      />
      {sidePanel ? <div className="cloud-arena-inspector-sidepanel">{sidePanel}</div> : null}
    </aside>
  );
}
