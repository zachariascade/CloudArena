import { execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const projectRoot = path.resolve(currentDirectory, "../..");
const entryFile = path.resolve(
  projectRoot,
  "apps/cloud-arcanum-web/src/entry/client.tsx",
);
const outputDirectory = path.resolve(projectRoot, "dist/apps/cloud-arcanum-web/client");
const watchMode = process.argv.includes("--watch");

function resolveEsbuildBinary(): string {
  const binaryCandidates = [
    path.resolve(projectRoot, "node_modules/@esbuild/darwin-arm64/bin/esbuild"),
    path.resolve(projectRoot, "node_modules/@esbuild/darwin-x64/bin/esbuild"),
    path.resolve(projectRoot, "node_modules/esbuild/bin/esbuild"),
  ];

  for (const candidate of binaryCandidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to locate an esbuild binary in node_modules.");
}

await mkdir(outputDirectory, { recursive: true });

const esbuildBinary = resolveEsbuildBinary();

const esbuildArgs = [
  entryFile,
  "--bundle",
  "--format=esm",
  "--jsx=automatic",
  "--loader:.svg=file",
  "--public-path=/assets",
  `--outfile=${path.join(outputDirectory, "app.js")}`,
  "--platform=browser",
  "--sourcemap",
  "--target=es2022",
];

if (watchMode) {
  esbuildArgs.push("--watch");
}

if (watchMode) {
  const child = spawn(esbuildBinary, esbuildArgs, {
    stdio: "inherit",
  });

  await new Promise<void>((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal === "SIGTERM" || signal === "SIGINT") {
        resolve();
        return;
      }

      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`esbuild watch exited with code ${code ?? 0}.`));
    });
  });
} else {
  await execFileAsync(esbuildBinary, esbuildArgs);
}
