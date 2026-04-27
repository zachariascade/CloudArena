import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { CloudArenaAppShell } from "../components/index.js";
import { CloudArenaInspectorPanel } from "../components/cloud-arena-inspector-panel.js";
import { DisplayCard } from "../components/display-card.js";
import {
  cardDefinitions,
  cloudArenaEnemyPresets,
} from "../../../../src/cloud-arena/index.js";
import type { CloudArenaEnemyPresetId } from "../../../../src/cloud-arena/scenarios/types.js";
import { mapArenaEnemyToDisplayCard } from "../lib/display-card.js";
import { buildEnemyPreviewCardModel } from "../lib/cloud-arena-enemy-card-preview.js";

type CloudArenaBestiaryPageProps = {
  cloudArcanumWebBaseUrl: string;
};

const ENEMY_ENTRIES = Object.values(cloudArenaEnemyPresets);

export function CloudArenaBestiaryPage({
  cloudArcanumWebBaseUrl,
}: CloudArenaBestiaryPageProps): ReactElement {
  const [activePresetId, setActivePresetId] =
    useState<CloudArenaEnemyPresetId | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "cards" | "sequence">(
    "sequence",
  );

  const activePreset = activePresetId
    ? cloudArenaEnemyPresets[activePresetId]
    : null;

  const inspectorDefinitionJson = activePreset
    ? JSON.stringify(
        cardDefinitions[activePreset.definitionId] ?? {
          name: activePreset.name,
        },
        null,
        2,
      )
    : null;

  const inspectorSequenceCards = useMemo(() => {
    if (!activePreset) return [];
    return activePreset.cards.map((card, index) => ({
      key: `bestiary:${activePreset.id}:${index}`,
      model: buildEnemyPreviewCardModel(card, index),
    }));
  }, [activePreset]);

  function openInspector(presetId: CloudArenaEnemyPresetId): void {
    setActivePresetId(presetId);
    setActiveTab("sequence");
  }

  function closeInspector(): void {
    setActivePresetId(null);
  }

  useEffect(() => {
    if (!activePreset) {
      return;
    }

    function handleDocumentMouseDown(event: MouseEvent): void {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target.closest(".cloud-arena-inspector-panel")) {
        return;
      }

      closeInspector();
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [activePreset]);

  return (
    <CloudArenaAppShell
      cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl}
      fullBleed
    >
      <section className="cloud-arena-start-screen cloud-arena-run-screen cloud-arena-bestiary">
        <div className="cloud-arena-start-backdrop" aria-hidden="true">
          <span className="cloud-arena-start-orb cloud-arena-start-orb-left" />
          <span className="cloud-arena-start-orb cloud-arena-start-orb-right" />
          <span className="cloud-arena-start-rift" />
          <span className="cloud-arena-start-rift cloud-arena-start-rift-secondary" />
        </div>

        <div className="cloud-arena-start-hero cloud-arena-run-hero cloud-arena-bestiary-layout">
          <header className="cloud-arena-start-copy cloud-arena-run-copy cloud-arena-bestiary-header">
            <h2 className="cloud-arena-bestiary-title">Bestiary</h2>
            <Link
              className="cloud-arena-start-menu-item cloud-arena-bestiary-back"
              to="/"
            >
              <strong>← Back</strong>
            </Link>
          </header>

          <div className="cloud-arena-start-stage cloud-arena-bestiary-stage">
            <section className="cloud-arena-run-column cloud-arena-bestiary-column">
              <div className="cloud-arena-run-scroll-pane cloud-arena-bestiary-scroll-pane">
                <div className="cloud-arena-bestiary-panel">
                  <div className="cloud-arena-bestiary-grid">
                    {ENEMY_ENTRIES.map((preset) => {
                      const cardModel = mapArenaEnemyToDisplayCard(
                        {
                          name: preset.name,
                          health: preset.health,
                          maxHealth: preset.health,
                          block: 0,
                          leaderDefinitionId: preset.definitionId,
                        },
                        { context: "catalog" },
                      );

                      return (
                        <div key={preset.id} className="cloud-arena-bestiary-entry">
                          <DisplayCard
                            model={cardModel}
                            detailsAction={{
                              ariaLabel: `Inspect ${preset.name}`,
                              onClick: () => openInspector(preset.id),
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {activePreset && (
          <div
            className="cloud-arena-bestiary-modal-backdrop"
            aria-hidden="true"
            onClick={closeInspector}
          >
            <div role="presentation" onClick={(event) => event.stopPropagation()}>
              <CloudArenaInspectorPanel
                definitionJson={inspectorDefinitionJson}
                activeTab={activeTab}
                sequenceCards={inspectorSequenceCards}
                showSequenceTab={true}
                onTabChange={setActiveTab}
              />
            </div>
          </div>
        )}
      </section>
    </CloudArenaAppShell>
  );
}
