import type { ReactElement } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";

import type {
  CloudArenaSessionSnapshot,
  CloudArenaSessionScenarioId,
} from "../../../../src/cloud-arena/api-contract.js";
import type { BattleAction, BattleEvent } from "../../../../src/cloud-arena/index.js";
import type { CardDefinitionId } from "../../../../src/cloud-arena/index.js";
import {
  CAMPAIGN_LEVELS,
  applyRewardChoice,
  drawRewardOptions,
  loadCampaignRun,
} from "../lib/cloud-arena-campaign.js";
import {
  CloudArenaAppShell,
  CloudArenaBattleState,
  DisplayCard,
  ErrorState,
  LoadingState,
} from "../components/index.js";
import {
  buildCloudArenaViewModelFromSessionSnapshot,
  CloudArcanumApiClientError,
  createCloudArenaSessionController,
  mapCardDefinitionIdToDisplayCard,
  CLOUD_ARENA_DECK_QUERY_PARAM,
  CLOUD_ARENA_SCENARIO_QUERY_PARAM,
  getDeckDraftFromUrl,
  getScenarioDraftFromUrl,
  type CloudArenaContentMode,
  type CloudArenaSessionMode,
} from "../lib/cloud-arena-web-lib.js";

export { buildCloudArenaDeckChooserGroups } from "../lib/cloud-arena-web-lib.js";

type CloudArenaInteractivePageProps = {
  apiBaseUrl: string;
  contentMode: CloudArenaContentMode;
  sessionMode: CloudArenaSessionMode;
  cloudArcanumWebBaseUrl: string;
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

function createBattleSeed(): number {
  return Math.max(1, Date.now());
}

export function CloudArenaInteractivePage({
  apiBaseUrl,
  sessionMode,
  cloudArcanumWebBaseUrl,
}: CloudArenaInteractivePageProps): ReactElement {
  const sessions = useMemo(
    () => createCloudArenaSessionController({ apiBaseUrl, mode: sessionMode }),
    [apiBaseUrl, sessionMode],
  );
  const location = useLocation();
  const navigate = useNavigate();

  const locationState = location.state as { campaignRunId?: string; levelIndex?: number } | null;
  const campaignRun = locationState?.campaignRunId ? loadCampaignRun() : null;
  const campaignLevel = campaignRun ? (CAMPAIGN_LEVELS[campaignRun.currentLevelIndex] ?? null) : null;
  const isCampaignBattle = campaignRun !== null && campaignLevel !== null;

  const [snapshot, setSnapshot] = useState<CloudArenaSessionSnapshot | null>(null);
  const [status, setStatus] = useState<InteractiveStatus>("loading");
  const [error, setError] = useState<Error | CloudArcanumApiClientError | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scenarioDraft, setScenarioDraft] = useState<CloudArenaSessionScenarioId>(
    isCampaignBattle ? campaignLevel.scenarioId : getScenarioDraftFromUrl(),
  );
  const [deckDraft, setDeckDraft] = useState<string>(
    isCampaignBattle ? campaignRun.savedDeckId : getDeckDraftFromUrl(),
  );
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardOptions, setRewardOptions] = useState<CardDefinitionId[]>([]);
  const [isProcessingReward, setIsProcessingReward] = useState(false);
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
    if (isCampaignBattle) return;

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
  }, [deckDraft, isCampaignBattle, location.pathname, location.search, navigate, scenarioDraft]);

  async function createSession(
    scenarioId: CloudArenaSessionScenarioId = scenarioDraft,
    deckId: string = deckDraft,
  ): Promise<void> {
    setIsCreatingSession(true);
    setStatus("loading");
    setError(null);

    try {
      const response = await sessions.createCloudArenaSession({
        scenarioId,
        deckId,
        seed: createBattleSeed(),
        shuffleDeck: true,
      });
      setSnapshot(response.data);
      setScenarioDraft(response.data.scenarioId);
      setDeckDraft(response.data.deckId ?? "master_deck");
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

    void sessions.createCloudArenaSession(
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
  }, [sessions]);

  useEffect(() => {
    if (!isCampaignBattle || !battleIsFinished || !snapshot) return;
    const finishedEvt = findBattleFinishedEvent(snapshot.log);
    if (finishedEvt?.winner === "player") {
      setRewardOptions(drawRewardOptions());
    }
  }, [battleIsFinished, isCampaignBattle, snapshot]);

  async function handleRewardChoice(chosenCardId: CardDefinitionId): Promise<void> {
    if (!campaignRun || isProcessingReward) return;
    setIsProcessingReward(true);
    try {
      await applyRewardChoice(campaignRun, chosenCardId);
      navigate("/campaign", { replace: true });
    } catch {
      setIsProcessingReward(false);
    }
  }

  async function handleApplyAction(action: BattleAction): Promise<void> {
    if (!snapshot || battleIsFinished || isActionInFlightRef.current) {
      return;
    }

    isActionInFlightRef.current = true;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await sessions.applyCloudArenaAction(snapshot.sessionId, { action });
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
        setError(new Error("The live battle session expired after the API restarted. A fresh battle has been created."));
        await createSession(scenarioDraft);
        return;
      }

      if (isStaleActionError) {
        try {
          const refreshedSession = await sessions.getCloudArenaSession(snapshot.sessionId);

          if (didSessionAdvance(snapshot, refreshedSession.data)) {
            setSnapshot(refreshedSession.data);
            setStatus("ready");
            setError(null);
            return;
          }
        } catch (refreshError: unknown) {
          const resolvedRefreshError = refreshError instanceof Error ? refreshError : new Error(String(refreshError));

          if (isMissingCloudArenaSessionError(resolvedRefreshError)) {
            setError(new Error("The live battle session expired after the API restarted. A fresh battle has been created."));
            await createSession(scenarioDraft);
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
      const response = await sessions.resetCloudArenaSession(snapshot.sessionId);
      setSnapshot(response.data);
      setScenarioDraft(response.data.scenarioId);
      setStatus("ready");
    } catch (nextError: unknown) {
      const resolvedError = nextError instanceof Error ? nextError : new Error(String(nextError));

      if (isMissingCloudArenaSessionError(resolvedError)) {
        setError(new Error("The live battle session expired after the API restarted. A fresh battle has been created."));
        await createSession(scenarioDraft);
        return;
      }

      setError(resolvedError);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
      isActionInFlightRef.current = false;
    }
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

  if (status === "error" && error) {
    return (
      <CloudArenaAppShell
        cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl}
        pageVariant="battle"
      >
        <ErrorState
          title="Battle session failed"
          description="The interactive battle view could not load or continue."
          details={formatApiErrorDetails(error)}
        />
      </CloudArenaAppShell>
    );
  }

  if (status === "loading" || !snapshot) {
    return (
      <CloudArenaAppShell
        cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl}
        pageVariant="battle"
      >
        <LoadingState
          title="Creating battle session"
          description={
            sessionMode === "local"
              ? "The browser is preparing a fresh simulation snapshot."
              : "The client is requesting a fresh simulation snapshot from the Cloud Arena API."
          }
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

  const finishModal = hasFinished ? (() => {
    const winner = finishedEvent?.winner ?? "unknown";
    const didPlayerWin = winner === "player";
    const title = didPlayerWin ? "You Win!" : "You Lose!";
    const subtitle = isCampaignBattle && didPlayerWin
      ? "Victory! Choose a card to add to your campaign deck."
      : didPlayerWin
        ? "The battle is yours. Try another run to see a different outcome."
        : isCampaignBattle
          ? "Defeated. Your campaign progress is kept — retry when ready."
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
            {isCampaignBattle && didPlayerWin ? (
              <button
                type="button"
                className="cloud-arena-finish-modal-retry"
                onClick={() => setShowRewardModal(true)}
              >
                Choose Reward
              </button>
            ) : (
              <button
                type="button"
                className="cloud-arena-finish-modal-retry"
                onClick={() => isCampaignBattle ? navigate("/campaign") : void handleReset()}
                disabled={isCreatingSession || isSubmitting}
              >
                {isCampaignBattle ? "Back to Campaign" : "Retry"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  })() : null;

  const rewardModal = showRewardModal && rewardOptions.length > 0 ? (
    <div className="cloud-arena-finish-modal-backdrop" role="presentation">
      <div
        className="panel cloud-arena-reward-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Choose a Reward"
      >
        <div className="cloud-arena-finish-modal-header">
          <strong>Choose a Reward</strong>
          <span>Pick 1 card to add to your campaign deck</span>
        </div>
        <div className="cloud-arena-reward-choices">
          {rewardOptions.map((cardId) => {
            let cardModel = null;
            try {
              cardModel = mapCardDefinitionIdToDisplayCard(cardId);
            } catch {
              // unknown card — skip render
            }
            if (!cardModel) return null;
            return (
              <button
                key={cardId}
                type="button"
                className="cloud-arena-reward-choice"
                onClick={() => void handleRewardChoice(cardId)}
                disabled={isProcessingReward}
              >
                <DisplayCard model={cardModel} />
              </button>
            );
          })}
        </div>
        {isProcessingReward && (
          <p className="cloud-arena-reward-processing">Adding to deck…</p>
        )}
      </div>
    </div>
  ) : null;

  const activeModal = showRewardModal ? rewardModal : finishModal;

  return (
    <>
      <CloudArenaAppShell
        cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl}
        pageVariant="battle"
      >
        <section className="cloud-arena-game-frame">
          <section className="cloud-arena-game-screen">
            <CloudArenaBattleState
              battle={viewModel.battle}
              recentEvents={viewModel.recentEvents}
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
              leadingBattleAction={
                <Link className="cloud-arena-hand-hud-main-menu-button" to="/">
                  Main Menu
                </Link>
              }
            />
          </section>
        </section>
      </CloudArenaAppShell>
      {typeof document !== "undefined" && activeModal ? createPortal(activeModal, document.body) : activeModal}
    </>
  );
}
