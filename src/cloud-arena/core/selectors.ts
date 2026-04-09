import { getCardDefinitionFromLibrary } from "../cards/definitions.js";
import type {
  BattleState,
  CardDefinition,
  CardInstance,
  PermanentState,
  Selector,
  ZoneName,
} from "./types.js";

export type SelectorContext = {
  abilitySourcePermanentId?: string;
  triggerSubjectPermanentId?: string;
};

export type SelectedObject =
  | {
      kind: "card";
      zone: Exclude<ZoneName, "battlefield">;
      card: CardInstance;
      definition: CardDefinition;
      controllerId: string;
    }
  | {
      kind: "permanent";
      zone: "battlefield";
      permanent: PermanentState;
      definition: CardDefinition;
      controllerId: string;
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
          controllerId: permanent.controllerId ?? "player",
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
    return object.definition.subtypes?.includes("Equipment") ?? false;
  }

  return object.definition.type === selector.cardType;
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

function getReferencePermanentId(
  selector: Selector,
  context: SelectorContext,
): string | undefined {
  if (selector.relation !== "self" && selector.relation !== "another") {
    return undefined;
  }

  if (selector.source === "trigger_subject") {
    return context.triggerSubjectPermanentId;
  }

  return context.abilitySourcePermanentId;
}

function matchesRelation(
  object: SelectedObject,
  selector: Selector,
  context: SelectorContext,
): boolean {
  if (!selector.relation) {
    return true;
  }

  const referencePermanentId = getReferencePermanentId(selector, context);

  if (!referencePermanentId) {
    return selector.relation !== "self";
  }

  if (object.kind !== "permanent") {
    return selector.relation !== "self";
  }

  if (selector.relation === "self") {
    return object.permanent.instanceId === referencePermanentId;
  }

  return object.permanent.instanceId !== referencePermanentId;
}

export function selectObjects(
  state: BattleState,
  selector: Selector,
  context: SelectorContext = {},
): SelectedObject[] {
  const zones: ZoneName[] = selector.zone
    ? [selector.zone]
    : ["battlefield", "hand", "graveyard", "discard"];

  return zones.flatMap((zone) =>
    getSelectedObjectsInZone(state, zone).filter(
      (object) =>
        matchesController(object.controllerId, selector) &&
        matchesCardType(object, selector) &&
        matchesSubtype(object, selector) &&
        matchesRelation(object, selector, context),
    ),
  );
}

export function selectPermanents(
  state: BattleState,
  selector: Selector = {},
  context: SelectorContext = {},
): PermanentState[] {
  const battlefieldSelector: Selector = {
    ...selector,
    zone: "battlefield",
  };

  return selectObjects(state, battlefieldSelector, context).flatMap((object) =>
    object.kind === "permanent" ? [object.permanent] : [],
  );
}

export function findPermanentById(
  state: BattleState,
  permanentId: string,
): PermanentState | null {
  return state.battlefield.find((permanent) => permanent?.instanceId === permanentId) ?? null;
}

export function hasOpenBattlefieldSlot(state: BattleState): boolean {
  return state.battlefield.some((slot) => slot === null);
}
