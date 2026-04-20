import type { ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

import type {
  CloudArenaDeckPresetId,
  CloudArenaSessionSnapshot,
  CloudArenaSessionScenarioId,
} from "../../../../src/cloud-arena/api-contract.js";
import type { BattleAction, BattleEvent } from "../../../../src/cloud-arena/index.js";
import { LEAN_V1_DEFAULT_TURN_ENERGY } from "../../../../src/cloud-arena/index.js";
import {
  CloudArenaAppShell,
  CloudArenaBattleState,
  CloudArenaLogPanel,
  ErrorState,
  LoadingState,
} from "../components/index.js";
import {
  buildCloudArenaViewModelFromSessionSnapshot,
  CloudArcanumApiClientError,
  createCloudArenaApiClient,
  formatTraceEvent,
} from "../lib/cloud-arena-web-lib.js";

type CloudArenaInteractivePageProps = {
  apiBaseUrl: string;
  cloudArcanumWebBaseUrl: string;
};

type InteractiveStatus = "loading" | "ready" | "error";

const CLOUD_ARENA_SCENARIO_OPTIONS: Array<{
  id: CloudArenaSessionScenarioId;
  label: string;
  description: string;
}> = [
  {
    id: "demon_pack",
    label: "Demon Pack",
    description: "Leader plus two demon bodies",
  },
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

const CLOUD_ARENA_DECK_OPTIONS: Array<{
  id: CloudArenaDeckPresetId;
  label: string;
  description: string;
}> = [
  {
    id: "master_deck",
    label: "Master Deck",
    description: "All available player cards",
  },
  {
    id: "wide_angels",
    label: "Wide Angels",
    description: "Token angels and blessing scale",
  },
  {
    id: "tall_creatures",
    label: "Tall Creatures",
    description: "Grow one or two bigger bodies",
  },
];

const CLOUD_ARENA_SCENARIO_QUERY_PARAM = "enemy";
const CLOUD_ARENA_DECK_QUERY_PARAM = "deck";

function isCloudArenaSessionScenarioId(value: string): value is CloudArenaSessionScenarioId {
  return CLOUD_ARENA_SCENARIO_OPTIONS.some((option) => option.id === value);
}

function isCloudArenaDeckPresetId(value: string): value is CloudArenaDeckPresetId {
  return CLOUD_ARENA_DECK_OPTIONS.some((option) => option.id === value);
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

function getDeckDraftFromUrl(): CloudArenaDeckPresetId {
  if (typeof window === "undefined") {
    return "master_deck";
  }

  const searchParams = new URLSearchParams(window.location.search);
  const queryValue = searchParams.get(CLOUD_ARENA_DECK_QUERY_PARAM);

  if (queryValue && isCloudArenaDeckPresetId(queryValue)) {
    return queryValue;
  }

  return "master_deck";
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
  cloudArcanumWebBaseUrl,
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
  const [deckDraft, setDeckDraft] = useState<CloudArenaDeckPresetId>(getDeckDraftFromUrl);
  const [lastSubmittedActionLabel, setLastSubmittedActionLabel] = useState<string | null>(null);
  const initialScenarioDraftRef = useRef(scenarioDraft);
  const initialDeckDraftRef = useRef(deckDraft);
  const isActionInFlightRef = useRef(false);
  const battleIsFinished = snapshot?.status === "finished";

  function didSessionAdvance(
    currentSnapshot: CloudArenaSessionSnapshot,
    refreshedSnapshot: CloudArenaSessionSnapshot,
  ): boolean {
    return (
      refreshedSnapshot.turnNumber !== currentSnapshot.turnNumber ||
      refreshedSnapshot.phase !== currentSnapshot.phase ||
      refreshedSnapshot.status !== currentSnapshot.status ||
      refreshedSnapshot.actionHistory.length !== currentSnapshot.actionHistory.length ||
      refreshedSnapshot.log.length !== currentSnapshot.log.length
    );
  }

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

  async function createSession(
    seed?: number,
    scenarioId: CloudArenaSessionScenarioId = scenarioDraft,
    deckId: CloudArenaDeckPresetId = deckDraft,
  ): Promise<void> {
    const resolvedSeed = seed ?? createBattleSeed();

    setIsCreatingSession(true);
    setStatus("loading");
    setError(null);

    try {
      const response = await api.createCloudArenaSession({
        scenarioId,
        deckId,
        seed: resolvedSeed,
        shuffleDeck: true,
      });
      setSnapshot(response.data);
      setSeedDraft(String(response.data.seed));
      setScenarioDraft(response.data.scenarioId);
      setDeckDraft(response.data.deckId ?? "master_deck");
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
      {
        scenarioId: initialScenarioDraftRef.current,
        deckId: initialDeckDraftRef.current,
        seed: createBattleSeed(),
        shuffleDeck: true,
      },
      { signal: abortController.signal },
    )
      .then((response) => {
        if (abortController.signal.aborted) {
          return;
        }

        setSnapshot(response.data);
        setSeedDraft(String(response.data.seed));
        setScenarioDraft(response.data.scenarioId);
        setDeckDraft(response.data.deckId ?? "master_deck");
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
    if (!snapshot || battleIsFinished || isActionInFlightRef.current) {
      return;
    }

    isActionInFlightRef.current = true;
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
      const isStaleActionError =
        resolvedError instanceof CloudArcanumApiClientError &&
        resolvedError.route === "cloudArenaSessionActions" &&
        resolvedError.status === 400 &&
        resolvedError.code === "invalid_request";

      if (isMissingCloudArenaSessionError(resolvedError)) {
        setLastSubmittedActionLabel(null);
        setError(new Error("The live battle session expired after the API restarted. A fresh battle has been created."));
        await createSession(undefined, scenarioDraft);
        return;
      }

      if (isStaleActionError) {
        try {
          const refreshedSession = await api.getCloudArenaSession(snapshot.sessionId);

          if (didSessionAdvance(snapshot, refreshedSession.data)) {
            setSnapshot(refreshedSession.data);
            setStatus("ready");
            setError(null);
            return;
          }
        } catch (refreshError: unknown) {
          const resolvedRefreshError = refreshError instanceof Error ? refreshError : new Error(String(refreshError));

          if (isMissingCloudArenaSessionError(resolvedRefreshError)) {
            setLastSubmittedActionLabel(null);
            setError(new Error("The live battle session expired after the API restarted. A fresh battle has been created."));
            await createSession(undefined, scenarioDraft);
            return;
          }

          setError(resolvedRefreshError);
          setStatus("error");
          return;
        }
      }

      setError(resolvedError);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
      isActionInFlightRef.current = false;
    }
  }

  async function handleReset(): Promise<void> {
    if (!snapshot || isActionInFlightRef.current) {
      return;
    }

    isActionInFlightRef.current = true;
    setIsSubmitting(true);
    setStatus("loading");
    setError(null);

    try {
      const response = await api.resetCloudArenaSession(snapshot.sessionId);
      setSnapshot(response.data);
      setSeedDraft(String(response.data.seed));
      setScenarioDraft(response.data.scenarioId);
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
      isActionInFlightRef.current = false;
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
    if (!snapshot || !endTurnAction || isSubmitting || isCreatingSession || battleIsFinished) {
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

      if (event.repeat) {
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
  }, [battleIsFinished, endTurnAction, isCreatingSession, isSubmitting, snapshot]);

  if (status === "loading" || !snapshot) {
    return (
      <CloudArenaAppShell
        cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl}
        sidebarContent={buildSidebarContent({})}
      >
        <LoadingState
          title="Creating battle session"
          description="The client is requesting a fresh simulation snapshot from the Cloud Arena API."
        />
      </CloudArenaAppShell>
    );
  }

  if (status === "error" && error) {
    return (
      <CloudArenaAppShell
        cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl}
        sidebarContent={buildSidebarContent({})}
      >
        <ErrorState
          title="Battle session failed"
          description="The interactive battle view could not load or continue."
          details={formatApiErrorDetails(error)}
        />
      </CloudArenaAppShell>
    );
  }

  const viewModel = buildCloudArenaViewModelFromSessionSnapshot(snapshot);
  const finishedEvent = findBattleFinishedEvent(snapshot.log);
  const hasFinished = battleIsFinished;
  const playableHandCardInstanceIds = snapshot.legalActions
    .filter((option): option is typeof option & { action: Extract<BattleAction, { type: "play_card" }> } =>
      option.action.type === "play_card")
    .map((option) => option.action.cardInstanceId);

  function buildSidebarContent(options: {
    battleViewModel?: ReturnType<typeof buildCloudArenaViewModelFromSessionSnapshot>;
    finishedEvent?: Extract<BattleEvent, { type: "battle_finished" }> | null;
    hasFinished?: boolean;
  }): ReactNode {
    const { battleViewModel, finishedEvent: sidebarFinishedEvent, hasFinished: sidebarHasFinished = false } = options;

    return (
      <>
        <section className="app-shell-sidebar-section">
          <strong>Battle Setup</strong>
          <div className="cloud-arena-game-admin-panel">
            <div className="cloud-arena-game-admin-grid">
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
              <label className="field">
                <span>Deck</span>
                <select
                  value={deckDraft}
                  onChange={(event) => setDeckDraft(event.target.value as CloudArenaDeckPresetId)}
                >
                  {CLOUD_ARENA_DECK_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Seed</span>
                <input
                  type="text"
                  value={seedDraft}
                  onChange={(event) => setSeedDraft(event.target.value)}
                  placeholder="1"
                />
              </label>
            </div>
            <div className="button-row cloud-arena-game-admin-actions">
              <button type="button" onClick={() => void handleCreateNewBattle()} disabled={isCreatingSession || isSubmitting}>
                {isCreatingSession ? "Creating..." : "New battle"}
              </button>
              <button type="button" onClick={() => void handleReset()} disabled={isCreatingSession || isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset battle"}
              </button>
            </div>
            <p className="cloud-arena-game-admin-note">
              {lastSubmittedActionLabel
                ? `Last action: ${lastSubmittedActionLabel}`
                : `Default energy: ${LEAN_V1_DEFAULT_TURN_ENERGY}`}
            </p>
            {sidebarHasFinished && sidebarFinishedEvent ? (
              <div className="warning-callout cloud-arena-game-finished">
                <strong>Battle finished</strong>
                <p>{formatTraceEvent(sidebarFinishedEvent)}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="app-shell-sidebar-section">
          <strong>Logs</strong>
          {battleViewModel ? (
            <div className="cloud-arena-game-log-panel">
              <CloudArenaLogPanel framed={false} groups={battleViewModel.logGroups} />
            </div>
          ) : (
            <p className="cloud-arena-game-admin-note">The battle log will appear after the session loads.</p>
          )}
        </section>
      </>
    );
  }

  const finishModal = hasFinished ? (() => {
    const winner = finishedEvent?.winner ?? "unknown";
    const didPlayerWin = winner === "player";
    const title = didPlayerWin ? "You Win!" : "You Lose!";
    const subtitle = didPlayerWin
      ? "The battle is yours. Try another run to see a different outcome."
      : "The enemy won the arena. Retry to launch a fresh battle.";

    return (
      <div
        className="cloud-arena-finish-modal-backdrop"
        role="presentation"
      >
        <div
          className="panel cloud-arena-finish-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="cloud-arena-finish-modal-header">
            <strong>{title}</strong>
            <span>{subtitle}</span>
          </div>
          <div className="button-row cloud-arena-finish-modal-actions">
            <button
              type="button"
              className="cloud-arena-finish-modal-retry"
              onClick={() => void handleReset()}
              disabled={isCreatingSession || isSubmitting}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  })() : null;

  return (
    <>
      <CloudArenaAppShell
        cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl}
        sidebarContent={buildSidebarContent({
          battleViewModel: snapshot ? viewModel : undefined,
          finishedEvent,
          hasFinished,
        })}
      >
        <section className="cloud-arena-game-frame">
          <section className="cloud-arena-game-screen">
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
            />
          </section>
        </section>
      </CloudArenaAppShell>
      {typeof document !== "undefined" && finishModal ? createPortal(finishModal, document.body) : finishModal}
    </>
  );
}
