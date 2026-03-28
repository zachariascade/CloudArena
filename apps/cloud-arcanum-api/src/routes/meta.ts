import {
  cardColors,
  cardRarities,
  cardStatuses,
} from "../../../../src/domain/index.js";
import { cloudArcanumApiRoutes } from "../../../../src/cloud-arcanum/api-contract.js";

import type { CloudArcanumApiRouteModule } from "./index.js";

export const registerCloudArcanumApiMetaRoute: CloudArcanumApiRouteModule = async (
  app,
  context,
): Promise<void> => {
  app.get(cloudArcanumApiRoutes.metaFilters, async () => {
    const normalized = await context.services.loadNormalizedData();

    return {
      data: {
        statuses: [...cardStatuses],
        colors: [...cardColors],
        rarities: [...cardRarities],
        universes: normalized.universes
          .map((universeRecord) => ({
            id: universeRecord.data.id,
            name: universeRecord.data.name,
          }))
          .sort((left, right) => left.name.localeCompare(right.name)),
        sets: normalized.sets
          .map((setRecord) => ({
            id: setRecord.data.id,
            name: setRecord.data.name,
            code: setRecord.data.code,
            universeId: setRecord.data.universeId,
          }))
          .sort((left, right) => left.name.localeCompare(right.name)),
        decks: normalized.decks
          .map((deckRecord) => ({
            id: deckRecord.data.id,
            name: deckRecord.data.name,
          }))
          .sort((left, right) => left.name.localeCompare(right.name)),
      },
    };
  });
};
