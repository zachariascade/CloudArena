import type { ReactElement } from "react";
import { useEffect, useMemo, useState } from "react";

import type {
  CloudArenaSessionSnapshot,
} from "../../../../src/cloud-arena/api-contract.js";
import type {
  BattleAction,
  BattleEvent,
} from "../../../../src/cloud-arena/index.js";
import { LEAN_V1_DEFAULT_TURN_ENERGY } from "../../../../src/cloud-arena/index.js";
import {
  CloudArenaBattleState,
  CloudArenaLogPanel,
  ErrorState,
  LoadingState,
  PageLayout,
} from "../components/index.js";
import {
  buildCloudArenaViewModelFromSessionSnapshot,
  CloudArcanumApiClientError,
  createCloudArenaApiClient,
  formatTraceEvent,
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

function isMissingCloudArenaSessionError(
  error: Error | CloudArcanumApiClientError,
): error is CloudArcanumApiClientError {
  return (
    error instanceof CloudArcanumApiClientError &&
    error.status === 404 &&
    error.code === "not_found" &&
    (
      error.route === "cloudArenaSessionActions" ||
      error.route === "cloudArenaSessionDetail" ||
      error.route === "cloudArenaSessionReset"
    )
  );
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
  const api = useMemo(() => createCloudArenaApiClient({ baseUrl: apiBaseUrl }), [apiBaseUrl]);
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
      const resolvedError = nextError instanceof Error ? nextError : new Error(String(nextError));

      if (isMissingCloudArenaSessionError(resolvedError)) {
        setLastSubmittedActionLabel(null);
        setError(new Error("The live battle session expired after the API restarted. A fresh battle has been created."));
        await createSession(snapshot.seed);
        return;
      }

      setError(resolvedError);
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
      const resolvedError = nextError instanceof Error ? nextError : new Error(String(nextError));

      if (isMissingCloudArenaSessionError(resolvedError)) {
        setLastSubmittedActionLabel(null);
        setError(new Error("The live battle session expired after the API restarted. A fresh battle has been created."));
        await createSession(snapshot.seed);
        return;
      }

      setError(resolvedError);
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

  const turnActions = snapshot?.legalActions
    .filter((option) => option.source === "turn")
    .map((option) => ({
      action: option.action,
      label: option.label,
    })) ?? [];
  const endTurnAction = turnActions.find(
    (entry): entry is (typeof turnActions)[number] & {
      action: Extract<BattleAction, { type: "end_turn" }>;
    } => entry.action.type === "end_turn",
  ) ?? null;

  useEffect(() => {
    if (!snapshot || !endTurnAction || isSubmitting || isCreatingSession || snapshot.status === "finished") {
      return;
    }

    const endTurnToApply = endTurnAction.action;

    function onWindowKeyDown(event: KeyboardEvent): void {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("input, textarea, select, button, [contenteditable='true']") !== null)
      ) {
        return;
      }

      if (event.key.toLowerCase() !== "e") {
        return;
      }

      event.preventDefault();
      void handleApplyAction(endTurnToApply);
    }

    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [endTurnAction, isCreatingSession, isSubmitting, snapshot]);

  useEffect(() => {
    if (!snapshot || isSubmitting || isCreatingSession) {
      return;
    }

    function onWindowKeyDown(event: KeyboardEvent): void {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.closest("input, textarea, select, button, [contenteditable='true']") !== null)
      ) {
        return;
      }

      if (event.key.toLowerCase() !== "r") {
        return;
      }

      event.preventDefault();
      void handleReset();
    }

    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [isCreatingSession, isSubmitting, snapshot]);

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

  const viewModel = buildCloudArenaViewModelFromSessionSnapshot(snapshot);
  const battle = viewModel.battle;
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

  function handlePlayHandCard(cardInstanceId: string): void {
    void handleApplyAction({
      type: "play_card",
      cardInstanceId,
    });
  }

  function handleUsePermanentAction(
    permanentId: string,
    action: string,
  ): void {
    if (!snapshot) {
      return;
    }

    const matchingAction = snapshot.legalActions.find(
      (option) =>
        option.source === "battlefield" &&
        option.action.type === "use_permanent_action" &&
        option.action.permanentId === permanentId &&
        option.action.action === action,
    )?.action;

    if (!matchingAction || matchingAction.type !== "use_permanent_action") {
      return;
    }

    void handleApplyAction(matchingAction);
  }

  const currentStatusLabel = isCreatingSession
    ? "Starting a new battle session..."
    : isSubmitting
      ? `Resolving ${lastSubmittedActionLabel ?? "action"}...`
      : snapshot.status === "finished"
        ? "Battle finished."
        : "Live session ready.";
  const lastActionWasEndTurn = lastSubmittedActionLabel?.toLowerCase() === "end turn";
  const enemyResolutionMessage = isSubmitting && lastActionWasEndTurn
    ? "Resolving the full enemy turn server-side. The board will refresh once the entire exchange is complete."
    : !isSubmitting && lastActionWasEndTurn
      ? "Enemy turn resolved in one server-side step. Review Recent events for the full exchange before making your next move."
      : "Ending your turn resolves the full enemy turn immediately. Use Recent events to understand what happened.";

  return (
    <PageLayout
      kicker=""
      title=""
      description=""
    >
      <div className="trace-viewer-layout cloud-arena-live-layout">
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

        <details className="panel trace-viewer-log-panel" open>
          <summary><strong>Recent events</strong></summary>
          <ol className="trace-viewer-log">
            {viewModel.recentEvents.map((event, index) => (
              <li key={`recent-${event.type}-${event.turnNumber}-${index}`}>
                {formatTraceEvent(event)}
              </li>
            ))}
          </ol>
        </details>

        <details className="panel trace-viewer-log-panel">
          <summary><strong>Battle controls</strong></summary>
          <section className="trace-viewer-current-action">
            <strong>Current state</strong>
            <p><strong>{currentStatusLabel}</strong></p>
            <p>{viewModel.currentAction?.title}</p>
            <p>
              {snapshot.status === "finished" && battleFinishedEvent
                ? `Battle complete, winner ${battleFinishedEvent.winner}.`
                : viewModel.currentAction?.detail}
            </p>
            <div className="summary-row trace-viewer-inline-meta">
              {viewModel.currentAction?.meta.map((entry) => (
                <div key={`${entry.label}-${entry.value}`} className="summary-pill">
                  {entry.label} <strong>{entry.value}</strong>
                </div>
              ))}
            </div>
            <p className="trace-viewer-inline-meta">
              {enemyResolutionMessage}
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
          <div style={{ height: "0.9rem" }} />
          <div className="summary-row trace-viewer-metadata">
            {viewModel.summary.map((entry) => (
              <div key={`${entry.label}-${entry.value}`} className="summary-pill">
                {entry.label} <strong>{entry.value}</strong>
              </div>
            ))}
            <div className="summary-pill">
              Legal actions <strong>{snapshot.legalActions.length}</strong>
            </div>
            <div className="summary-pill">
              Session <strong>{snapshot.sessionId.slice(0, 8)}</strong>
            </div>
            <div className="summary-pill">
              Mode <strong>Interactive</strong>
            </div>
            <div className="summary-pill">
              Enemy turn <strong>Auto-resolves</strong>
            </div>
          </div>
          <p className="trace-viewer-inline-meta">
            Start a new run from the fixed <strong>Mixed Guardian</strong> scenario or restart the current session from its original seed.
          </p>
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
          <p className="trace-viewer-keyboard-hint">
            Keyboard: <code>E</code> end turn, <code>R</code> restart from seed
          </p>
        </details>

        <details className="panel trace-viewer-log-panel">
          <summary><strong>Battle log</strong></summary>
          <CloudArenaLogPanel framed={false} groups={viewModel.logGroups} title="Battle log" />
        </details>
      </div>
    </PageLayout>
  );
}
