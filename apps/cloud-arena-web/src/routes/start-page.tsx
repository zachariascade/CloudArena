import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { CloudArenaDeckSummary } from "../../../../src/cloud-arena/api-contract.js";
import { PageLayout, CloudArenaAppShell } from "../components/index.js";
import {
  createCloudArenaBattleLocation,
  createCloudArenaContentController,
  buildCloudArenaDeckChooserGroups,
  CLOUD_ARENA_SCENARIO_OPTIONS,
  getDeckDraftFromUrl,
  getScenarioDraftFromUrl,
  type CloudArenaContentMode,
} from "../lib/cloud-arena-web-lib.js";

type CloudArenaStartPageProps = {
  apiBaseUrl: string;
  contentMode: CloudArenaContentMode;
  cloudArcanumWebBaseUrl: string;
};

export function CloudArenaStartPage({
  apiBaseUrl,
  contentMode,
  cloudArcanumWebBaseUrl,
}: CloudArenaStartPageProps): ReactElement {
  const content = useMemo(
    () => createCloudArenaContentController({ apiBaseUrl, mode: contentMode }),
    [apiBaseUrl, contentMode],
  );
  const navigate = useNavigate();
  const [deckSummaries, setDeckSummaries] = useState<CloudArenaDeckSummary[] | null>(null);
  const [scenarioDraft, setScenarioDraft] = useState(getScenarioDraftFromUrl);
  const [deckDraft, setDeckDraft] = useState(getDeckDraftFromUrl);

  useEffect(() => {
    const abortController = new AbortController();

    void content.listCloudArenaDecks({}, { signal: abortController.signal })
      .then((response) => {
        if (!abortController.signal.aborted) {
          setDeckSummaries(response.data);
        }
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setDeckSummaries(null);
        }
      });

    return () => abortController.abort();
  }, [content]);

  const deckChooserGroups = useMemo(
    () => buildCloudArenaDeckChooserGroups(deckSummaries, deckDraft),
    [deckDraft, deckSummaries],
  );
  const selectedDeckOption = useMemo(
    () => deckChooserGroups.flatMap((group) => group.options).find((option) => option.id === deckDraft) ?? null,
    [deckChooserGroups, deckDraft],
  );
  const selectedScenarioOption = useMemo(
    () => CLOUD_ARENA_SCENARIO_OPTIONS.find((option) => option.id === scenarioDraft) ?? CLOUD_ARENA_SCENARIO_OPTIONS[1]!,
    [scenarioDraft],
  );
  const battleLocation = useMemo(
    () => createCloudArenaBattleLocation(deckDraft, scenarioDraft),
    [deckDraft, scenarioDraft],
  );

  function handleBegin(): void {
    navigate(battleLocation);
  }

  return (
    <CloudArenaAppShell cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl}>
      <PageLayout
        kicker="Arena Entry"
        title="Choose your battle"
        description="Select a deck, select an enemy scenario, and launch straight into combat."
      >
        <div className="cloud-arena-start-layout">
          <section className="panel cloud-arena-start-hero">
            <div className="cloud-arena-start-copy">
              <strong>Enter the arena with intent</strong>
              <p>
                Pick your deck and foe first, then press Begin. The battle will open with those
                choices encoded in the URL so you can share or revisit the exact setup.
              </p>
            </div>

            <div className="cloud-arena-start-grid">
              <label className="field">
                <span>Deck</span>
                <select value={deckDraft} onChange={(event) => setDeckDraft(event.target.value)}>
                  {deckChooserGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((option) => (
                        <option key={option.id} value={option.id} disabled={option.disabled}>
                          {option.label} - {option.description}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Enemy scenario</span>
                <select
                  value={scenarioDraft}
                  onChange={(event) => setScenarioDraft(event.target.value as typeof scenarioDraft)}
                >
                  {CLOUD_ARENA_SCENARIO_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="cloud-arena-start-actions">
              <button type="button" className="primary-button" onClick={handleBegin}>
                Begin
              </button>
              <Link className="ghost-button" to="/decks">
                Deck Builder
              </Link>
            </div>

            <p className="cloud-arena-start-hint">
              Battle URL: <code>{battleLocation.pathname}{battleLocation.search}</code>
            </p>
          </section>

          <aside className="panel cloud-arena-start-summary">
            <div className="cloud-arena-start-summary-card">
              <div className="cloud-arena-start-summary-kicker">Selected deck</div>
              <strong>{selectedDeckOption?.label ?? deckDraft}</strong>
              <p>
                {selectedDeckOption?.description ??
                  "This deck will be passed into the battle when you press Begin."}
              </p>
            </div>

            <div className="cloud-arena-start-summary-card">
              <div className="cloud-arena-start-summary-kicker">Enemy scenario</div>
              <strong>{selectedScenarioOption.label}</strong>
              <p>{selectedScenarioOption.description}</p>
            </div>

            <div className="cloud-arena-start-summary-card">
              <div className="cloud-arena-start-summary-kicker">Route</div>
              <strong>/battle</strong>
              <p>The battle page will create a fresh session from this exact setup.</p>
            </div>
          </aside>
        </div>
      </PageLayout>
    </CloudArenaAppShell>
  );
}
