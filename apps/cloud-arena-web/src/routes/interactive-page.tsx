import type { ReactElement } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import type {
  CloudArenaSessionSnapshot,
  CloudArenaSessionScenarioId,
} from "../../../../src/cloud-arena/api-contract.js";
import type { BattleAction, BattleEvent } from "../../../../src/cloud-arena/index.js";
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
} from "../lib/cloud-arena-web-lib.js";

type CloudArenaInteractivePageProps = {
  apiBaseUrl: string;
};

type InteractiveStatus = "loading" | "ready" | "error";

const CLOUD_ARENA_SCENARIO_OPTIONS: Array<{
  id: CloudArenaSessionScenarioId;
  label: string;
  description: string;
}> = [
  {
    id: "mixed_guardian",
    label: "Mixed Guardian",
    description: "Balanced baseline battle",
  },
  {
    id: "grunt_demon",
    label: "Grunt Demon",
    description: "Simple low-tier attacker",
  },
  {
    id: "imp_caller",
    label: "Imp Caller",
    description: "Token pressure test",
  },
];

const CLOUD_ARENA_SCENARIO_QUERY_PARAM = "enemy";

function isCloudArenaSessionScenarioId(value: string): value is CloudArenaSessionScenarioId {
  return CLOUD_ARENA_SCENARIO_OPTIONS.some((option) => option.id === value);
}

function getScenarioDraftFromUrl(): CloudArenaSessionScenarioId {
  if (typeof window === "undefined") {
    return "mixed_guardian";
  }

  const searchParams = new URLSearchParams(window.location.search);
  const queryValue = searchParams.get(CLOUD_ARENA_SCENARIO_QUERY_PARAM);

  if (queryValue && isCloudArenaSessionScenarioId(queryValue)) {
    return queryValue;
  }

  return "mixed_guardian";
}

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

function createBattleSeed(): number {
  return Math.max(1, Date.now());
}

export function CloudArenaInteractivePage({
  apiBaseUrl,
}: CloudArenaInteractivePageProps): ReactElement {
  const api = useMemo(() => createCloudArenaApiClient({ baseUrl: apiBaseUrl }), [apiBaseUrl]);
  const location = useLocation();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<CloudArenaSessionSnapshot | null>(null);
  const [status, setStatus] = useState<InteractiveStatus>("loading");
  const [error, setError] = useState<Error | CloudArcanumApiClientError | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seedDraft, setSeedDraft] = useState("1");
  const [scenarioDraft, setScenarioDraft] = useState<CloudArenaSessionScenarioId>(getScenarioDraftFromUrl);
  const [lastSubmittedActionLabel, setLastSubmittedActionLabel] = useState<string | null>(null);
  const initialScenarioDraftRef = useRef(scenarioDraft);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const currentQueryScenario = searchParams.get(CLOUD_ARENA_SCENARIO_QUERY_PARAM);

    if (currentQueryScenario === scenarioDraft) {
      return;
    }

    searchParams.set(CLOUD_ARENA_SCENARIO_QUERY_PARAM, scenarioDraft);
    navigate(
      {
        pathname: location.pathname,
        search: `?${searchParams.toString()}`,
      },
      { replace: true },
    );
  }, [location.pathname, location.search, navigate, scenarioDraft]);

  async function createSession(
    seed?: number,
    scenarioId: CloudArenaSessionScenarioId = scenarioDraft,
  ): Promise<void> {
    const resolvedSeed = seed ?? createBattleSeed();

    setIsCreatingSession(true);
    setStatus("loading");
    setError(null);

    try {
      const response = await api.createCloudArenaSession({
        scenarioId,
        seed: resolvedSeed,
        shuffleDeck: true,
      });
      setSnapshot(response.data);
      setSeedDraft(String(response.data.seed));
      setScenarioDraft(response.data.scenarioId);
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
      { scenarioId: initialScenarioDraftRef.current, seed: createBattleSeed(), shuffleDeck: true },
      { signal: abortController.signal },
    )
      .then((response) => {
        if (abortController.signal.aborted) {
          return;
        }

        setSnapshot(response.data);
        setSeedDraft(String(response.data.seed));
        setScenarioDraft(response.data.scenarioId);
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
        await createSession(undefined, scenarioDraft);
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
      await createSession(undefined, scenarioDraft);
      setLastSubmittedActionLabel(null);
      setStatus("ready");
    } catch (nextError: unknown) {
      const resolvedError = nextError instanceof Error ? nextError : new Error(String(nextError));

      if (isMissingCloudArenaSessionError(resolvedError)) {
        setLastSubmittedActionLabel(null);
        setError(new Error("The live battle session expired after the API restarted. A fresh battle has been created."));
        await createSession(undefined, scenarioDraft);
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

    await createSession(seed, scenarioDraft);
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
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        void handleReset();
        return;
      }

      if (event.key === "Enter" || event.key.toLowerCase() === "e") {
        event.preventDefault();
        void handleApplyAction(endTurnToApply);
      }
    }

    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [endTurnAction, isCreatingSession, isSubmitting, snapshot]);

  if (status === "loading" || !snapshot) {
    return (
      <PageLayout
        kicker="Cloud Arena"
        title="Interactive Battle"
        description="A live Cloud Arena battle session backed by the dedicated Arena API."
      >
        <LoadingState
          title="Creating battle session"
          description="The client is requesting a fresh simulation snapshot from the Cloud Arena API."
        />
      </PageLayout>
    );
  }

  if (status === "error" && error) {
    return (
      <PageLayout
        kicker="Cloud Arena"
        title="Interactive Battle"
        description="A live Cloud Arena battle session backed by the dedicated Arena API."
      >
        <ErrorState
          title="Battle session failed"
          description="The interactive battle view could not load or continue."
          details={formatApiErrorDetails(error)}
        />
      </PageLayout>
    );
  }

  const viewModel = buildCloudArenaViewModelFromSessionSnapshot(snapshot);
  const finishedEvent = findBattleFinishedEvent(snapshot.log);
  const hasFinished = snapshot.status === "finished";
  const playableHandCardInstanceIds = snapshot.legalActions
    .filter((option): option is typeof option & { action: Extract<BattleAction, { type: "play_card" }> } =>
      option.action.type === "play_card")
    .map((option) => option.action.cardInstanceId);

  return (
    <PageLayout
      kicker="Cloud Arena"
      title="Interactive Battle"
      description="A live Cloud Arena battle session backed by the dedicated Arena API."
    >
      <section className="panel trace-viewer-hero">
        <div className="summary-row trace-viewer-metadata">
          {viewModel.summary.map((entry) => (
            <div key={`${entry.label}-${entry.value}`} className="summary-pill">
              {entry.label} <strong>{entry.value}</strong>
            </div>
          ))}
        </div>

        <div className="trace-viewer-hero-grid">
          <section className="trace-viewer-current-action">
            <strong>Current action</strong>
            <p>{viewModel.currentAction?.title ?? "Battle ready"}</p>
            <p>{viewModel.currentAction?.detail ?? "Choose a legal action to continue the fight."}</p>
            <div className="summary-row trace-viewer-inline-meta">
              {viewModel.currentAction?.meta.map((entry) => (
                <div key={`${entry.label}-${entry.value}`} className="summary-pill">
                  {entry.label} <strong>{entry.value}</strong>
                </div>
              ))}
            </div>
            <p className="trace-viewer-keyboard-hint">
              Keyboard: <code>Enter</code> or <code>E</code> ends the turn when that action is available.
              <span> </span>
              <code>R</code> resets the battle.
            </p>
          </section>

          <section className="panel trace-viewer-panel">
            <strong>Battle controls</strong>
            <div style={{ height: "0.75rem" }} />
            <label className="field">
              <span>Scenario</span>
              <select
                value={scenarioDraft}
                onChange={(event) => setScenarioDraft(event.target.value as CloudArenaSessionScenarioId)}
              >
                {CLOUD_ARENA_SCENARIO_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ height: "0.75rem" }} />
            <label className="field">
              <span>Seed</span>
              <input
                type="text"
                value={seedDraft}
                onChange={(event) => setSeedDraft(event.target.value)}
                placeholder="1"
              />
            </label>
            <div style={{ height: "0.75rem" }} />
            <div className="button-row">
              <button type="button" onClick={() => void handleCreateNewBattle()} disabled={isCreatingSession || isSubmitting}>
                {isCreatingSession ? "Creating..." : "New battle"}
              </button>
              <button type="button" onClick={() => void handleReset()} disabled={isCreatingSession || isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset battle"}
              </button>
            </div>
            <div style={{ height: "0.75rem" }} />
            <p>
              {lastSubmittedActionLabel
                ? `Last action: ${lastSubmittedActionLabel}`
                : `Default energy: ${LEAN_V1_DEFAULT_TURN_ENERGY}`}
            </p>
            {hasFinished && finishedEvent ? (
              <div className="warning-callout">
                <strong>Battle finished</strong>
                <p>{formatTraceEvent(finishedEvent)}</p>
              </div>
            ) : null}
          </section>
        </div>
      </section>

      <div className="trace-viewer-layout cloud-arena-live-layout">
        <CloudArenaBattleState
          battle={viewModel.battle}
          disableHandCardActions={isSubmitting}
          disablePermanentActions={isSubmitting}
          disableTurnActions={isSubmitting}
          onPlayHandCard={
            isSubmitting
              ? undefined
              : (cardInstanceId) => void handleApplyAction({ type: "play_card", cardInstanceId })
          }
          onTurnAction={isSubmitting ? undefined : (action) => void handleApplyAction(action)}
          onUsePermanentAction={
            isSubmitting
              ? undefined
              : (action) => void handleApplyAction(action)
          }
          playableHandCardInstanceIds={playableHandCardInstanceIds}
          sidePanel={<CloudArenaLogPanel groups={viewModel.logGroups} />}
        />
      </div>
    </PageLayout>
  );
}
