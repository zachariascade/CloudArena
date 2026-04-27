import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCardDefinition } from "../../../../src/cloud-arena/index.js";
import { CloudArenaAppShell } from "../components/index.js";
import {
  CAMPAIGN_LEVELS,
  clearCampaignRun,
  createNewCampaignRun,
  getLevelStatus,
  loadCampaignRun,
  type CampaignRun,
} from "../lib/cloud-arena-campaign.js";
import type { CloudArenaContentMode } from "../lib/cloud-arena-web-lib.js";

type CloudArenaCampaignPageProps = {
  apiBaseUrl: string;
  contentMode: CloudArenaContentMode;
  cloudArcanumWebBaseUrl: string;
};

function groupedCardList(cardIds: string[]): Array<{ id: string; name: string; count: number }> {
  const counts = new Map<string, number>();
  for (const id of cardIds) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([id, count]) => {
    let name = id;
    try {
      name = getCardDefinition(id as Parameters<typeof getCardDefinition>[0]).name;
    } catch {
      // unknown card id, fall back to id
    }
    return { id, name, count };
  });
}

export function CloudArenaCampaignPage({
  cloudArcanumWebBaseUrl,
}: CloudArenaCampaignPageProps): ReactElement {
  const navigate = useNavigate();
  const [run, setRun] = useState<CampaignRun | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const existing = loadCampaignRun();
    if (existing) {
      setRun(existing);
      setIsLoading(false);
    } else {
      void createNewCampaignRun().then((newRun) => {
        setRun(newRun);
        setIsLoading(false);
      });
    }
  }, []);

  function handleStartLevel(levelIndex: number): void {
    if (!run) return;
    navigate("/battle", { state: { campaignRunId: run.id, levelIndex } });
  }

  function handleAbandon(): void {
    clearCampaignRun();
    setRun(null);
    setIsLoading(true);
    void createNewCampaignRun().then((newRun) => {
      setRun(newRun);
      setIsLoading(false);
    });
  }

  const clearedCount = run?.completedLevelIndices.length ?? 0;
  const totalLevels = CAMPAIGN_LEVELS.length;
  const isComplete = run?.status === "complete";
  const deckEntries = run ? groupedCardList(run.deckCardIds) : [];

  return (
    <CloudArenaAppShell cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl} fullBleed>
      <section className="cloud-arena-start-screen cloud-arena-campaign-screen">
        <div className="cloud-arena-start-backdrop" aria-hidden="true">
          <span className="cloud-arena-start-orb cloud-arena-start-orb-left" />
          <span className="cloud-arena-start-orb cloud-arena-start-orb-right" />
          <span className="cloud-arena-start-rift" />
          <span className="cloud-arena-start-rift cloud-arena-start-rift-secondary" />
        </div>

        <div className="cloud-arena-start-hero cloud-arena-campaign-hero">
          <div className="cloud-arena-start-copy">
            <h2>Campaign</h2>
            {!isLoading && (
              <p className="cloud-arena-campaign-progress">
                {isComplete ? "Campaign complete!" : `${clearedCount} / ${totalLevels} cleared`}
              </p>
            )}
          </div>

          <div className="cloud-arena-start-stage cloud-arena-campaign-stage">
            {/* Level track */}
            <section className="cloud-arena-campaign-track-col">
              <div className="section-kicker cloud-arena-start-kicker">Path</div>

              {isLoading ? (
                <p className="cloud-arena-campaign-note">Preparing campaign…</p>
              ) : isComplete ? (
                <div className="cloud-arena-campaign-complete">
                  <strong>Campaign Complete!</strong>
                  <p>You have defeated all enemies. The arena is yours.</p>
                  <button
                    type="button"
                    className="cloud-arena-run-enter-battle cloud-arena-campaign-cta"
                    onClick={handleAbandon}
                  >
                    New Campaign
                  </button>
                </div>
              ) : (
                <div className="cloud-arena-campaign-track">
                  {[...CAMPAIGN_LEVELS].reverse().map((level) => {
                    const status = run ? getLevelStatus(run, level.index) : "locked";
                    const isUnlocked = status === "unlocked";
                    return (
                      <div key={level.index} className="cloud-arena-campaign-level-row">
                        <button
                          type="button"
                          className={`cloud-arena-run-option cloud-arena-campaign-level is-${status}`}
                          disabled={!isUnlocked}
                          onClick={() => handleStartLevel(level.index)}
                        >
                          <div className="cloud-arena-campaign-level-meta">
                            <span className="cloud-arena-campaign-level-badge">
                              {status === "complete" ? "✓" : level.index + 1}
                            </span>
                            <div className="cloud-arena-campaign-level-body">
                              <strong>{level.label}</strong>
                              <span>
                                {status === "complete" && "Cleared"}
                                {status === "unlocked" && "Enter Battle →"}
                                {status === "locked" && "Locked"}
                              </span>
                            </div>
                          </div>
                        </button>
                        {level.index > 0 && (
                          <div className="cloud-arena-campaign-connector" aria-hidden="true" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!isLoading && !isComplete && (
                <button
                  type="button"
                  className="cloud-arena-campaign-abandon"
                  onClick={handleAbandon}
                >
                  Abandon &amp; Restart
                </button>
              )}
            </section>

            {/* Deck panel */}
            <aside className="cloud-arena-campaign-deck-col">
              <div className="section-kicker cloud-arena-start-kicker">Deck</div>
              <div className="cloud-arena-campaign-deck-body">
                {isLoading ? (
                  <p className="cloud-arena-campaign-note">Loading…</p>
                ) : (
                  <>
                    <p className="cloud-arena-run-group-label">
                      {run?.deckCardIds.length ?? 0} cards
                    </p>
                    <ul className="cloud-arena-campaign-deck-list">
                      {deckEntries.map((entry) => (
                        <li key={entry.id} className="cloud-arena-campaign-deck-entry">
                          <span className="cloud-arena-campaign-deck-count">{entry.count}×</span>
                          <span>{entry.name}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </CloudArenaAppShell>
  );
}
