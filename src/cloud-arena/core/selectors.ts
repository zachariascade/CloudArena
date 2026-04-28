import {
  asPermanentCardDefinition,
  getCardDefinitionFromLibrary,
  hasCardType,
  isEquipmentCardDefinition,
  isPermanentCardDefinition,
} from "../cards/definitions.js";
import type {
  BattleState,
  CardDefinition,
  CardInstance,
  PendingHandCardContext,
  PermanentState,
  Selector,
  ZoneName,
} from "./types.js";

export type SelectorContext = {
  abilitySourcePermanentId?: string;
  abilitySourceCardInstanceId?: string;
  triggerSubjectPermanentId?: string;
  triggerSubjectCardInstanceId?: string;
  sourceCardInstanceId?: string;
  attackBypassesBlock?: boolean;
  chosenTargetPermanentId?: string;
  chosenTargetCardInstanceId?: string;
  pendingCardPlay?: PendingHandCardContext;
  pendingCardPreview?: PendingHandCardContext;
};

export type SelectedObject =
  | {
      kind: "card";
      zone: Exclude<ZoneName, "battlefield">;
      card: CardInstance;
      definition: CardDefinition;
      controllerId: "player";
    }
  | {
      kind: "permanent";
      zone: "battlefield" | "enemy_battlefield";
      permanent: PermanentState;
      definition: CardDefinition;
      controllerId: "player" | "enemy";
    };

function getPlayerCardsInZone(
  state: BattleState,
  zone: Exclude<ZoneName, "battlefield">,
): CardInstance[] {
  switch (zone) {
    case "hand":
      return state.player.hand;
    case "graveyard":
      return state.player.graveyard;
    case "discard":
      return state.player.discardPile;
  }

  throw new Error(`Unsupported zone: ${zone}`);
}

function getSelectedObjectsInZone(
  state: BattleState,
  zone: ZoneName,
): SelectedObject[] {
  if (zone === "battlefield") {
    return state.battlefield.flatMap((permanent) => {
      if (!permanent) {
        return [];
      }

      return [
        {
          kind: "permanent" as const,
          zone,
          permanent,
          definition: getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId),
          controllerId: (permanent.controllerId ?? "player") as "player" | "enemy",
        },
      ];
    });
  }

  if (zone === "enemy_battlefield") {
    return state.enemyBattlefield.flatMap((permanent) => {
      if (!permanent) {
        return [];
      }

      return [
        {
          kind: "permanent" as const,
          zone,
          permanent,
          definition: getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId),
          controllerId: (permanent.controllerId ?? "enemy") as "player" | "enemy",
        },
      ];
    });
  }

  return getPlayerCardsInZone(state, zone).map((card) => ({
    kind: "card" as const,
    zone,
    card,
    definition: getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId),
    controllerId: "player",
  }));
}

function matchesController(
  controllerId: string,
  selector: Selector,
): boolean {
  switch (selector.controller) {
    case undefined:
    case "any":
      return true;
    case "you":
      return controllerId === "player";
    case "opponent":
      return controllerId !== "player";
  }
}

function matchesCardType(
  object: SelectedObject,
  selector: Selector,
): boolean {
  if (!selector.cardType) {
    return true;
  }

  if (selector.cardType === "equipment") {
    return isEquipmentCardDefinition(object.definition);
  }

  if (selector.cardType === "permanent") {
    return isPermanentCardDefinition(object.definition);
  }

  return hasCardType(object.definition, selector.cardType);
}

function matchesSubtype(
  object: SelectedObject,
  selector: Selector,
): boolean {
  if (!selector.subtype) {
    return true;
  }

  return object.definition.subtypes?.includes(selector.subtype) ?? false;
}

function getReferenceObjectId(
  selector: Selector,
  context: SelectorContext,
  object: SelectedObject,
): string | undefined {
  if (selector.relation !== "self" && selector.relation !== "another") {
    return undefined;
  }

  const sourceId =
    selector.source === "trigger_subject"
      ? object.kind === "card"
        ? context.triggerSubjectCardInstanceId
        : context.triggerSubjectPermanentId
      : object.kind === "card"
        ? context.abilitySourceCardInstanceId ?? context.abilitySourcePermanentId
        : context.abilitySourcePermanentId;

  return sourceId;
}

function matchesRelation(
  object: SelectedObject,
  selector: Selector,
  context: SelectorContext,
): boolean {
  if (!selector.relation) {
    return true;
  }

  const referenceObjectId = getReferenceObjectId(selector, context, object);

  if (!referenceObjectId) {
    return selector.relation !== "self";
  }

  const objectId = object.kind === "card" ? object.card.instanceId : object.permanent.instanceId;

  if (selector.relation === "self") {
    return objectId === referenceObjectId;
  }

  return objectId !== referenceObjectId;
}

export function matchesSelectorObject(
  object: SelectedObject,
  selector: Selector,
  context: SelectorContext = {},
): boolean {
  if (selector.zone && selector.zone !== object.zone) {
    return false;
  }

  return (
    matchesController(object.controllerId, selector) &&
    matchesCardType(object, selector) &&
    matchesSubtype(object, selector) &&
    matchesRelation(object, selector, context)
  );
}

export function selectObjects(
  state: BattleState,
  selector: Selector,
  context: SelectorContext = {},
): SelectedObject[] {
  if (selector.zone === "battlefield" && selector.controller === "any") {
    return [
      ...selectObjects(state, { ...selector, controller: "you" }, context),
      ...selectObjects(state, {
        ...selector,
        zone: "enemy_battlefield",
        controller: "opponent",
      }, context),
    ];
  }

  const zones: ZoneName[] = selector.zone
    ? [selector.zone]
    : ["battlefield", "enemy_battlefield", "hand", "graveyard", "discard"];

  return zones.flatMap((zone) =>
    getSelectedObjectsInZone(state, zone).filter((object) => matchesSelectorObject(object, selector, context)),
  );
}

export function selectPermanents(
  state: BattleState,
  selector: Selector = {},
  context: SelectorContext = {},
): PermanentState[] {
  const battlefieldSelector: Selector = {
    ...selector,
    zone: selector.zone ?? "battlefield",
  };

  const selectedObjects =
    battlefieldSelector.zone === "battlefield" && battlefieldSelector.controller === "any"
      ? [
          ...selectObjects(state, battlefieldSelector, context),
          ...selectObjects(
            state,
            {
              ...battlefieldSelector,
              zone: "enemy_battlefield",
            },
            context,
          ),
        ]
      : selectObjects(state, battlefieldSelector, context);

  return selectedObjects.flatMap((object) =>
    object.kind === "permanent" ? [object.permanent] : [],
  );
}

export function findPermanentById(
  state: BattleState,
  permanentId: string,
): PermanentState | null {
  return (
    state.battlefield.find((permanent) => permanent?.instanceId === permanentId) ??
    state.enemyBattlefield.find((permanent) => permanent?.instanceId === permanentId) ??
    null
  );
}

export function hasOpenBattlefieldSlot(state: BattleState): boolean {
  return (
    state.battlefield
      .slice(0, state.playerCreatureSlotCount)
      .some((slot) => slot === null) ||
    state.battlefield
      .slice(state.playerCreatureSlotCount, state.playerCreatureSlotCount + state.playerNonCreatureSlotCount)
      .some((slot) => slot === null)
  );
}

export function hasOpenBattlefieldSlotForCardDefinition(
  state: BattleState,
  definition: CardDefinition,
): boolean {
  const permanentDefinition = asPermanentCardDefinition(definition);

  if (hasCardType(permanentDefinition, "creature")) {
    return state.battlefield
      .slice(0, state.playerCreatureSlotCount)
      .some((slot) => slot === null);
  }

  return state.battlefield
    .slice(state.playerCreatureSlotCount, state.playerCreatureSlotCount + state.playerNonCreatureSlotCount)
    .some((slot) => slot === null);
}
