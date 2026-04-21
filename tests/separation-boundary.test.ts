import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function listFilesRecursively(directoryPath: string): string[] {
  if (!existsSync(directoryPath)) {
    return [];
  }

  const entries = readdirSync(directoryPath);
  const files: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(directoryPath, entry);
    const entryStat = statSync(absolutePath);

    if (entryStat.isDirectory()) {
      files.push(...listFilesRecursively(absolutePath));
      continue;
    }

    files.push(absolutePath);
  }

  return files;
}

describe("separation boundary guardrails", () => {
  it("keeps src/domain available as the default shared schema layer", () => {
    const files = listFilesRecursively(path.join(workspaceRoot, "src", "domain")).filter((filePath) =>
      filePath.endsWith(".ts"),
    );

    expect(files.length).toBeGreaterThan(0);
  });

  it("does not keep legacy Cloud Arcanum source trees in the active workspace", () => {
    const removedPaths = [
      "apps/cloud-arcanum-api",
      "apps/cloud-arcanum-web",
      "src/cloud-arcanum",
      "src/biblical",
      "tests/cloud-arcanum",
      "docs/arcanum",
      "scripts/build-web-client.ts",
      "scripts/benchmark-api.ts",
      "scripts/export-card-concepts.ts",
      "scripts/export-exodus-card-concepts.ts",
      "scripts/export-genesis-concepts.ts",
      "scripts/export-gospels-concepts.ts",
      "scripts/ingest-kjv-exodus.ts",
      "scripts/ingest-kjv-genesis.ts",
      "scripts/ingest-kjv-gospels.ts",
    ];

    for (const relativePath of removedPaths) {
      expect(existsSync(path.join(workspaceRoot, relativePath)), relativePath).toBe(false);
    }
  });
});
