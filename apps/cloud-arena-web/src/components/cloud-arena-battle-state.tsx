import type { FocusEvent, MouseEvent, ReactElement, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { CloudArenaBattleViewModel } from "../lib/cloud-arena-battle-view-model.js";
import { CloudArenaBattlefieldPanel } from "./cloud-arena-battlefield-panel.js";
import { CloudArenaHandTray } from "./cloud-arena-hand-tray.js";
import { CloudArenaHudBand } from "./cloud-arena-hud-band.js";
import { CloudArenaInspectorPanel } from "./cloud-arena-inspector-panel.js";
import {
  mapArenaEnemyToDisplayCard,
  mapArenaHandCardToDisplayCard,
  mapArenaPermanentToDisplayCard,
  mapArenaPlayerToDisplayCard,
} from "../lib/cloud-arena-display-card.js";
import { cardDefinitions } from "../../../../src/cloud-arena/index.js";
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
  playablePermanentActions?: Array<{
    permanentId: string;
    action: ActivatedAbilityActionId | RulesActionId;
  }>;
  playableHandCardInstanceIds?: string[];
  turnActions?: Array<{
    action: BattleAction;
    label: string;
  }>;
  sidePanel?: ReactNode;
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
  playablePermanentActions = [],
  playableHandCardInstanceIds = [],
  turnActions = [],
  sidePanel,
}: CloudArenaBattleStateProps): ReactElement {
  const battleWindowRef = useRef<HTMLDivElement | null>(null);
  const battleMainRef = useRef<HTMLDivElement | null>(null);
  const playableHandCards = new Set(playableHandCardInstanceIds);
  const playablePermanentActionKeys = new Set(
    playablePermanentActions.map(
      (entry) => `${entry.permanentId}:${entry.action}`,
    ),
  );
  const playerCard = mapArenaPlayerToDisplayCard(battle.player);
  const enemyCard = mapArenaEnemyToDisplayCard(battle.enemy);
  const [hoveredInspectorKey, setHoveredInspectorKey] = useState<string | null>(null);
  const [hoveredInspectorPosition, setHoveredInspectorPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [openPermanentMenuId, setOpenPermanentMenuId] = useState<string | null>(null);
  const groupedTurnActions = turnActions.length > 0
    ? turnActions
    : battle.actionGroups.turn.map((entry) => ({
        action: entry.action,
        label: entry.label,
      }));

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
    action: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>["actions"][number],
  ): string {
    if (action.kind === "activated") {
      if (action.activation.actionId === "attack") {
        return "Attack";
      }

      if (action.activation.actionId === "apply_block") {
        return "Apply Block";
      }

      if (action.activation.actionId === "equip") {
        return "Equip";
      }

      return action.activation.actionId.replace(/_/g, " ");
    }

    return "Action";
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
      });

      models.set(
        `battlefield:${slot.instanceId}`,
        battlefieldCardModel,
      );
    }

    return models;
  }, [
    battle.battlefield,
    battle.player.hand,
    disableHandCardActions,
    disablePermanentActions,
    enemyCard,
    onPlayHandCard,
    onUsePermanentAction,
    playableHandCards,
    playablePermanentActionKeys,
    playerCard,
  ]);

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
    disabled?: boolean;
    onSelect?: () => void;
  }> {
    const nativeAttackAction = permanent.isCreature && playablePermanentActionKeys.has(`${permanent.instanceId}:attack`)
      ? [{
          action: "attack" as const,
          label: `Attack ${permanent.power}`,
          disabled: disablePermanentActions,
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
      const isPlayable = playablePermanentActionKeys.has(`${permanent.instanceId}:${mode}`);

      if (!isPlayable) {
        return [];
      }

      return [{
        action: mode,
        label: getPermanentActionLabel(action),
        disabled: disablePermanentActions,
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

    const defendAction = playablePermanentActionKeys.has(`${permanent.instanceId}:defend`)
      ? [{
          action: "defend" as const,
          label: "Defend",
          disabled: disablePermanentActions,
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
          <div className="cloud-arena-battle-command-row">
            <div className="cloud-arena-battle-meta">
              <span className="summary-pill">
                Hand actions <strong>{battle.actionGroups.hand.length}</strong>
              </span>
              <span className="summary-pill">
                Battlefield actions <strong>{battle.actionGroups.battlefield.length}</strong>
              </span>
              <span className="summary-pill">
                Turn <strong>{battle.turnNumber}</strong>
              </span>
              <span className="summary-pill">
                Phase <strong>{battle.phase}</strong>
              </span>
            </div>
            {groupedTurnActions.length > 0 ? (
              <div className="trace-viewer-battle-actions">
                {groupedTurnActions.map((entry, index) => (
                  <button
                    key={`${entry.label}-${index}`}
                    type="button"
                    className="primary-button trace-viewer-battle-action-button"
                    disabled={disableTurnActions}
                    onClick={() => onTurnAction?.(entry.action)}
                  >
                    {entry.action.type === "end_turn" ? `${entry.label} (E)` : entry.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <CloudArenaHudBand
            enemy={battle.enemy}
            player={{
              health: battle.player.health,
              maxHealth: battle.player.maxHealth,
              block: battle.player.block,
              energy: battle.player.energy,
              handCount: battle.player.hand.length,
              drawPileCount: battle.player.drawPileCount,
            }}
            maxPlayerEnergy={maxPlayerEnergy}
            onInspectEnemy={bindInspectorInteractions("enemy")}
            onInspectPlayer={bindInspectorInteractions("player")}
          />

          <CloudArenaBattlefieldPanel
            battlefield={battle.battlefield}
            legalActions={battle.legalActions}
            getInspectableModel={getInspectableModel}
            getPermanentMenuActions={getPermanentMenuActions}
            getPermanentCounterEntries={getPermanentCounterEntries}
            bindInspectorInteractions={bindInspectorInteractions}
            onOpenDetails={handleDetailsClick}
            openPermanentMenuId={openPermanentMenuId}
            onPermanentMenuToggle={(permanentId) =>
              setOpenPermanentMenuId((current) => current === permanentId ? null : permanentId)}
            onPermanentMenuClose={() => setOpenPermanentMenuId(null)}
            onTargetPermanentSelect={onTurnAction}
          />

          <CloudArenaHandTray
            battle={battle}
            getInspectableModel={getInspectableModel}
            bindInspectorInteractions={bindInspectorInteractions}
            onOpenDetails={handleDetailsClick}
            isPlayableHandCard={(cardInstanceId) => playableHandCards.has(cardInstanceId)}
            groupedTurnActionsCount={groupedTurnActions.length}
          />
        </div>

        {hoveredInspectorKey ? (
          <CloudArenaInspectorPanel
            definitionJson={hoveredInspectorDefinitionJson}
            position={hoveredInspectorPosition}
          />
        ) : null}
        {sidePanel ? (
          <div className="panel trace-viewer-panel cloud-arena-battle-sidepanel">
            {sidePanel}
          </div>
        ) : null}
      </div>
    </section>
  );
}
