import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";

import type {
  CloudArenaSessionSnapshot,
} from "../../../../src/cloud-arcanum/api-contract.js";
import type {
  BattleAction,
  BattleEvent,
} from "../../../../src/cloud-arena/index.js";
import { LEAN_V1_DEFAULT_TURN_ENERGY } from "../../../../src/cloud-arena/index.js";
import {
  CloudArenaBattleState,
  ErrorState,
  LoadingState,
  PageLayout,
} from "../components/index.js";
import {
  buildBattleViewModelFromSessionSnapshot,
  CloudArcanumApiClientError,
  createCloudArcanumApiClient,
  formatTraceEvent,
  groupTraceEventsByTurn,
} from "../lib/index.js";

type CloudArenaInteractivePageProps = {
  apiBaseUrl: string;
};

type InteractiveStatus = "loading" | "ready" | "error";

function formatApiErrorDetails(error: Error | CloudArcanumApiClientError): ReactElement {
  if (error instanceof CloudArcanumApiClientError) {
    return (
      <p>
        Route <code>{error.route}</code> returned status <code>{error.status}</code>
        {error.code ? (
          <>
            {" "}
            with code <code>{error.code}</code>
          </>
        ) : null}
        .
      </p>
    );
  }

  return <p>{error.message}</p>;
}

function findBattleFinishedEvent(log: BattleEvent[]): Extract<BattleEvent, { type: "battle_finished" }> | null {
  for (let index = log.length - 1; index >= 0; index -= 1) {
    const event = log[index];

    if (event?.type === "battle_finished") {
      return event;
    }
  }

  return null;
}

export function CloudArenaInteractivePage({
  apiBaseUrl,
}: CloudArenaInteractivePageProps): ReactElement {
  const api = useMemo(() => createCloudArcanumApiClient({ baseUrl: apiBaseUrl }), [apiBaseUrl]);
  const [snapshot, setSnapshot] = useState<CloudArenaSessionSnapshot | null>(null);
  const [status, setStatus] = useState<InteractiveStatus>("loading");
  const [error, setError] = useState<Error | CloudArcanumApiClientError | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seedDraft, setSeedDraft] = useState("1");
  const [lastSubmittedActionLabel, setLastSubmittedActionLabel] = useState<string | null>(null);

  async function createSession(seed?: number): Promise<void> {
    setIsCreatingSession(true);
    setStatus("loading");
    setError(null);

    try {
      const response = await api.createCloudArenaSession({
        scenarioId: "mixed_guardian",
        seed,
      });
      setSnapshot(response.data);
      setSeedDraft(String(response.data.seed));
      setLastSubmittedActionLabel(null);
      setStatus("ready");
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
      setStatus("error");
    } finally {
      setIsCreatingSession(false);
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    setIsCreatingSession(true);
    setStatus("loading");
    setError(null);

    void api.createCloudArenaSession(
      { scenarioId: "mixed_guardian" },
      { signal: abortController.signal },
    )
      .then((response) => {
        if (abortController.signal.aborted) {
          return;
        }

        setSnapshot(response.data);
        setSeedDraft(String(response.data.seed));
        setStatus("ready");
      })
      .catch((nextError: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
        setStatus("error");
      })
      .finally(() => {
        if (abortController.signal.aborted) {
          return;
        }

        setIsCreatingSession(false);
      });

    return () => abortController.abort();
  }, [api]);

  async function handleApplyAction(action: BattleAction): Promise<void> {
    if (!snapshot) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    const selectedOption = snapshot.legalActions.find(
      (option) => JSON.stringify(option.action) === JSON.stringify(action),
    );
    setLastSubmittedActionLabel(selectedOption?.label ?? null);

    try {
      const response = await api.applyCloudArenaAction(snapshot.sessionId, { action });
      setSnapshot(response.data);
      setStatus("ready");
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset(): Promise<void> {
    if (!snapshot) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.resetCloudArenaSession(snapshot.sessionId);
      setSnapshot(response.data);
      setLastSubmittedActionLabel(null);
      setStatus("ready");
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }

  function parseSeedDraft(): number | undefined {
    const trimmed = seedDraft.trim();

    if (trimmed.length === 0) {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
  }

  async function handleCreateNewBattle(): Promise<void> {
    const seed = parseSeedDraft();

    if (seedDraft.trim().length > 0 && seed === undefined) {
      setError(new Error("Seed must be a positive integer."));
      setStatus(snapshot ? "ready" : "error");
      return;
    }

    await createSession(seed);
  }

  const recentEvents = snapshot?.log.slice(-8) ?? [];

  if ((status === "loading" || isCreatingSession) && !snapshot) {
    return (
      <PageLayout
        kicker="Cloud Arena"
        title="Interactive Battle"
        description="A minimal interactive Cloud Arena battle running against one fixed preset scenario."
      >
        <LoadingState
          title="Creating battle session"
          description="Starting the fixed Mixed Guardian scenario and loading the first live board state."
        />
      </PageLayout>
    );
  }

  if (!snapshot) {
    return (
      <PageLayout
        kicker="Cloud Arena"
        title="Interactive Battle"
        description="A minimal interactive Cloud Arena battle running against one fixed preset scenario."
      >
        <ErrorState
          title="Battle session failed to load"
          description="The interactive battle screen could not create its initial session."
          details={
            <>
              {error ? formatApiErrorDetails(error) : null}
              <div style={{ height: "0.75rem" }} />
              <button
                type="button"
                className="primary-button"
                onClick={() => void createSession(parseSeedDraft())}
              >
                Retry battle setup
              </button>
            </>
          }
        />
      </PageLayout>
    );
  }

  const battle = buildBattleViewModelFromSessionSnapshot(snapshot);
  const eventGroups = groupTraceEventsByTurn(snapshot.log, []);
  const battleFinishedEvent = findBattleFinishedEvent(snapshot.log);
  const playableHandCardInstanceIds = snapshot.legalActions
    .filter(
      (option): option is typeof option & {
        action: Extract<BattleAction, { type: "play_card" }>;
      } => option.source === "hand" && option.action.type === "play_card",
    )
    .map((option) => option.action.cardInstanceId);
  const playablePermanentActions = snapshot.legalActions
    .filter(
      (option): option is typeof option & {
        action: Extract<BattleAction, { type: "use_permanent_action" }>;
      } => option.source === "battlefield" && option.action.type === "use_permanent_action",
    )
    .map((option) => ({
      permanentId: option.action.permanentId,
      action: option.action.action,
    }));
  const turnActions = snapshot.legalActions
    .filter((option) => option.source === "turn")
    .map((option) => ({
      action: option.action,
      label: option.label,
    }));

  function handlePlayHandCard(cardInstanceId: string): void {
    void handleApplyAction({
      type: "play_card",
      cardInstanceId,
    });
  }

  function handleUsePermanentAction(
    permanentId: string,
    action: "attack" | "defend",
  ): void {
    void handleApplyAction({
      type: "use_permanent_action",
      permanentId,
      action,
    });
  }

  return (
    <PageLayout
      kicker="Cloud Arena"
      title="Interactive Battle"
      description="A minimal interactive battle screen for one fixed scenario, driven by API-backed live sessions."
    >
      <div className="trace-viewer-layout">
        <section className="panel trace-viewer-hero">
          <div className="summary-row trace-viewer-metadata">
            <div className="summary-pill">
              Scenario <strong>Mixed Guardian</strong>
            </div>
            <div className="summary-pill">
              Seed <strong>{snapshot.seed}</strong>
            </div>
            <div className="summary-pill">
              Turn <strong>{snapshot.turnNumber}</strong>
            </div>
            <div className="summary-pill">
              Phase <strong>{snapshot.phase}</strong>
            </div>
            <div className="summary-pill">
              Status <strong>{snapshot.status}</strong>
            </div>
          </div>
          <div className="trace-viewer-hero-grid">
            <section className="panel trace-viewer-controls">
              <div className="trace-viewer-summary-row">
                <div className="summary-pill">
                  Legal actions <strong>{snapshot.legalActions.length}</strong>
                </div>
                <div className="summary-pill">
                  Session <strong>{snapshot.sessionId.slice(0, 8)}</strong>
                </div>
              </div>
              <div className="filters-grid">
                <label className="field">
                  <span>Seed</span>
                  <input
                    inputMode="numeric"
                    value={seedDraft}
                    onChange={(event) => setSeedDraft(event.currentTarget.value)}
                    placeholder="1"
                  />
                </label>
              </div>
              <div className="trace-viewer-button-row">
                <button
                  type="button"
                  className="primary-button"
                  disabled={isCreatingSession || isSubmitting}
                  onClick={() => void handleCreateNewBattle()}
                >
                  {isCreatingSession ? "Starting..." : "Start new battle"}
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  disabled={isSubmitting || isCreatingSession}
                  onClick={() => void handleReset()}
                >
                  Restart from seed
                </button>
              </div>
            </section>

            <section className="trace-viewer-current-action">
              <strong>Current state</strong>
              <p>
                {snapshot.status === "finished"
                  ? `Battle complete${battleFinishedEvent ? `, winner ${battleFinishedEvent.winner}` : ""}.`
                  : "Choose one of the legal actions to advance the live board state."}
              </p>
              <p>
                Enemy turns resolve immediately when you end the turn, and the API returns the next updated snapshot.
              </p>
              {lastSubmittedActionLabel && !isSubmitting ? (
                <p>
                  Last action: <strong>{lastSubmittedActionLabel}</strong>
                </p>
              ) : null}
              {error ? (
                <div className="error-details">
                  {formatApiErrorDetails(error)}
                </div>
              ) : null}
            </section>
          </div>
        </section>

        <CloudArenaBattleState
          battle={battle}
          disableHandCardActions={isSubmitting || snapshot.status === "finished" || isCreatingSession}
          disablePermanentActions={isSubmitting || snapshot.status === "finished" || isCreatingSession}
          disableTurnActions={isSubmitting || snapshot.status === "finished" || isCreatingSession}
          maxPlayerEnergy={LEAN_V1_DEFAULT_TURN_ENERGY}
          onPlayHandCard={handlePlayHandCard}
          onTurnAction={(action) => void handleApplyAction(action)}
          onUsePermanentAction={handleUsePermanentAction}
          playablePermanentActions={playablePermanentActions}
          playableHandCardInstanceIds={playableHandCardInstanceIds}
          turnActions={turnActions}
        />

        <section className="trace-viewer-content-grid">
          <div className="trace-viewer-main-column">
            <section className="panel trace-viewer-log-panel">
              <strong>Recent events</strong>
              <ol className="trace-viewer-log">
                {recentEvents.map((event, index) => (
                  <li key={`recent-${event.type}-${event.turnNumber}-${index}`}>
                    {formatTraceEvent(event)}
                  </li>
                ))}
              </ol>
            </section>

            <section className="panel trace-viewer-log-panel">
              <strong>Battle log</strong>
              <div className="trace-viewer-log-groups">
                {eventGroups.map((group) => (
                  <section key={`turn-${group.turnNumber}`} className="trace-viewer-log-group">
                    <div className="trace-viewer-log-turn">Turn {group.turnNumber}</div>
                    <ol className="trace-viewer-log">
                      {group.events.map(({ event }, index) => (
                        <li key={`${event.type}-${event.turnNumber}-${index}`}>
                          {formatTraceEvent(event)}
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
