import type { MouseEventHandler, ReactElement } from "react";

import { DisplayCard } from "./display-card.js";
import type { DisplayCardModel } from "../lib/display-card.js";

type CloudArenaInspectorTabId = "info" | "cards" | "sequence";

type CloudArenaInspectorCard = {
  key: string;
  model: DisplayCardModel;
};

type CloudArenaInspectorPanelProps = {
  definitionJson: string | null;
  activeTab: CloudArenaInspectorTabId;
  cards?: CloudArenaInspectorCard[];
  showCardsTab?: boolean;
  sequenceCards?: CloudArenaInspectorCard[];
  showSequenceTab?: boolean;
  onTabChange: (tab: CloudArenaInspectorTabId) => void;
  position?: {
    left: number;
    top: number;
  } | null;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  onMouseLeave?: MouseEventHandler<HTMLElement>;
};

export function CloudArenaInspectorPanel({
  definitionJson,
  activeTab,
  cards = [],
  showCardsTab = false,
  sequenceCards = [],
  showSequenceTab = false,
  onTabChange,
  position = null,
  onMouseEnter,
  onMouseLeave,
}: CloudArenaInspectorPanelProps): ReactElement {
  if (!definitionJson) {
    return <></>;
  }

  const hasCardsTab = showCardsTab;
  const hasSequenceTab = showSequenceTab;

  return (
    <aside
      className="panel trace-viewer-panel cloud-arena-inspector-panel"
      aria-live="polite"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="cloud-arena-inspector-tabs" role="tablist" aria-label="Inspector sections">
        <button
          type="button"
          role="tab"
          className={`cloud-arena-inspector-tab${activeTab === "info" ? " is-active" : ""}`}
          aria-selected={activeTab === "info"}
          onClick={() => onTabChange("info")}
        >
          Info
        </button>
        {hasCardsTab ? (
          <button
            type="button"
            role="tab"
            className={`cloud-arena-inspector-tab${activeTab === "cards" ? " is-active" : ""}`}
            aria-selected={activeTab === "cards"}
            onClick={() => onTabChange("cards")}
          >
            Cards
          </button>
        ) : null}
        {hasSequenceTab ? (
          <button
            type="button"
            role="tab"
            className={`cloud-arena-inspector-tab${activeTab === "sequence" ? " is-active" : ""}`}
            aria-selected={activeTab === "sequence"}
            onClick={() => onTabChange("sequence")}
          >
            Sequence
          </button>
        ) : null}
      </div>

      <div className="cloud-arena-inspector-body">
        {activeTab === "cards" && hasCardsTab ? (
          <div className="cloud-arena-inspector-cards" aria-label="Enemy cards">
            {cards.length > 0 ? (
              cards.map((card) => (
                <DisplayCard
                  key={card.key}
                  className="cloud-arena-inspector-card"
                  model={card.model}
                />
              ))
            ) : (
              <div className="cloud-arena-inspector-empty">
                No enemy cards attached.
              </div>
            )}
          </div>
        ) : activeTab === "sequence" && hasSequenceTab ? (
          <div className="cloud-arena-inspector-cards" aria-label="Enemy sequence">
            {sequenceCards.length > 0 ? (
              sequenceCards.map((card) => (
                <DisplayCard
                  key={card.key}
                  className="cloud-arena-inspector-card"
                  model={card.model}
                />
              ))
            ) : (
              <div className="cloud-arena-inspector-empty">
                No enemy sequence available.
              </div>
            )}
          </div>
        ) : (
          <div className="cloud-arena-inspector-definition">
            <strong className="cloud-arena-inspector-definition-title">Card Definition</strong>
            <pre className="cloud-arena-inspector-definition-json">{definitionJson}</pre>
          </div>
        )}
      </div>
    </aside>
  );
}
