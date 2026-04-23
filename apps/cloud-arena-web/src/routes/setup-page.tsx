import type { CSSProperties, ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type { CloudArenaDeckSummary } from "../../../../src/cloud-arena/api-contract.js";
import type { CloudArenaSessionScenarioId } from "../../../../src/cloud-arena/api-contract.js";
import { getCardDefinition } from "../../../../src/cloud-arena/index.js";
import { getScenarioPreset } from "../../../../src/cloud-arena/scenarios/index.js";
import { CloudArenaAppShell, LoadingState } from "../components/index.js";
import { DisplayCard } from "../components/display-card.js";
import { buildEnemyPreviewCards as buildEnemyScenarioPreviewCards } from "../lib/cloud-arena-enemy-card-preview.js";
import {
  buildCloudArenaDeckChooserGroups,
  createCloudArenaBattleLocation,
  createCloudArenaContentController,
  CLOUD_ARENA_SCENARIO_OPTIONS,
  CLOUD_ARENA_SCENARIO_QUERY_PARAM,
  CLOUD_ARENA_DECK_QUERY_PARAM,
  getDeckDraftFromUrl,
  getScenarioDraftFromUrl,
  type CloudArenaContentMode,
} from "../lib/cloud-arena-web-lib.js";
import { buildDisplayCardModel, type DisplayCardModel } from "../lib/display-card.js";

type CloudArenaSetupPageProps = {
  apiBaseUrl: string;
  contentMode: CloudArenaContentMode;
  cloudArcanumWebBaseUrl: string;
};

function getDeckLabel(groupLabel: string, description: string): string {
  return `${groupLabel} · ${description}`;
}

function buildSetupImageUrl(imagePath: string): string {
  return /^https?:\/\//.test(imagePath) ? imagePath : `./images/cards/${imagePath}`;
}

function buildEnemySetupCardModel(
  cardId: string,
  index: number,
): DisplayCardModel {
  const definition = getCardDefinition(cardId);
  const display = definition.display ?? null;

  return buildDisplayCardModel({
    variant: "enemy",
    name: definition.name,
    title: display?.title ?? null,
    subtitle: display?.subtitle ?? "Enemy Card",
    frameTone: display?.frameTone ?? "split-black-red",
    manaCost: display?.manaCost ?? null,
    image: display?.imagePath && display?.imageAlt
      ? {
          alt: display.imageAlt,
          url: buildSetupImageUrl(display.imagePath),
          fallbackLabel: definition.name,
          credit: display.footerCredit,
        }
      : null,
    metaLine: null,
    footerCode: display?.footerCode ?? "ARE",
    footerCredit: display?.footerCredit ?? "Cloud Arena",
    collectorNumber: display?.collectorNumber ?? `E${String(index + 1).padStart(2, "0")}`,
    footerStat: null,
    healthBar: null,
    energyBar: null,
    statusLabel: null,
    statusTone: "approved",
    stats: [],
    textBlocks: [],
    badges: [],
    actions: [],
    stateFlags: [],
  });
}

type CloudArenaScenarioPreset = ReturnType<typeof getScenarioPreset>;

function buildEnemyPreviewCards(scenario: CloudArenaScenarioPreset): DisplayCardModel[] {
  const cards: DisplayCardModel[] = [];

  if (scenario.enemy.leaderDefinitionId) {
    cards.push(buildEnemySetupCardModel(scenario.enemy.leaderDefinitionId, cards.length));
  }

  for (const cardId of scenario.enemy.startingPermanents ?? []) {
    cards.push(buildEnemySetupCardModel(cardId, cards.length));
  }

  for (const cardId of scenario.enemy.startingTokens ?? []) {
    cards.push(buildEnemySetupCardModel(cardId, cards.length));
  }

  return cards.length > 0 ? cards : buildEnemyScenarioPreviewCards(scenario.enemy.cards);
}

export function CloudArenaSetupPage({
  apiBaseUrl,
  contentMode,
  cloudArcanumWebBaseUrl,
}: CloudArenaSetupPageProps): ReactElement {
  const content = useMemo(
    () => createCloudArenaContentController({ apiBaseUrl, mode: contentMode }),
    [apiBaseUrl, contentMode],
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [deckSummaries, setDeckSummaries] = useState<CloudArenaDeckSummary[] | null | undefined>(undefined);
  const [scenarioDraft, setScenarioDraft] = useState<CloudArenaSessionScenarioId>(getScenarioDraftFromUrl);
  const [deckDraft, setDeckDraft] = useState<string>(getDeckDraftFromUrl);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentQueryScenario = searchParams.get(CLOUD_ARENA_SCENARIO_QUERY_PARAM);
    const currentQueryDeck = searchParams.get(CLOUD_ARENA_DECK_QUERY_PARAM);

    if (currentQueryScenario === scenarioDraft && currentQueryDeck === deckDraft) {
      return;
    }

    searchParams.set(CLOUD_ARENA_SCENARIO_QUERY_PARAM, scenarioDraft);
    searchParams.set(CLOUD_ARENA_DECK_QUERY_PARAM, deckDraft);
    navigate(
      {
        pathname: location.pathname,
        search: `?${searchParams.toString()}`,
      },
      { replace: true },
    );
  }, [deckDraft, location.pathname, location.search, navigate, scenarioDraft]);

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
    () => buildCloudArenaDeckChooserGroups(deckSummaries ?? null, deckDraft),
    [deckDraft, deckSummaries],
  );
  const selectedScenarioPreset = useMemo(
    () => getScenarioPreset(scenarioDraft),
    [scenarioDraft],
  );
  const enemyPreviewCards = useMemo(
    () => buildEnemyPreviewCards(selectedScenarioPreset),
    [selectedScenarioPreset],
  );
  const battleLocation = useMemo(
    () => createCloudArenaBattleLocation(deckDraft, scenarioDraft),
    [deckDraft, scenarioDraft],
  );

  function handleLaunchBattle(): void {
    navigate(battleLocation);
  }

  if (deckSummaries === undefined) {
    return (
      <CloudArenaAppShell cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl} fullBleed>
        <LoadingState title="Preparing run setup" description="Loading the available decks before the battle." />
      </CloudArenaAppShell>
    );
  }

  return (
    <CloudArenaAppShell cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl} fullBleed>
      <section className="cloud-arena-start-screen cloud-arena-run-screen">
        <div className="cloud-arena-start-backdrop" aria-hidden="true">
          <span className="cloud-arena-start-orb cloud-arena-start-orb-left" />
          <span className="cloud-arena-start-orb cloud-arena-start-orb-right" />
          <span className="cloud-arena-start-rift" />
          <span className="cloud-arena-start-rift cloud-arena-start-rift-secondary" />
        </div>

        <div className="cloud-arena-start-hero cloud-arena-run-hero">
          <div className="cloud-arena-start-copy cloud-arena-run-copy">
            <h2>Cloud Arena</h2>
          </div>

          <div className="cloud-arena-start-stage cloud-arena-run-stage">
            <section className="cloud-arena-run-column">
              <div className="section-kicker cloud-arena-start-kicker">Deck</div>
              <div className="cloud-arena-run-scroll-pane">
                <div className="cloud-arena-run-card-grid">
                  {deckChooserGroups.map((group) => (
                    <div key={group.label} className="cloud-arena-run-deck-group">
                      <strong className="cloud-arena-run-group-label">{group.label}</strong>
                      <div className="cloud-arena-run-card-grid">
                        {group.options.map((option) => {
                          const isSelected = option.id === deckDraft;

                          return (
                            <button
                              key={option.id}
                              type="button"
                              className={`cloud-arena-start-menu-item cloud-arena-run-option${isSelected ? " is-selected" : ""}`}
                              disabled={option.disabled}
                              aria-pressed={isSelected}
                              onClick={() => setDeckDraft(option.id)}
                            >
                              <strong>{option.label}</strong>
                              <span>{getDeckLabel(group.label, option.description)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="cloud-arena-run-column">
              <div className="section-kicker cloud-arena-start-kicker">Scenario</div>
              <div className="cloud-arena-run-scroll-pane">
                <div className="cloud-arena-run-card-grid cloud-arena-run-scenario-grid">
                  {CLOUD_ARENA_SCENARIO_OPTIONS.map((option) => {
                    const isSelected = option.id === scenarioDraft;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={`cloud-arena-start-menu-item cloud-arena-run-option${isSelected ? " is-selected" : ""}`}
                        aria-pressed={isSelected}
                        onClick={() => setScenarioDraft(option.id)}
                      >
                        <strong>{option.label}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <aside className="cloud-arena-run-summary">
              <div className="cloud-arena-run-enemy-stack" aria-label={`${selectedScenarioPreset.label} enemy cards`}>
                {enemyPreviewCards.map((cardModel, index) => (
                  <div
                    key={`${selectedScenarioPreset.id}-${cardModel.name}-${index}`}
                    className="cloud-arena-run-enemy-card-shell"
                    style={
                      {
                        "--hand-card-stack-index": index,
                        "--hand-card-stack-shift": "calc(var(--display-card-width) * .36)",
                        "--hand-card-stack-lift": `${index * 0.1}rem`,
                        "--hand-card-stack-tilt": `${(index % 5 - 2) * 0.55}deg`,
                        "--hand-card-stack-z": enemyPreviewCards.length - index,
                      } as CSSProperties
                    }
                  >
                    <DisplayCard className="cloud-arena-summary-card display-card-enemy card-face-tile" model={cardModel} />
                  </div>
                ))}
              </div>
              <button type="button" className="primary-button cloud-arena-run-enter-battle" onClick={handleLaunchBattle}>
                Enter Battle
              </button>
            </aside>
          </div>
        </div>
      </section>
    </CloudArenaAppShell>
  );
}
