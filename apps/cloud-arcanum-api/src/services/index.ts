import type {
  CountsByStatus,
  EntityValidationResponse,
  ValidationMessage,
  ValidationSummaryResponse,
} from "../../../../src/cloud-arcanum/api-contract.js";
import { validateProject } from "../../../../scripts/validate.js";
import type {
  Card,
  CardStatus,
  Deck,
  SetRecord,
  Universe,
} from "../../../../src/domain/index.js";
import { cardStatuses } from "../../../../src/domain/index.js";
import { CLOUD_ARCANUM_API_NAME } from "../constants.js";
import type {
  CloudArcanumApiDataSnapshot,
  CloudArcanumApiLoaders,
  LoadedEntityRecord,
} from "../loaders/index.js";
import {
  createCloudArenaSessionService,
  type CloudArenaSessionService,
} from "./cloud-arena-sessions.js";

export type CardDeckMembership = {
  deck: NormalizedDeckRecord;
  quantity: number;
};

export type NormalizedCardRecord = LoadedEntityRecord<Card> & {
  decks: CardDeckMembership[];
  set: NormalizedSetRecord | null;
  universe: NormalizedUniverseRecord | null;
};

export type NormalizedSetRecord = LoadedEntityRecord<SetRecord> & {
  cards: NormalizedCardRecord[];
  countsByStatus: CountsByStatus;
  universe: NormalizedUniverseRecord | null;
};

export type NormalizedUniverseRecord = LoadedEntityRecord<Universe> & {
  cards: NormalizedCardRecord[];
  countsByStatus: CountsByStatus;
  decks: NormalizedDeckRecord[];
  sets: NormalizedSetRecord[];
};

export type NormalizedDeckCardRecord = {
  card: NormalizedCardRecord | null;
  quantity: number;
};

export type NormalizedDeckRecord = LoadedEntityRecord<Deck> & {
  byStatus: CountsByStatus;
  cards: NormalizedDeckCardRecord[];
  commander: NormalizedCardRecord | null;
  sets: NormalizedSetRecord[];
  totalCards: number;
  uniqueCards: number;
  universe: NormalizedUniverseRecord | null;
};

export type CloudArcanumNormalizedData = {
  issues: ValidationMessage[];
  snapshot: CloudArcanumApiDataSnapshot;
  cards: NormalizedCardRecord[];
  decks: NormalizedDeckRecord[];
  sets: NormalizedSetRecord[];
  universes: NormalizedUniverseRecord[];
  validationErrorsByFile: Map<string, ValidationMessage[]>;
  indexes: {
    cardsById: Map<string, NormalizedCardRecord>;
    decksById: Map<string, NormalizedDeckRecord>;
    setsById: Map<string, NormalizedSetRecord>;
    universesById: Map<string, NormalizedUniverseRecord>;
  };
};

export type CloudArcanumApiServices = {
  app: {
    name: string;
  };
  cloudArenaSessions: CloudArenaSessionService;
  loaders: CloudArcanumApiLoaders;
  loadNormalizedData: () => Promise<CloudArcanumNormalizedData>;
  loadValidationSummary: () => Promise<ValidationSummaryResponse>;
  loadEntityValidation: (entityId: string) => Promise<EntityValidationResponse | null>;
};

export type CloudArcanumApiServiceOptions = {
  normalizedDataCacheTtlMs?: number;
  validationCacheTtlMs?: number;
  validator?: (rootDir: string) => Promise<ValidationSummaryResponse>;
};

function createEmptyCountsByStatus(): CountsByStatus {
  const counts: CountsByStatus = {};

  for (const status of cardStatuses) {
    counts[status] = 0;
  }

  return counts;
}

function incrementStatusCount(
  counts: CountsByStatus,
  status: CardStatus,
  quantity = 1,
): void {
  counts[status] = (counts[status] ?? 0) + quantity;
}

function buildMissingReferenceIssue(
  file: string,
  message: string,
): ValidationMessage {
  return { file, message };
}

function buildValidationErrorsByFile(
  validation: ValidationSummaryResponse,
): Map<string, ValidationMessage[]> {
  const errorsByFile = new Map<string, ValidationMessage[]>();

  for (const error of validation.errors) {
    const key = error.file ?? "";
    const existing = errorsByFile.get(key);

    if (existing) {
      existing.push(error);
      continue;
    }

    errorsByFile.set(key, [error]);
  }

  return errorsByFile;
}

export function normalizeCloudArcanumData(
  snapshot: CloudArcanumApiDataSnapshot,
): CloudArcanumNormalizedData {
  const issues: ValidationMessage[] = [...snapshot.issues];

  const universes = snapshot.universes.map<NormalizedUniverseRecord>((record) => ({
    ...record,
    cards: [],
    countsByStatus: createEmptyCountsByStatus(),
    decks: [],
    sets: [],
  }));
  const sets = snapshot.sets.map<NormalizedSetRecord>((record) => ({
    ...record,
    cards: [],
    countsByStatus: createEmptyCountsByStatus(),
    universe: null,
  }));
  const cards = snapshot.cards.map<NormalizedCardRecord>((record) => ({
    ...record,
    decks: [],
    set: null,
    universe: null,
  }));
  const decks = snapshot.decks.map<NormalizedDeckRecord>((record) => ({
    ...record,
    byStatus: createEmptyCountsByStatus(),
    cards: [],
    commander: null,
    sets: [],
    totalCards: 0,
    uniqueCards: 0,
    universe: null,
  }));

  const universesById = new Map(universes.map((record) => [record.data.id, record]));
  const setsById = new Map(sets.map((record) => [record.data.id, record]));
  const cardsById = new Map(cards.map((record) => [record.data.id, record]));
  const decksById = new Map(decks.map((record) => [record.data.id, record]));

  for (const setRecord of sets) {
    const universeRecord = universesById.get(setRecord.data.universeId) ?? null;
    setRecord.universe = universeRecord;

    if (universeRecord) {
      universeRecord.sets.push(setRecord);
    } else {
      issues.push(
        buildMissingReferenceIssue(
          setRecord.relativeFilePath,
          `Unknown universeId "${setRecord.data.universeId}".`,
        ),
      );
    }
  }

  for (const cardRecord of cards) {
    const setRecord = setsById.get(cardRecord.data.setId) ?? null;
    cardRecord.set = setRecord;
    cardRecord.universe = setRecord?.universe ?? null;

    if (setRecord) {
      setRecord.cards.push(cardRecord);
      incrementStatusCount(setRecord.countsByStatus, cardRecord.data.status);
    } else {
      issues.push(
        buildMissingReferenceIssue(
          cardRecord.relativeFilePath,
          `Unknown setId "${cardRecord.data.setId}".`,
        ),
      );
    }

    if (cardRecord.universe) {
      cardRecord.universe.cards.push(cardRecord);
      incrementStatusCount(cardRecord.universe.countsByStatus, cardRecord.data.status);
    }
  }

  for (const deckRecord of decks) {
    const universeRecord = universesById.get(deckRecord.data.universeId) ?? null;
    deckRecord.universe = universeRecord;

    if (universeRecord) {
      universeRecord.decks.push(deckRecord);
    } else {
      issues.push(
        buildMissingReferenceIssue(
          deckRecord.relativeFilePath,
          `Unknown universeId "${deckRecord.data.universeId}".`,
        ),
      );
    }

    deckRecord.sets = deckRecord.data.setIds.flatMap((setId) => {
      const setRecord = setsById.get(setId) ?? null;

      if (!setRecord) {
        issues.push(
          buildMissingReferenceIssue(
            deckRecord.relativeFilePath,
            `Unknown setId "${setId}" in deck setIds.`,
          ),
        );
        return [];
      }

      return [setRecord];
    });

    deckRecord.commander =
      (deckRecord.data.commander && cardsById.get(deckRecord.data.commander)) ?? null;

    if (deckRecord.data.commander && !deckRecord.commander) {
      issues.push(
        buildMissingReferenceIssue(
          deckRecord.relativeFilePath,
          `Unknown commander cardId "${deckRecord.data.commander}".`,
        ),
      );
    }

    deckRecord.cards = deckRecord.data.cards.map(({ cardId, quantity }) => {
      const cardRecord = cardsById.get(cardId) ?? null;

      if (!cardRecord) {
        issues.push(
          buildMissingReferenceIssue(
            deckRecord.relativeFilePath,
            `Unknown deck cardId "${cardId}".`,
          ),
        );
      } else {
        cardRecord.decks.push({
          deck: deckRecord,
          quantity,
        });
        incrementStatusCount(deckRecord.byStatus, cardRecord.data.status, quantity);
      }

      deckRecord.totalCards += quantity;

      return {
        card: cardRecord,
        quantity,
      };
    });

    deckRecord.uniqueCards = deckRecord.cards.filter(({ card }) => card !== null).length;
  }

  return {
    issues,
    snapshot,
    cards,
    decks,
    sets,
    universes,
    validationErrorsByFile: new Map(),
    indexes: {
      cardsById,
      decksById,
      setsById,
      universesById,
    },
  };
}

export function createCloudArcanumApiServices(
  loaders: CloudArcanumApiLoaders,
  options: CloudArcanumApiServiceOptions = {},
): CloudArcanumApiServices {
  const cloudArenaSessions = createCloudArenaSessionService();
  const validator = options.validator ?? validateProject;
  const normalizedDataCacheTtlMs = options.normalizedDataCacheTtlMs ?? 5_000;
  const validationCacheTtlMs = options.validationCacheTtlMs ?? 5_000;
  let normalizedDataCache:
    | {
        dataFingerprint: string;
        expiresAt: number;
        result: CloudArcanumNormalizedData;
      }
    | null = null;
  let validationCache:
    | {
        expiresAt: number;
        result: ValidationSummaryResponse;
      }
    | null = null;

  const loadValidationSummary = async (): Promise<ValidationSummaryResponse> => {
    const now = Date.now();

    if (validationCache && validationCache.expiresAt > now) {
      return validationCache.result;
    }

    const result = await validator(loaders.paths.workspaceRoot);
    validationCache = {
      expiresAt: now + validationCacheTtlMs,
      result,
    };

    return result;
  };

  const loadNormalizedData = async (): Promise<CloudArcanumNormalizedData> => {
    const now = Date.now();
    const dataFingerprint = await loaders.loadDataFingerprint();

    if (
      normalizedDataCache &&
      normalizedDataCache.expiresAt > now &&
      normalizedDataCache.dataFingerprint === dataFingerprint
    ) {
      return normalizedDataCache.result;
    }

    const snapshot = await loaders.loadSnapshot();
    const validation = await loadValidationSummary();
    const normalized = normalizeCloudArcanumData(snapshot);
    normalized.validationErrorsByFile = buildValidationErrorsByFile(validation);
    normalizedDataCache = {
      dataFingerprint,
      expiresAt: now + normalizedDataCacheTtlMs,
      result: normalized,
    };

    return normalized;
  };

  return {
    app: {
      name: CLOUD_ARCANUM_API_NAME,
    },
    cloudArenaSessions,
    loaders,
    loadNormalizedData,
    loadValidationSummary,
    loadEntityValidation: async (
      entityId: string,
    ): Promise<EntityValidationResponse | null> => {
      const [normalized, validation] = await Promise.all([
        loadNormalizedData(),
        loadValidationSummary(),
      ]);

      const record =
        normalized.indexes.cardsById.get(entityId) ??
        normalized.indexes.decksById.get(entityId) ??
        normalized.indexes.setsById.get(entityId) ??
        normalized.indexes.universesById.get(entityId);

      if (!record) {
        return null;
      }

      return {
        entityId,
        hasErrors: (validation.errors.filter((error) => error.file === record.relativeFilePath))
          .length > 0,
        errors: validation.errors.filter((error) => error.file === record.relativeFilePath),
      };
    },
  };
}
