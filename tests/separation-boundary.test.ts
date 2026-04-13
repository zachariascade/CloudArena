import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function listFilesRecursively(directoryPath: string): string[] {
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

function toWorkspaceRelativePath(absolutePath: string): string {
  return path.relative(workspaceRoot, absolutePath).split(path.sep).join("/");
}

function readWorkspaceFile(relativePath: string): string {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

describe("separation boundary guardrails", () => {
  it("keeps src/domain available as the default shared schema layer", () => {
    const files = listFilesRecursively(path.join(workspaceRoot, "src", "domain"))
      .filter((filePath) => filePath.endsWith(".ts"));

    expect(files.length).toBeGreaterThan(0);
  });

  it("keeps src/cloud-arcanum modules independent from src/cloud-arena modules", () => {
    const files = listFilesRecursively(path.join(workspaceRoot, "src", "cloud-arcanum"))
      .filter((filePath) => filePath.endsWith(".ts"));

    for (const filePath of files) {
      const relativePath = toWorkspaceRelativePath(filePath);
      const source = readWorkspaceFile(relativePath);

      expect(source, relativePath).not.toMatch(/\.\.\/cloud-arena\//);
    }
  });

  it("keeps src/cloud-arena modules independent from src/cloud-arcanum modules", () => {
    const files = listFilesRecursively(path.join(workspaceRoot, "src", "cloud-arena"))
      .filter((filePath) => filePath.endsWith(".ts"));

    for (const filePath of files) {
      const relativePath = toWorkspaceRelativePath(filePath);
      const source = readWorkspaceFile(relativePath);

      expect(source, relativePath).not.toMatch(/\.\.\/cloud-arcanum\//);
    }
  });

  it("keeps Arcanum web entrypoints on Arcanum-only lib entrypoints", () => {
    const arcanumOwnedFiles = [
      "apps/cloud-arcanum-web/src/entry/client.tsx",
      "apps/cloud-arcanum-web/src/routes/index.tsx",
      "apps/cloud-arcanum-web/src/routes/cards-page.tsx",
      "apps/cloud-arcanum-web/src/routes/card-detail-page.tsx",
      "apps/cloud-arcanum-web/src/routes/decks-page.tsx",
      "apps/cloud-arcanum-web/src/routes/sets-page.tsx",
      "apps/cloud-arcanum-web/src/routes/universes-page.tsx",
      "apps/cloud-arcanum-web/src/lib/display-card.ts",
    ];

    for (const relativePath of arcanumOwnedFiles) {
      const source = readWorkspaceFile(relativePath);

      expect(source, relativePath).not.toContain("../lib/cloud-arena-lib.js");
      expect(source, relativePath).not.toContain("../lib/index.js");
      expect(source, relativePath).not.toMatch(/src\/cloud-arena\//);
    }
  });

  it("keeps Arena web entrypoints independent from Arcanum web internals", () => {
    const arenaOwnedFiles = listFilesRecursively(path.join(workspaceRoot, "apps", "cloud-arena-web", "src"))
      .filter((filePath) => filePath.endsWith(".ts") || filePath.endsWith(".tsx"));

    for (const filePath of arenaOwnedFiles) {
      const relativePath = toWorkspaceRelativePath(filePath);
      const source = readWorkspaceFile(relativePath);

      expect(source, relativePath).not.toMatch(/cloud-arcanum-web\/src/);
      expect(source, relativePath).not.toMatch(/src\/cloud-arcanum\//);
    }
  });

  it("keeps product-owned src modules limited to domain or same-product imports", () => {
    const allowedCrossImports = [
      "../domain/",
      "../../domain/",
      "../../../domain/",
      "../../../../domain/",
    ];
    const productRoots = [
      path.join(workspaceRoot, "src", "cloud-arcanum"),
      path.join(workspaceRoot, "src", "cloud-arena"),
    ];

    for (const productRoot of productRoots) {
      const files = listFilesRecursively(productRoot).filter((filePath) => filePath.endsWith(".ts"));

      for (const filePath of files) {
        const relativePath = toWorkspaceRelativePath(filePath);
        const source = readWorkspaceFile(relativePath);
        const importLines = source
          .split("\n")
          .filter((line) => line.includes("from "));

        for (const importLine of importLines) {
          if (!importLine.includes('"../')) {
            continue;
          }

          const isAllowedDomainImport = allowedCrossImports.some((segment) => importLine.includes(segment));
          const isSameProductImport =
            relativePath.startsWith("src/cloud-arcanum/") && importLine.includes("../")
              ? !importLine.includes("../cloud-arena/") && !importLine.includes("../domain/")
              : relativePath.startsWith("src/cloud-arena/") && importLine.includes("../")
                ? !importLine.includes("../cloud-arcanum/") && !importLine.includes("../domain/")
                : false;

          expect(
            isAllowedDomainImport || isSameProductImport,
            `${relativePath}: ${importLine.trim()}`,
          ).toBe(true);
        }
      }
    }
  });

  it("keeps cloud-arcanum tests free of cloud-arena imports", () => {
    const files = listFilesRecursively(path.join(workspaceRoot, "tests", "cloud-arcanum"))
      .filter((filePath) => filePath.endsWith(".ts") || filePath.endsWith(".tsx"));

    for (const filePath of files) {
      const relativePath = toWorkspaceRelativePath(filePath);
      const source = readWorkspaceFile(relativePath);

      expect(source, relativePath).not.toMatch(/src\/cloud-arena\//);
      expect(source, relativePath).not.toMatch(/apps\/cloud-arena-/);
    }
  });

  it("keeps cloud-arena tests independent from arcanum browsing internals", () => {
    const files = listFilesRecursively(path.join(workspaceRoot, "tests", "cloud-arena"))
      .filter((filePath) => filePath.endsWith(".ts") || filePath.endsWith(".tsx"));

    for (const filePath of files) {
      const relativePath = toWorkspaceRelativePath(filePath);
      const source = readWorkspaceFile(relativePath);

      expect(source, relativePath).not.toMatch(/apps\/cloud-arcanum-web\/src/);
      expect(source, relativePath).not.toMatch(/tests\/cloud-arcanum\//);
    }
  });
});
