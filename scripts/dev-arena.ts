import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

const cwd = process.cwd();
const node18ScriptPath = path.join(cwd, "scripts", "node18.sh");
const distDirectory = path.join(cwd, "dist", "scripts");
const watchMode = !process.argv.includes("--no-watch");

const watcherChildren: ChildProcess[] = [];
let arenaApiChild: ChildProcess | null = null;
let arenaWebChild: ChildProcess | null = null;
let restartTimer: NodeJS.Timeout | null = null;
let isRestarting = false;

function prefixStream(processName: string, stream: NodeJS.ReadableStream | null): void {
  if (!stream) {
    return;
  }

  stream.on("data", (chunk) => {
    const text = chunk.toString();
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.length > 0) {
        console.log(`[${processName}] ${line}`);
      }
    }
  });
}

function terminateChild(child: ChildProcess | null): Promise<void> {
  if (!child || child.killed || child.exitCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    child.once("exit", () => resolve());
    child.kill("SIGTERM");
    setTimeout(() => resolve(), 500).unref();
  });
}

function startManagedProcess(
  processName: "arena-api" | "arena-web",
  scriptPath: string,
): ChildProcess {
  const child = spawn(node18ScriptPath, [scriptPath], {
    cwd,
    stdio: ["inherit", "pipe", "pipe"],
  });

  prefixStream(processName, child.stdout);
  prefixStream(processName, child.stderr);

  child.on("exit", (code, signal) => {
    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.log(`[${processName}] exited with ${reason}`);

    if (processName === "arena-api" && arenaApiChild === child) {
      arenaApiChild = null;
    }

    if (processName === "arena-web" && arenaWebChild === child) {
      arenaWebChild = null;
    }
  });

  child.on("error", (error) => {
    console.error(`[${processName}] failed to start: ${error.message}`);
    shutdown(1);
  });

  return child;
}

function startWatcher(
  processName: string,
  args: string[],
  onLine?: (line: string) => void,
): void {
  const child = spawn(node18ScriptPath, args, {
    cwd,
    stdio: ["inherit", "pipe", "pipe"],
  });

  watcherChildren.push(child);

  const handleStream = (stream: NodeJS.ReadableStream | null): void => {
    if (!stream) {
      return;
    }

    stream.on("data", (chunk) => {
      const text = chunk.toString();
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.length === 0) {
          continue;
        }

        console.log(`[${processName}] ${line}`);
        onLine?.(line);
      }
    });
  };

  handleStream(child.stdout);
  handleStream(child.stderr);

  child.on("exit", (code, signal) => {
    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.log(`[${processName}] exited with ${reason}`);
  });

  child.on("error", (error) => {
    console.error(`[${processName}] failed to start: ${error.message}`);
    shutdown(1);
  });
}

async function restartServers(): Promise<void> {
  if (isRestarting) {
    return;
  }

  isRestarting = true;

  await Promise.all([
    terminateChild(arenaApiChild),
    terminateChild(arenaWebChild),
  ]);

  arenaApiChild = startManagedProcess("arena-api", path.join(distDirectory, "dev-arena-api.js"));
  arenaWebChild = startManagedProcess("arena-web", path.join(distDirectory, "dev-arena-web.js"));

  isRestarting = false;
}

function scheduleRestart(): void {
  if (restartTimer) {
    clearTimeout(restartTimer);
  }

  restartTimer = setTimeout(() => {
    restartTimer = null;
    void restartServers();
  }, 150);
}

function shutdown(exitCode = 0): void {
  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }

  for (const child of watcherChildren) {
    if (!child.killed && child.exitCode === null) {
      child.kill("SIGTERM");
    }
  }

  void Promise.all([
    terminateChild(arenaApiChild),
    terminateChild(arenaWebChild),
  ]).finally(() => {
    setTimeout(() => {
      process.exit(exitCode);
    }, 50).unref();
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

arenaApiChild = startManagedProcess("arena-api", path.join(distDirectory, "dev-arena-api.js"));
arenaWebChild = startManagedProcess("arena-web", path.join(distDirectory, "dev-arena-web.js"));

if (watchMode) {
  startWatcher(
    "tsc",
    [
      "./node_modules/typescript/bin/tsc",
      "-p",
      "tsconfig.json",
      "--watch",
      "--preserveWatchOutput",
    ],
    (line) => {
      if (line.includes("Found 0 errors")) {
        scheduleRestart();
      }
    },
  );

  startWatcher("arena-web-build", [path.join(distDirectory, "build-arena-web-client.js"), "--watch"]);

  console.log("Cloud Arena local dev is running with TypeScript and frontend bundle watchers. Press Ctrl+C to stop.");
} else {
  console.log("Cloud Arena local dev is running without watchers. Press Ctrl+C to stop.");
}
