import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { createCloudArcanumApiLoaders } from "../apps/cloud-arcanum-api/src/loaders/index.js";
import { createCloudArcanumApiServices } from "../apps/cloud-arcanum-api/src/services/index.js";
import {
  cleanupTempProject,
  createTempProject,
  readJson,
  writeJson,
} from "./helpers.js";

const tempProjects: string[] = [];

afterEach(async () => {
  vi.useRealTimers();
  await Promise.all(tempProjects.splice(0).map(cleanupTempProject));
});

describe("cloud arcanum validation integration", () => {
  it("reuses cached validation output within the ttl window", async () => {
    const tempRoot = await createTempProject();
    tempProjects.push(tempRoot);

    const validator = vi.fn(async () => ({
      counts: {
        universes: 1,
        sets: 1,
        cards: 2,
        decks: 1,
        totalFiles: 5,
      },
      errors: [],
    }));

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-27T22:30:00-05:00"));

    const services = createCloudArcanumApiServices(
      createCloudArcanumApiLoaders({ workspaceRoot: tempRoot }),
      {
        validationCacheTtlMs: 5_000,
        validator,
      },
    );

    await services.loadValidationSummary();
    await services.loadValidationSummary();

    expect(validator).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(5_001);

    await services.loadValidationSummary();

    expect(validator).toHaveBeenCalledTimes(2);
  });

  it("maps entity-level validation by canonical file path", async () => {
    const tempRoot = await createTempProject();
    tempProjects.push(tempRoot);

    const cardPath = path.join(
      tempRoot,
      "data/cards/card_0001_abraham_father_of_nations.json",
    );
    const cardRecord = await readJson<Record<string, unknown>>(cardPath);
    cardRecord.setId = "set_missing";
    await writeJson(cardPath, cardRecord);

    const services = createCloudArcanumApiServices(
      createCloudArcanumApiLoaders({ workspaceRoot: tempRoot }),
    );

    const normalized = await services.loadNormalizedData();
    const entityValidation = await services.loadEntityValidation("card_0001");

    expect(normalized.validationErrorsByFile.get("data/cards/card_0001_abraham_father_of_nations.json")?.length).toBeGreaterThan(0);
    expect(entityValidation).not.toBeNull();
    expect(entityValidation?.entityId).toBe("card_0001");
    expect(entityValidation?.hasErrors).toBe(true);
    expect(entityValidation?.errors.some((error) => error.message.includes("Unknown setId"))).toBe(true);
  });
});
