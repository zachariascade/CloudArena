import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);

export const repoRoot = path.resolve(path.dirname(currentFile), "..", "..");

export async function createTempProject(): Promise<string> {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "cloud-arena-test-"));
  await cp(path.join(repoRoot, "data"), path.join(tempRoot, "data"), {
    recursive: true,
  });
  await cp(path.join(repoRoot, "images"), path.join(tempRoot, "images"), {
    recursive: true,
  });
  return tempRoot;
}

export async function cleanupTempProject(tempRoot: string): Promise<void> {
  await rm(tempRoot, { recursive: true, force: true });
}

export async function readJson<T>(filePath: string): Promise<T> {
  const contents = await readFile(filePath, "utf8");
  return JSON.parse(contents) as T;
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
