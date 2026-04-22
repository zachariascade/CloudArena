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
  cardDefinitions,
  getAbilityCostDisplayParts,
} from "../../../../src/cloud-arena/index.js";
import {
  mapArenaEnemyToDisplayCard,
  mapArenaHandCardToDisplayCard,
  mapArenaPermanentToDisplayCard,
  mapArenaPlayerToDisplayCard,
} from "../lib/display-card.js";
import { buildBattlefieldAttachmentState } from "../lib/cloud-arena-battle-attachments.js";
import type {
  BattleAction,
  ActivatedAbilityActionId,
  RulesActionId,
} from "../../../../src/cloud-arena/index.js";

type CloudArenaBattleStateProps = {
  battle: CloudArenaBattleViewModel;
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

export function CloudArenaBattleState({
  battle,
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
  const [isPlayerHealthDropping, setIsPlayerHealthDropping] = useState(false);
  const [healthFlashDirections, setHealthFlashDirections] = useState<Record<string, "increase" | "decrease">>({});
  const playableHandCards = new Set(playableHandCardInstanceIds);
  const enemyBattlefield = battle.enemyBattlefield ?? Array.from({ length: battle.battlefield.length }, () => null);
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

    return () => undefined;
  }, [battle]);

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
  }, []);

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

    const defendAction = true
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
            stackedAttachmentsByTargetId={battlefieldAttachmentState.stackedAttachmentsByTargetId}
            getInspectableModel={getInspectableModel}
            getPermanentMenuActions={() => []}
            getPermanentCounterEntries={getPermanentCounterEntries}
            bindInspectorInteractions={bindInspectorInteractions}
              onOpenDetails={handleDetailsClick}
              onTargetPermanentSelect={onTurnAction}
            />
          </div>

          <CloudArenaHandTray
            battle={battle}
            player={battle.player}
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
            position={hoveredInspectorPosition}
          />
        ) : null}
      </div>
    </section>
  );
}
