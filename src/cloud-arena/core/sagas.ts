import {
  asPermanentCardDefinition,
  getCardDefinitionFromLibrary,
} from "../cards/definitions.js";
import { getPermanentNamedCounterAmount } from "./counters.js";
import { resolveEffect } from "./effects.js";
import { sacrificePermanent } from "./permanents.js";
import type {
  BattleState,
  Condition,
  Effect,
  PermanentState,
  SagaDefinition,
} from "./types.js";

const DEFAULT_LORE_COUNTER = "lore";

function getSagaDefinition(
  state: BattleState,
  permanent: PermanentState,
): SagaDefinition | null {
  const definition = asPermanentCardDefinition(
    getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId),
  );

  return definition.saga ?? null;
}

function getFinalSagaChapter(saga: SagaDefinition): number {
  return saga.sacrificeAfterChapter ?? Math.max(...saga.chapters.map((chapter) => chapter.chapter));
}

function addLoreCounter(
  state: BattleState,
  permanent: PermanentState,
  saga: SagaDefinition,
): number {
  const loreCounter = saga.loreCounter ?? DEFAULT_LORE_COUNTER;

  resolveEffect(state, {
    type: "add_counter",
    target: "self",
    counter: loreCounter,
    amount: { type: "constant", value: 1 },
  }, {
    abilitySourcePermanentId: permanent.instanceId,
  });

  return getPermanentNamedCounterAmount(permanent, loreCounter);
}

function maybeSacrificeCompletedSagaAfterLoreIncrease(
  state: BattleState,
  permanent: PermanentState,
  saga: SagaDefinition,
  loreCount: number,
): void {
  const finalChapter = getFinalSagaChapter(saga);
  const resolvedChapters = new Set(permanent.sagaState?.resolvedChapters ?? []);

  if (loreCount > finalChapter && resolvedChapters.has(finalChapter)) {
    sacrificePermanent(state, permanent.instanceId);
  }
}

function advanceSaga(
  state: BattleState,
  permanent: PermanentState,
  saga: SagaDefinition,
): void {
  const loreCount = addLoreCounter(state, permanent, saga);
  maybeSacrificeCompletedSagaAfterLoreIncrease(state, permanent, saga, loreCount);
}

function createSagaChapterCondition(
  saga: SagaDefinition,
  chapterNumber: number,
): Condition {
  return {
    type: "compare",
    left: {
      type: "counter_count",
      target: "self",
      counter: saga.loreCounter ?? DEFAULT_LORE_COUNTER,
    },
    op: "==",
    right: {
      type: "constant",
      value: chapterNumber,
    },
  };
}

export function createSagaChapterAbilities(saga: SagaDefinition): Array<{
  id: string;
  kind: "activated";
  activation: {
    type: "action";
    actionId: string;
  };
  conditions: Condition[];
  effects: Effect[];
}> {
  return saga.chapters.map((chapter) => ({
    id: `saga_chapter_${chapter.chapter}`,
    kind: "activated",
    activation: {
      type: "action",
      actionId: `saga_chapter_${chapter.chapter}`,
    },
    conditions: [createSagaChapterCondition(saga, chapter.chapter)],
    effects: chapter.effects,
  }));
}

export function getSagaChapterNumberFromAbilityId(abilityId: string | undefined): number | null {
  const match = abilityId?.match(/^saga_chapter_(\d+)$/);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

export function markSagaChapterActivated(
  permanent: PermanentState,
  abilityId: string | undefined,
): void {
  const chapterNumber = getSagaChapterNumberFromAbilityId(abilityId);

  if (chapterNumber === null || !abilityId) {
    return;
  }

  const resolvedChapters = new Set(permanent.sagaState?.resolvedChapters ?? []);
  resolvedChapters.add(chapterNumber);
  permanent.sagaState = {
    resolvedChapters: [...resolvedChapters].sort((left, right) => left - right),
  };
  permanent.disabledAbilityIds = [
    ...(permanent.disabledAbilityIds ?? []),
    abilityId,
  ].filter((id, index, ids) => ids.indexOf(id) === index);
}

export function processSagaPermanentEntered(
  state: BattleState,
  permanent: PermanentState,
): void {
  const saga = getSagaDefinition(state, permanent);

  if (!saga) {
    return;
  }

  permanent.sagaState = permanent.sagaState ?? { resolvedChapters: [] };
  advanceSaga(state, permanent, saga);
}

export function processSagasAtPlayerTurnStart(state: BattleState): void {
  for (const permanent of [...state.battlefield]) {
    if (!permanent || permanent.controllerId === "enemy") {
      continue;
    }

    const saga = getSagaDefinition(state, permanent);

    if (!saga) {
      continue;
    }

    advanceSaga(state, permanent, saga);
  }
}
