import type { FocusEvent, MouseEvent, ReactElement } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CloudArenaBattleViewModel } from "../lib/cloud-arena-battle-view-model.js";
import {
  getBattleMotionDiff,
  getBattleMotionOverlayKey,
  type CloudArenaBattleMotionState,
} from "../lib/cloud-arena-battle-motion.js";
import { CloudArenaBattlefieldPanel } from "./cloud-arena-battlefield-panel.js";
import { CloudArenaHandTray } from "./cloud-arena-hand-tray.js";
import { CloudArenaInspectorPanel } from "./cloud-arena-inspector-panel.js";
import {
  cloudArenaEnemyPresets,
  cardDefinitions,
  getAbilityCostDisplayParts,
  singleSlash,
} from "../../../../src/cloud-arena/index.js";
import {
  mapArenaEnemyToDisplayCard,
  mapArenaGraveyardCardToDisplayCard,
  mapArenaHandCardToDisplayCard,
  mapArenaPermanentToDisplayCard,
  mapArenaPlayerToDisplayCard,
  type DisplayCardModel,
} from "../lib/display-card.js";
import {
  buildEnemyPreviewCards,
  buildEnemyTelegraphPreviewCardModel,
} from "../lib/cloud-arena-enemy-card-preview.js";
import { buildBattlefieldAttachmentState } from "../lib/cloud-arena-battle-attachments.js";
import type { BattleEvent } from "../../../../src/cloud-arena/index.js";
import type {
  BattleAction,
  ActivatedAbilityActionId,
  RulesActionId,
} from "../../../../src/cloud-arena/index.js";

type CloudArenaBattleStateProps = {
  battle: CloudArenaBattleViewModel;
  recentEvents?: BattleEvent[];
  disableHandCardActions?: boolean;
  disablePermanentActions?: boolean;
  disableTurnActions?: boolean;
  maxPlayerEnergy?: number;
  onUsePermanentAction?: (action: Extract<BattleAction, { type: "use_permanent_action" }>) => void;
  onPlayHandCard?: (cardInstanceId: string) => void;
  onTurnAction?: (action: BattleAction) => void;
  playableHandCardInstanceIds?: string[];
  turnActions?: Array<{
    action: BattleAction;
    label: string;
  }>;
};

function isEnemyPermanentActedEvent(event: BattleEvent): event is Extract<BattleEvent, { type: "permanent_acted" }> {
  return event.type === "permanent_acted";
}

function getEnemyActionOverlayTargetPermanentId(battle: CloudArenaBattleViewModel): string | null {
  const enemyLeaderPermanent =
    battle.enemyBattlefield?.find((permanent): permanent is NonNullable<typeof permanent> =>
      Boolean(permanent?.isEnemyLeader),
    ) ?? null;

  if (enemyLeaderPermanent) {
    return enemyLeaderPermanent.instanceId;
  }

  const firstEnemyPermanent = battle.enemyBattlefield?.find(
    (permanent): permanent is NonNullable<typeof permanent> => permanent !== null,
  ) ?? null;

  return firstEnemyPermanent?.instanceId ?? null;
}

function getEnemyPreviewCardByCardId(cardId: string): DisplayCardModel | null {
  const enemyPreset = Object.values(cloudArenaEnemyPresets).find(
    (preset) => preset.cards.some((card) => card.id === cardId),
  );
  const enemyCard = enemyPreset?.cards.find((card) => card.id === cardId);

  return enemyCard ? buildEnemyPreviewCards([enemyCard])[0] ?? null : null;
}

function getEnemyActionOverlayFromEvent(
  battle: CloudArenaBattleViewModel,
  event: BattleEvent | null,
): { card: DisplayCardModel; permanentId: string; key: string; isFading: boolean } | null {
  if (!event) {
    return null;
  }

  if (event.type === "enemy_card_played") {
    const previewCard = getEnemyPreviewCardByCardId(event.cardId);
    const permanentId = getEnemyActionOverlayTargetPermanentId(battle);

    if (!previewCard || !permanentId) {
      return null;
    }

    return {
      card: previewCard,
      permanentId,
      key: `${event.turnNumber}:enemy_card_played:${event.cardId}`,
      isFading: false,
    };
  }

  if (event.type === "permanent_acted") {
    const permanent = battle.enemyBattlefield?.find((entry) => entry?.instanceId === event.permanentId) ?? null;

    if (!permanent || permanent.controllerId !== "enemy") {
      return null;
    }

    if (event.action !== "attack") {
      return null;
    }

    return {
      card: buildEnemyPreviewCards([singleSlash()])[0],
      permanentId: permanent.instanceId,
      key: `${event.turnNumber}:permanent_acted:${event.permanentId}:${event.action}`,
      isFading: false,
    };
  }

  return null;
}

function getLatestEnemyActionOverlayEvent(
  events: BattleEvent[],
  enemyBattlefield: CloudArenaBattleViewModel["enemyBattlefield"],
): BattleEvent | null {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];

    if (!event) {
      continue;
    }

    if (event.type === "enemy_card_played") {
      return event;
    }

    if (isEnemyPermanentActedEvent(event)) {
      const permanent = enemyBattlefield?.find((entry) => entry?.instanceId === event.permanentId) ?? null;

      if (permanent && permanent.controllerId === "enemy") {
        return event;
      }
    }
  }

  return null;
}

function summarizeEnemyBattlefield(
  enemyBattlefield: CloudArenaBattleViewModel["enemyBattlefield"],
): Array<{
  instanceId: string;
  definitionId: string;
  name: string;
  isEnemyLeader: boolean;
  slotIndex: number;
  controllerId?: string | null;
}> {
  return (enemyBattlefield ?? [])
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .map((entry) => ({
      instanceId: entry.instanceId,
      definitionId: entry.definitionId,
      name: entry.name,
      isEnemyLeader: Boolean(entry.isEnemyLeader),
      slotIndex: entry.slotIndex,
      controllerId: entry.controllerId ?? null,
    }));
}

export function CloudArenaBattleState({
  battle,
  recentEvents = [],
  disableHandCardActions = false,
  disablePermanentActions = false,
  disableTurnActions = false,
  maxPlayerEnergy = 3,
  onUsePermanentAction,
  onPlayHandCard,
  onTurnAction,
  playableHandCardInstanceIds = [],
  turnActions = [],
}: CloudArenaBattleStateProps): ReactElement {
  const battleWindowRef = useRef<HTMLDivElement | null>(null);
  const battleMainRef = useRef<HTMLDivElement | null>(null);
  const previousBattleRef = useRef<CloudArenaBattleViewModel | null>(null);
  const playerHealthDropTimerRef = useRef<number | null>(null);
  const animationTimersRef = useRef<Record<string, number>>({});
  const healthFlashTimersRef = useRef<Record<string, number>>({});
  const enemyActionOverlayTimersRef = useRef<{ fade: number | null; clear: number | null }>({
    fade: null,
    clear: null,
  });
  const enemyActionOverlayCooldownTimerRef = useRef<number | null>(null);
  const pendingEnemyActionOverlayRef = useRef<{
    card: DisplayCardModel;
    permanentId: string;
    key: string;
    isFading: boolean;
  } | null>(null);
  const enemyActionOverlayBlockedUntilRef = useRef<number>(0);
  const enemyActionOverlayKeyRef = useRef<string | null>(null);
  const [isPlayerHealthDropping, setIsPlayerHealthDropping] = useState(false);
  const [healthFlashDirections, setHealthFlashDirections] = useState<Record<string, "increase" | "decrease">>({});
  const [enemyBattlefieldStackOrder, setEnemyBattlefieldStackOrder] = useState<string[]>([]);
  const [raisedEnemyPermanentId, setRaisedEnemyPermanentId] = useState<string | null>(null);
  const [enemyActionOverlay, setEnemyActionOverlay] = useState<{
    card: DisplayCardModel;
    permanentId: string;
    key: string;
    isFading: boolean;
  } | null>(() => {
    const latestOverlayEvent = getLatestEnemyActionOverlayEvent(recentEvents, battle.enemyBattlefield);

    if (!latestOverlayEvent) {
      return null;
    }

    if (latestOverlayEvent.type === "enemy_card_played") {
      const previewCard = getEnemyPreviewCardByCardId(latestOverlayEvent.cardId);
      const targetPermanentId = getEnemyActionOverlayTargetPermanentId(battle);

      if (!previewCard || !targetPermanentId) {
        return null;
      }

      return {
        card: previewCard,
        permanentId: targetPermanentId,
        key: `${latestOverlayEvent.turnNumber}:enemy_card_played:${latestOverlayEvent.cardId}`,
        isFading: false,
      };
    }

    if (!isEnemyPermanentActedEvent(latestOverlayEvent)) {
      return null;
    }

    const permanent = battle.enemyBattlefield?.find((entry) => entry?.instanceId === latestOverlayEvent.permanentId) ?? null;

    if (!permanent || permanent.controllerId !== "enemy") {
      return null;
    }

    return {
      card: mapArenaPermanentToDisplayCard(permanent, {
        disableActions: true,
      }),
      permanentId: permanent.instanceId,
      key: `${latestOverlayEvent.turnNumber}:permanent_acted:${latestOverlayEvent.permanentId}:${latestOverlayEvent.action}`,
      isFading: false,
    };
  });
  const playableHandCards = new Set(playableHandCardInstanceIds);
  const fallbackEnemyBattlefield = useMemo(
    () => Array.from({ length: battle.battlefield.length }, () => null),
    [battle.battlefield.length],
  );
  const enemyBattlefield = battle.enemyBattlefield ?? fallbackEnemyBattlefield;
  const isTargeting = battle.pendingTargetRequest !== null;
  const targetableBattlefieldPermanentIds = new Set(
    battle.legalActions.flatMap((entry) =>
      entry.action.type === "choose_target" ? [entry.action.targetPermanentId] : [],
    ),
  );
  const playerHealthFlashDirection = healthFlashDirections.player ?? null;
  const enemyHealthFlashDirection = healthFlashDirections.enemy ?? null;
  const playerCard = useMemo(
    () =>
      mapArenaPlayerToDisplayCard(
        {
          ...battle.player,
          isHealthDropping: isPlayerHealthDropping || playerHealthFlashDirection === "decrease",
          isHealthRising: playerHealthFlashDirection === "increase",
        },
        {
          stateFlags: playerHealthFlashDirection
            ? [playerHealthFlashDirection === "increase" ? "health-rising" : "health-dropping"]
            : [],
        },
      ),
    [battle.player, isPlayerHealthDropping, playerHealthFlashDirection],
  );
  const enemyCard = useMemo(
    () =>
      mapArenaEnemyToDisplayCard(
        {
          ...battle.enemy,
          isHealthDropping: enemyHealthFlashDirection === "decrease",
          isHealthRising: enemyHealthFlashDirection === "increase",
        },
        {
          stateFlags: enemyHealthFlashDirection
            ? [enemyHealthFlashDirection === "increase" ? "health-rising" : "health-dropping"]
            : [],
        },
      ),
    [battle.enemy, enemyHealthFlashDirection],
  );
  const [hoveredInspectorKey, setHoveredInspectorKey] = useState<string | null>(null);
  const [hoveredInspectorTab, setHoveredInspectorTab] = useState<"info" | "cards" | "sequence">("info");
  const [hoveredInspectorPosition, setHoveredInspectorPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [openPermanentMenuId, setOpenPermanentMenuId] = useState<string | null>(null);
  const [motionState, setMotionState] = useState<CloudArenaBattleMotionState>({
    attackIds: {},
    hitIds: {},
    healthIncreaseIds: {},
    healthDecreaseIds: {},
    deathOverlays: {},
  });
  const groupedTurnActions = turnActions.length > 0
    ? turnActions
    : battle.actionGroups.turn.map((entry) => ({
        action: entry.action,
        label: entry.label,
      }));
  const battlefieldAttachmentState = useMemo(
    () => buildBattlefieldAttachmentState(battle),
    [battle],
  );

  function getDefinitionJson(definitionId: string): string | null {
    const definition = cardDefinitions[definitionId];

    if (!definition) {
      return null;
    }

    return JSON.stringify(definition, null, 2);
  }

  function getPermanentCounterEntries(
    permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
  ): Array<{ counter: string; amount: number }> {
    if (Array.isArray(permanent.counters)) {
      return permanent.counters
        .filter((entry) => entry.amount > 0)
        .map((entry) => ({ counter: entry.counter, amount: entry.amount }));
    }

    return Object.entries(permanent.counters ?? {})
    .filter((entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] > 0)
    .map(([counter, amount]) => ({ counter, amount }));
  }

  function getPermanentActionLabel(
    permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
    action: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>["actions"][number],
  ): string {
    if (action.activation.actionId === "attack") {
      return `Attack ${permanent.power}`;
    }

    if (action.activation.actionId === "apply_block") {
      return "Apply Block";
    }

    if (action.activation.actionId === "equip") {
      return "Equip";
    }

    if (action.activation.actionId === "gain_energy") {
      return "Gain Energy";
    }

    return action.activation.actionId.replace(/_/g, " ");
  }

  function clearMotionTimer(key: string): void {
    const existingTimer = animationTimersRef.current[key];

    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer);
      delete animationTimersRef.current[key];
    }
  }

  function clearHealthFlashTimer(key: string): void {
    const existingTimer = healthFlashTimersRef.current[key];

    if (existingTimer !== undefined) {
      window.clearTimeout(existingTimer);
      delete healthFlashTimersRef.current[key];
    }
  }

  function playHealthFlash(targetId: string, direction: "increase" | "decrease", durationMs: number): void {
    const key = `health:${targetId}`;
    clearHealthFlashTimer(key);

    setHealthFlashDirections((current) => ({
      ...current,
      [targetId]: direction,
    }));

    healthFlashTimersRef.current[key] = window.setTimeout(() => {
      setHealthFlashDirections((current) => {
        if (!(targetId in current)) {
          return current;
        }

        const nextDirections = { ...current };
        delete nextDirections[targetId];
        return nextDirections;
      });

      delete healthFlashTimersRef.current[key];
    }, durationMs);
  }

  function clearEnemyActionOverlayTimers(): void {
    if (enemyActionOverlayTimersRef.current.fade !== null) {
      window.clearTimeout(enemyActionOverlayTimersRef.current.fade);
      enemyActionOverlayTimersRef.current.fade = null;
    }

    if (enemyActionOverlayTimersRef.current.clear !== null) {
      window.clearTimeout(enemyActionOverlayTimersRef.current.clear);
      enemyActionOverlayTimersRef.current.clear = null;
    }
  }

  function clearEnemyActionOverlayCooldownTimer(): void {
    if (enemyActionOverlayCooldownTimerRef.current !== null) {
      window.clearTimeout(enemyActionOverlayCooldownTimerRef.current);
      enemyActionOverlayCooldownTimerRef.current = null;
    }
  }

  function showEnemyActionOverlay(card: DisplayCardModel, permanentId: string, key: string): void {
    clearEnemyActionOverlayTimers();
    enemyActionOverlayKeyRef.current = key;
    setEnemyActionOverlay({
      card,
      permanentId,
      key,
      isFading: false,
    });
  }

  function scheduleEnemyActionOverlay(card: DisplayCardModel, permanentId: string, key: string): void {
    const now = Date.now();
    const delayMs = Math.max(0, enemyActionOverlayBlockedUntilRef.current - now);

    if (delayMs === 0) {
      showEnemyActionOverlay(card, permanentId, key);
      return;
    }

    pendingEnemyActionOverlayRef.current = { card, permanentId, key, isFading: false };
    clearEnemyActionOverlayCooldownTimer();
    enemyActionOverlayCooldownTimerRef.current = window.setTimeout(() => {
      enemyActionOverlayCooldownTimerRef.current = null;
      const pending = pendingEnemyActionOverlayRef.current;
      pendingEnemyActionOverlayRef.current = null;

      if (!pending) {
        return;
      }

      showEnemyActionOverlay(pending.card, pending.permanentId, pending.key);
    }, delayMs);
  }

  function fadeEnemyActionOverlay(key: string): void {
    if (!enemyActionOverlay || enemyActionOverlay.key !== key || enemyActionOverlay.isFading) {
      return;
    }

    if (enemyActionOverlayTimersRef.current.fade !== null) {
      window.clearTimeout(enemyActionOverlayTimersRef.current.fade);
      enemyActionOverlayTimersRef.current.fade = null;
    }
    if (enemyActionOverlayTimersRef.current.clear !== null) {
      window.clearTimeout(enemyActionOverlayTimersRef.current.clear);
      enemyActionOverlayTimersRef.current.clear = null;
    }

    enemyActionOverlayTimersRef.current.fade = window.setTimeout(() => {
      setEnemyActionOverlay((current) => {
        if (!current || current.key !== key) {
          return current;
        }

        return {
          ...current,
          isFading: true,
        };
      });

      enemyActionOverlayTimersRef.current.fade = null;
    }, 10);

    enemyActionOverlayTimersRef.current.clear = window.setTimeout(() => {
      setEnemyActionOverlay((current) => {
        if (!current || current.key !== key) {
          return current;
        }

        enemyActionOverlayBlockedUntilRef.current = Date.now() + 1000;

        return null;
      });

      enemyActionOverlayTimersRef.current.clear = null;
    }, 320);
  }

  function playAttackAnimation(attackId: string, durationMs: number): void {
    const key = `attack:${attackId}`;
    clearMotionTimer(key);

    setMotionState((current) => ({
      ...current,
      attackIds: {
        ...current.attackIds,
        [attackId]: true,
      },
    }));

    animationTimersRef.current[key] = window.setTimeout(() => {
      setMotionState((current) => {
        if (!(attackId in current.attackIds)) {
          return current;
        }

        const attackIds = { ...current.attackIds };
        delete attackIds[attackId];
        return { ...current, attackIds };
      });

      delete animationTimersRef.current[key];
    }, durationMs);
  }

  function playHitAnimation(hitId: string, durationMs: number): void {
    const key = `hit:${hitId}`;
    clearMotionTimer(key);

    setMotionState((current) => ({
      ...current,
      hitIds: {
        ...current.hitIds,
        [hitId]: true,
      },
    }));

    animationTimersRef.current[key] = window.setTimeout(() => {
      setMotionState((current) => {
        if (!(hitId in current.hitIds)) {
          return current;
        }

        const hitIds = { ...current.hitIds };
        delete hitIds[hitId];
        return { ...current, hitIds };
      });

      delete animationTimersRef.current[key];
    }, durationMs);
  }

  function playDeathAnimation(
    overlayKey: string,
    durationMs: number,
    overlay: CloudArenaBattleMotionState["deathOverlays"][string],
  ): void {
    const key = `death:${overlayKey}`;
    clearMotionTimer(key);

    setMotionState((current) => ({
      ...current,
      deathOverlays: {
        ...current.deathOverlays,
        [overlayKey]: overlay,
      },
    }));

    animationTimersRef.current[key] = window.setTimeout(() => {
      setMotionState((current) => {
        if (!(overlayKey in current.deathOverlays)) {
          return current;
        }

        const deathOverlays = { ...current.deathOverlays };
        delete deathOverlays[overlayKey];
        return { ...current, deathOverlays };
      });

      delete animationTimersRef.current[key];
    }, durationMs);
  }

  const inspectableModels = useMemo(() => {
    const models = new Map<string, ReturnType<typeof mapArenaPlayerToDisplayCard>>();
    models.set("player", playerCard);
    models.set("enemy", enemyCard);

    for (const card of battle.player.hand) {
      const handCardModel = mapArenaHandCardToDisplayCard(card, {
        isPlayable: playableHandCards.has(card.instanceId),
        disabled: disableHandCardActions,
        onPlay: onPlayHandCard,
      });

      models.set(
        `hand:${card.instanceId}`,
        handCardModel,
      );
    }

    for (const card of battle.player.drawPile) {
      models.set(
        `draw:${card.instanceId}`,
        mapArenaHandCardToDisplayCard(card, {
          isPlayable: false,
          disabled: true,
        }),
      );
    }

    for (const card of battle.player.discardPile) {
      models.set(
        `discard:${card.instanceId}`,
        mapArenaHandCardToDisplayCard(card, {
          isPlayable: false,
          disabled: true,
        }),
      );
    }

    for (const card of battle.player.graveyard) {
      models.set(
        `graveyard:${card.instanceId}`,
        mapArenaGraveyardCardToDisplayCard(card, {
          disabled: true,
        }),
      );
    }

    for (const slot of battle.battlefield) {
      if (!slot) {
        continue;
      }

      const battlefieldCardModel = mapArenaPermanentToDisplayCard(slot, {
        disableActions: disablePermanentActions,
        isTargetable: targetableBattlefieldPermanentIds.has(slot.instanceId),
        targetTone: slot.controllerId === "enemy" ? "enemy" : "player",
        stateFlags: healthFlashDirections[slot.instanceId]
          ? [`health-${healthFlashDirections[slot.instanceId] === "increase" ? "rising" : "dropping"}`]
          : [],
      });

      models.set(
        `battlefield:${slot.instanceId}`,
        battlefieldCardModel,
      );
    }

    for (const slot of enemyBattlefield) {
      if (!slot) {
        continue;
      }

      const enemyBattlefieldCardModel = mapArenaPermanentToDisplayCard(slot, {
        disableActions: disablePermanentActions,
        isTargetable: targetableBattlefieldPermanentIds.has(slot.instanceId),
        targetTone: slot.controllerId === "enemy" ? "enemy" : "player",
        stateFlags: healthFlashDirections[slot.instanceId]
          ? [`health-${healthFlashDirections[slot.instanceId] === "increase" ? "rising" : "dropping"}`]
          : [],
      });

      models.set(
        `enemy_battlefield:${slot.instanceId}`,
        enemyBattlefieldCardModel,
      );
    }

    return models;
  }, [
    battle.battlefield,
    enemyBattlefield,
    battle.player.hand,
    disableHandCardActions,
    disablePermanentActions,
    enemyCard,
    onPlayHandCard,
    onUsePermanentAction,
    playableHandCards,
    healthFlashDirections,
    targetableBattlefieldPermanentIds,
    playerCard,
  ]);

  useEffect(() => {
    const previousBattle = previousBattleRef.current;
    previousBattleRef.current = battle;

    if (!previousBattle) {
      return () => undefined;
    }

    const previousPendingTargetRequest = previousBattle.pendingTargetRequest;
    const currentPendingTargetRequest = battle.pendingTargetRequest;
    const resolvedAttackSourceId =
      previousPendingTargetRequest &&
      !currentPendingTargetRequest &&
      previousPendingTargetRequest.targetKind === "permanent" &&
      previousPendingTargetRequest.context?.abilitySourcePermanentId &&
      previousPendingTargetRequest.prompt.toLowerCase().includes("attack")
        ? previousPendingTargetRequest.context.abilitySourcePermanentId
        : null;

    if (resolvedAttackSourceId) {
      playAttackAnimation(resolvedAttackSourceId, 560);
    }

    const previousPlayerHealth = previousBattle.player.health;
    if (battle.player.health < previousPlayerHealth) {
      setIsPlayerHealthDropping(true);

      if (playerHealthDropTimerRef.current !== null) {
        window.clearTimeout(playerHealthDropTimerRef.current);
      }

      playerHealthDropTimerRef.current = window.setTimeout(() => {
        setIsPlayerHealthDropping(false);
        playerHealthDropTimerRef.current = null;
      }, 520);
    }

    const diff = getBattleMotionDiff(previousBattle, battle);

    if (!resolvedAttackSourceId) {
      for (const attackId of diff.attackIds) {
        playAttackAnimation(attackId, 420);
      }
    }

    for (const hitId of diff.hitIds) {
      playHitAnimation(hitId, 260);
    }

    for (const healthIncreaseId of diff.healthIncreaseIds) {
      playHealthFlash(healthIncreaseId, "increase", 520);
    }

    for (const healthDecreaseId of diff.healthDecreaseIds) {
      playHealthFlash(healthDecreaseId, "decrease", 520);
    }

    if (battle.player.health > previousBattle.player.health) {
      playHealthFlash("player", "increase", 520);
    } else if (battle.player.health < previousBattle.player.health) {
      playHealthFlash("player", "decrease", 520);
    }

    if (battle.enemy.health > previousBattle.enemy.health) {
      playHealthFlash("enemy", "increase", 520);
    } else if (battle.enemy.health < previousBattle.enemy.health) {
      playHealthFlash("enemy", "decrease", 520);
    }

    for (const overlay of diff.deathOverlays) {
      const overlayKey = getBattleMotionOverlayKey(overlay);
      playDeathAnimation(overlayKey, 760, overlay);
    }

    const latestOverlayEvent = getLatestEnemyActionOverlayEvent(recentEvents, battle.enemyBattlefield);

    if (latestOverlayEvent) {
      const latestOverlay = getEnemyActionOverlayFromEvent(battle, latestOverlayEvent);

      if (latestOverlay && latestOverlay.key !== enemyActionOverlayKeyRef.current) {
        scheduleEnemyActionOverlay(latestOverlay.card, latestOverlay.permanentId, latestOverlay.key);
      }

      if (latestOverlay && latestOverlay.key === enemyActionOverlayKeyRef.current) {
        fadeEnemyActionOverlay(latestOverlay.key);
      }
    }

    return () => undefined;
  }, [battle, recentEvents]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof console === "undefined") {
      return;
    }

    const latestOverlayEvent = getLatestEnemyActionOverlayEvent(recentEvents, battle.enemyBattlefield);
    const latestOverlay = getEnemyActionOverlayFromEvent(battle, latestOverlayEvent);
    const latestOverlayEventSummary = latestOverlayEvent
      ? latestOverlayEvent.type === "enemy_card_played"
        ? {
            type: latestOverlayEvent.type,
            turnNumber: latestOverlayEvent.turnNumber,
            cardId: latestOverlayEvent.cardId,
          }
        : (() => {
            const actedEvent = latestOverlayEvent as Extract<BattleEvent, { type: "permanent_acted" }>;

            return {
              type: actedEvent.type,
              turnNumber: actedEvent.turnNumber,
              permanentId: actedEvent.permanentId,
              action: actedEvent.action,
              source: actedEvent.source,
            };
          })()
      : null;

    console.info("[CloudArena] enemy overlay state", {
      turnNumber: battle.turnNumber,
      phase: battle.phase,
      latestOverlayEvent: latestOverlayEventSummary,
      enemyBattlefield: summarizeEnemyBattlefield(battle.enemyBattlefield),
      enemyActionOverlay: enemyActionOverlay
        ? {
            key: enemyActionOverlay.key,
            permanentId: enemyActionOverlay.permanentId,
            isFading: enemyActionOverlay.isFading,
            card: {
              variant: enemyActionOverlay.card.variant,
              name: enemyActionOverlay.card.name,
              title: enemyActionOverlay.card.title,
              subtitle: enemyActionOverlay.card.subtitle,
            },
          }
        : null,
      resolvedOverlay: latestOverlay
        ? {
            key: latestOverlay.key,
            permanentId: latestOverlay.permanentId,
            isFading: latestOverlay.isFading,
            card: {
              variant: latestOverlay.card.variant,
              name: latestOverlay.card.name,
              title: latestOverlay.card.title,
              subtitle: latestOverlay.card.subtitle,
            },
          }
        : null,
    });
  }, [battle, enemyActionOverlay, recentEvents]);

  useEffect(() => () => {
    if (playerHealthDropTimerRef.current !== null) {
      window.clearTimeout(playerHealthDropTimerRef.current);
      playerHealthDropTimerRef.current = null;
    }
    for (const timerId of Object.values(healthFlashTimersRef.current)) {
      window.clearTimeout(timerId);
    }
    healthFlashTimersRef.current = {};
    for (const timerId of Object.values(animationTimersRef.current)) {
      window.clearTimeout(timerId);
    }
    animationTimersRef.current = {};
    clearEnemyActionOverlayTimers();
    clearEnemyActionOverlayCooldownTimer();
  }, []);

  useEffect(() => {
    const battlefieldIds = enemyBattlefield.flatMap((slot) => (slot ? [slot.instanceId] : []));
    const battlefieldIdSet = new Set(battlefieldIds);

    setEnemyBattlefieldStackOrder((current) => {
      const preservedIds = current.filter((instanceId) => battlefieldIds.includes(instanceId));
      const preservedSet = new Set(preservedIds);
      const missingIds = battlefieldIds.filter((instanceId) => !preservedSet.has(instanceId));

      return [...preservedIds, ...missingIds];
    });
    setRaisedEnemyPermanentId((current) => (current && battlefieldIdSet.has(current) ? current : null));
  }, [enemyBattlefield]);

  function toggleEnemyBattlefieldStackOrder(permanentId: string): void {
    if (isTargeting) {
      return;
    }

    const isCurrentlyRaised = raisedEnemyPermanentId === permanentId;

    if (isCurrentlyRaised) {
      setRaisedEnemyPermanentId(null);
      setEnemyBattlefieldStackOrder((current) => {
        const idx = current.indexOf(permanentId);
        if (idx === -1) return current;
        const next = current.slice();
        next.splice(idx, 1);
        next.push(permanentId);
        return next;
      });
    } else {
      setRaisedEnemyPermanentId(permanentId);
      setEnemyBattlefieldStackOrder((current) => {
        const idx = current.indexOf(permanentId);
        if (idx === -1) return current;
        const next = current.slice();
        next.splice(idx, 1);
        next.unshift(permanentId);
        return next;
      });
    }
  }

  const getInspectableModel = (key: string) => inspectableModels.get(key) ?? enemyCard;
  const hoveredInspectorDefinitionJson = hoveredInspectorKey
    ? (() => {
        if (hoveredInspectorKey === "player" || hoveredInspectorKey === "enemy") {
          return null;
        }

        if (hoveredInspectorKey.startsWith("hand:")) {
          const cardInstanceId = hoveredInspectorKey.slice("hand:".length);
          const card = battle.player.hand.find((entry) => entry.instanceId === cardInstanceId);
          return card ? getDefinitionJson(card.definitionId) : null;
        }

        if (hoveredInspectorKey.startsWith("draw:")) {
          const cardInstanceId = hoveredInspectorKey.slice("draw:".length);
          const card = battle.player.drawPile.find((entry) => entry.instanceId === cardInstanceId);
          return card ? getDefinitionJson(card.definitionId) : null;
        }

        if (hoveredInspectorKey.startsWith("discard:")) {
          const cardInstanceId = hoveredInspectorKey.slice("discard:".length);
          const card = battle.player.discardPile.find((entry) => entry.instanceId === cardInstanceId);
          return card ? getDefinitionJson(card.definitionId) : null;
        }

        if (hoveredInspectorKey.startsWith("graveyard:")) {
          const cardInstanceId = hoveredInspectorKey.slice("graveyard:".length);
          const card = battle.player.graveyard.find((entry) => entry.instanceId === cardInstanceId);
          return card ? getDefinitionJson(card.definitionId) : null;
        }

        if (hoveredInspectorKey.startsWith("battlefield:")) {
          const permanentId = hoveredInspectorKey.slice("battlefield:".length);
          const permanent = battle.battlefield.find((entry) => entry?.instanceId === permanentId) ?? null;
          return permanent ? getDefinitionJson(permanent.definitionId) : null;
        }

        if (hoveredInspectorKey.startsWith("enemy_battlefield:")) {
          const permanentId = hoveredInspectorKey.slice("enemy_battlefield:".length);
          const permanent = enemyBattlefield.find((entry) => entry?.instanceId === permanentId) ?? null;
          return permanent ? getDefinitionJson(permanent.definitionId) : null;
        }

        return null;
      })()
    : null;
  const hoveredInspectorEnemyPermanent = useMemo(
    () => {
      if (!hoveredInspectorKey?.startsWith("enemy_battlefield:")) {
        return null;
      }

      const permanentId = hoveredInspectorKey.slice("enemy_battlefield:".length);
      return enemyBattlefield.find((entry) => entry?.instanceId === permanentId) ?? null;
    },
    [enemyBattlefield, hoveredInspectorKey],
  );
  const hoveredInspectorEnemyTelegraphCard = useMemo(() => {
    if (!hoveredInspectorEnemyPermanent) {
      return null;
    }

    return buildEnemyTelegraphPreviewCardModel({
      currentCardId:
        hoveredInspectorEnemyPermanent.definitionId === battle.enemy.leaderDefinitionId
          ? battle.enemy.currentCardId
          : null,
      intentLabel: hoveredInspectorEnemyPermanent.intentLabel,
      intentQueueLabels: hoveredInspectorEnemyPermanent.intentQueueLabels,
      power: hoveredInspectorEnemyPermanent.power,
    });
  }, [
    battle.enemy.currentCardId,
    battle.enemy.leaderDefinitionId,
    hoveredInspectorEnemyPermanent,
  ]);
  const hoveredInspectorSequenceCards = useMemo<Array<{ key: string; model: DisplayCardModel }>>(() => {
    if (!hoveredInspectorEnemyPermanent) {
      return [];
    }

    const enemyPreset = Object.values(cloudArenaEnemyPresets).find(
      (preset) => preset.definitionId === hoveredInspectorEnemyPermanent.definitionId,
    );

    if (!enemyPreset) {
      return hoveredInspectorEnemyTelegraphCard
        ? [
            {
              key: `${hoveredInspectorEnemyPermanent.instanceId}:enemy-sequence:current`,
              model: hoveredInspectorEnemyTelegraphCard,
            },
          ]
        : [];
    }

    const sequenceCards: Array<{ key: string; model: DisplayCardModel }> = [];

    if (hoveredInspectorEnemyTelegraphCard) {
      sequenceCards.push({
        key: `${hoveredInspectorEnemyPermanent.instanceId}:enemy-sequence:current`,
        model: hoveredInspectorEnemyTelegraphCard,
      });
    }

    sequenceCards.push(
      ...buildEnemyPreviewCards(enemyPreset.cards).map((model, index) => ({
        key: `${hoveredInspectorEnemyPermanent.instanceId}:enemy-sequence:${index}`,
        model,
      })),
    );

    return sequenceCards;
  }, [hoveredInspectorEnemyPermanent, hoveredInspectorEnemyTelegraphCard]);
  const hoveredInspectorCards = useMemo<Array<{ key: string; model: DisplayCardModel }>>(() => {
    if (!hoveredInspectorKey?.startsWith("enemy_battlefield:")) {
      return [];
    }

    if (!hoveredInspectorEnemyPermanent) {
      return [];
    }

    const attachedCards = [...battle.battlefield, ...enemyBattlefield]
      .flatMap((slot) => {
        if (!slot?.attachedTo || slot.controllerId !== "enemy") {
          return [];
        }

        return [{
          key: `${slot.controllerId === "enemy" ? "enemy_battlefield" : "battlefield"}:${slot.instanceId}`,
          model: getInspectableModel(`${slot.controllerId === "enemy" ? "enemy_battlefield" : "battlefield"}:${slot.instanceId}`),
        }];
      });

    const enemyCard = hoveredInspectorEnemyTelegraphCard
      ? [{
          key: `${hoveredInspectorEnemyPermanent.instanceId}:enemy-card`,
          model: hoveredInspectorEnemyTelegraphCard,
        }]
      : [];

    return [...enemyCard, ...attachedCards];
  }, [battle.battlefield, enemyBattlefield, hoveredInspectorEnemyPermanent, hoveredInspectorEnemyTelegraphCard]);
  const hoveredInspectorHasCardsTab = hoveredInspectorCards.length > 0 || hoveredInspectorEnemyPermanent !== null;
  const hoveredInspectorHasSequenceTab = hoveredInspectorSequenceCards.length > 0;

  function getAnchoredInspectorPosition(
    targetRect: DOMRect,
  ): { left: number; top: number } | null {
    const battleWindow = battleWindowRef.current;

    if (!battleWindow) {
      return null;
    }

    const rect = battleWindow.getBoundingClientRect();
    const offset = 18;
    const padding = 12;
    const inspectorWidth = 352;
    const inspectorHeight = 520;
    const maxLeft = Math.max(padding, rect.width - inspectorWidth - padding);
    const maxTop = Math.max(padding, rect.height - inspectorHeight - padding);
    const targetLeft = targetRect.left - rect.left;
    const targetRight = targetRect.right - rect.left;
    const targetTop = targetRect.top - rect.top;
    const targetCenterY = targetTop + (targetRect.height / 2);
    const preferredRight = targetRight + offset;
    const preferredLeft = targetLeft - inspectorWidth - offset;
    const left = preferredRight <= maxLeft
      ? preferredRight
      : Math.max(padding, Math.min(preferredLeft, maxLeft));
    const preferredTop = targetCenterY - (inspectorHeight / 2);

    return {
      left,
      top: Math.min(Math.max(preferredTop, padding), maxTop),
    };
  }

  function openInspector(key: string, event: MouseEvent<HTMLElement>): void {
    setHoveredInspectorKey(key);
    if (key.startsWith("enemy_battlefield:")) {
      const permanentId = key.slice("enemy_battlefield:".length);
      const selectedPermanent = enemyBattlefield.find((entry) => entry?.instanceId === permanentId) ?? null;
      const enemyPreset = selectedPermanent
        ? Object.values(cloudArenaEnemyPresets).find(
            (preset) => preset.definitionId === selectedPermanent.definitionId,
          )
        : null;

      setHoveredInspectorTab(enemyPreset?.cards.length ? "sequence" : "info");
    } else {
      setHoveredInspectorTab("info");
    }
    setHoveredInspectorPosition(
      getAnchoredInspectorPosition(event.currentTarget.getBoundingClientRect()),
    );
  }

  function isInspectorRelatedTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) {
      return false;
    }

    return target.closest(".cloud-arena-inspector-panel") !== null;
  }

  function getPermanentMenuActions(
    permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
  ): Array<{
    action: ActivatedAbilityActionId | RulesActionId;
    label: string;
    costs: Array<{ type: "free" } | { type: "energy"; amount: number } | { type: "tap" }>;
    disabled?: boolean;
    onSelect?: () => void;
  }> {
    const legalBattlefieldActionKeys = new Set(
      battle.legalActions
        .filter(
          (entry) =>
            entry.action.type === "use_permanent_action" &&
            entry.action.permanentId === permanent.instanceId,
        )
        .map((entry) => {
          const action = entry.action as Extract<BattleAction, { type: "use_permanent_action" }>;
          return `${action.permanentId}:${action.action}`;
        }),
    );

    const nativeAttackAction = permanent.isCreature
      ? [{
          action: "attack" as const,
          label: `Attack ${permanent.power}`,
          costs: [{ type: "free" as const }],
          disabled: disablePermanentActions || !legalBattlefieldActionKeys.has(`${permanent.instanceId}:attack`),
          onSelect: onUsePermanentAction
            ? () => onUsePermanentAction({
                type: "use_permanent_action",
                permanentId: permanent.instanceId,
                source: "rules",
                action: "attack",
              })
            : undefined,
        }]
      : [];
    const activatedActions = permanent.actions.flatMap((action) => {
      if (action.kind !== "activated") {
        return [];
      }

      const mode = action.activation.actionId;

      return [{
        action: mode,
        label: getPermanentActionLabel(permanent, action),
        costs: getAbilityCostDisplayParts(action),
        disabled: disablePermanentActions || !legalBattlefieldActionKeys.has(`${permanent.instanceId}:${mode}`),
        onSelect: onUsePermanentAction
          ? () => onUsePermanentAction({
              type: "use_permanent_action",
              permanentId: permanent.instanceId,
              source: "ability",
              action: mode,
              abilityId: action.id,
            })
          : undefined,
      }];
    });

    const defendAction = permanent.isCreature
      ? [{
          action: "defend" as const,
          label: "Defend",
          costs: [{ type: "free" as const }],
          disabled: disablePermanentActions || !legalBattlefieldActionKeys.has(`${permanent.instanceId}:defend`),
          onSelect: onUsePermanentAction
            ? () => onUsePermanentAction({
                type: "use_permanent_action",
                permanentId: permanent.instanceId,
                source: "rules",
                action: "defend",
              })
            : undefined,
        }]
      : [];

    return [...nativeAttackAction, ...activatedActions, ...defendAction];
  }

  useEffect(() => {
    if (!openPermanentMenuId && !hoveredInspectorKey) {
      return;
    }

    function onDocumentMouseDown(event: globalThis.MouseEvent): void {
      const battleMain = battleMainRef.current;
      const target = event.target;

      if (isInspectorRelatedTarget(target)) {
        return;
      }

      if (!(target instanceof Node) || !battleMain?.contains(target)) {
        setOpenPermanentMenuId(null);
        setHoveredInspectorKey(null);
        setHoveredInspectorPosition(null);
        return;
      }

      setOpenPermanentMenuId(null);
      setHoveredInspectorKey(null);
      setHoveredInspectorPosition(null);
    }

    function onDocumentKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpenPermanentMenuId(null);
      }
    }

    document.addEventListener("mousedown", onDocumentMouseDown);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentMouseDown);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [hoveredInspectorKey, openPermanentMenuId]);

  function bindInspectorInteractions(key: string): {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave: (event: MouseEvent<HTMLElement>) => void;
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
    onClick: () => void;
  } {
    return {
      onMouseEnter: () => undefined,
      onMouseLeave: () => undefined,
      onFocus: () => undefined,
      onBlur: () => undefined,
      onClick: () => undefined,
    };
  }

  function handleDetailsClick(key: string, event: MouseEvent<HTMLElement>): void {
    event.stopPropagation();
    openInspector(key, event);
  }

  return (
    <section className="cloud-arena-battle-shell">
      <div ref={battleWindowRef} className="cloud-arena-battle-window">
        <div ref={battleMainRef} className="cloud-arena-battle-main">
          <div className="cloud-arena-battlefield-stage">
            <CloudArenaBattlefieldPanel
              zoneKeyPrefix="battlefield"
              battlefield={battle.battlefield}
              legalActions={battle.legalActions}
              motionState={motionState}
              isTargeting={isTargeting}
              hiddenPermanentIds={battlefieldAttachmentState.hiddenPermanentIds}
              getInspectableModel={getInspectableModel}
              getPermanentMenuActions={getPermanentMenuActions}
              getPermanentCounterEntries={getPermanentCounterEntries}
              bindInspectorInteractions={bindInspectorInteractions}
              onOpenDetails={handleDetailsClick}
              openPermanentMenuId={openPermanentMenuId}
              onPermanentMenuToggle={(permanentId) =>
                setOpenPermanentMenuId((current) => (current === permanentId ? null : permanentId))}
              onPermanentMenuClose={() => setOpenPermanentMenuId(null)}
              onTargetPermanentSelect={onTurnAction}
            />

            <CloudArenaBattlefieldPanel
              zoneKeyPrefix="enemy_battlefield"
              battlefield={enemyBattlefield}
              legalActions={battle.legalActions}
              motionState={motionState}
              isTargeting={isTargeting}
              enemyBattlefieldStackOrder={enemyBattlefieldStackOrder}
              raisedEnemyPermanentId={raisedEnemyPermanentId}
              enemyCurrentCardId={battle.enemy.currentCardId}
              enemyLeaderDefinitionId={battle.enemy.leaderDefinitionId}
              stackedAttachmentsByTargetId={battlefieldAttachmentState.stackedAttachmentsByTargetId}
              getInspectableModel={getInspectableModel}
              getPermanentMenuActions={() => []}
              getPermanentCounterEntries={getPermanentCounterEntries}
              bindInspectorInteractions={bindInspectorInteractions}
              onOpenDetails={handleDetailsClick}
              onTargetPermanentSelect={onTurnAction}
              onToggleEnemyBattlefieldStackOrder={toggleEnemyBattlefieldStackOrder}
            />
          </div>

          <CloudArenaHandTray
            battle={battle}
            player={battle.player}
            creatureBattlefieldSlotCount={battle.creatureBattlefieldSlotCount}
            nonCreatureBattlefieldSlotCount={battle.nonCreatureBattlefieldSlotCount}
            maxPlayerEnergy={maxPlayerEnergy}
            getInspectableModel={getInspectableModel}
            bindInspectorInteractions={bindInspectorInteractions}
            onOpenDetails={handleDetailsClick}
            isPlayableHandCard={(cardInstanceId) => playableHandCards.has(cardInstanceId)}
            groupedTurnActionsCount={groupedTurnActions.length}
            onBattleAction={onTurnAction}
            onInspectPlayer={bindInspectorInteractions("player")}
          />
        </div>

        {hoveredInspectorKey ? (
          <CloudArenaInspectorPanel
            definitionJson={hoveredInspectorDefinitionJson}
            activeTab={hoveredInspectorTab}
            cards={hoveredInspectorCards}
            showCardsTab={hoveredInspectorHasCardsTab}
            sequenceCards={hoveredInspectorSequenceCards}
            showSequenceTab={hoveredInspectorHasSequenceTab}
            onTabChange={setHoveredInspectorTab}
            position={hoveredInspectorPosition}
          />
        ) : null}
      </div>
    </section>
  );
}
