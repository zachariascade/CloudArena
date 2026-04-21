import type { CloudArenaContentMode } from "./cloud-arena-content-controller.js";
import type { CloudArenaSessionMode } from "./cloud-arena-session-controller.js";

type CloudArenaRuntimeConfig = {
  apiBaseUrl: string;
  contentMode: CloudArenaContentMode;
  sessionMode: CloudArenaSessionMode;
  routerMode: "browser" | "hash";
  cloudArcanumApiBaseUrl: string;
  cloudArcanumWebBaseUrl: string;
};

declare global {
  interface Window {
    __CLOUD_ARENA_CONFIG__?: CloudArenaRuntimeConfig;
  }
}

export function getCloudArenaRuntimeConfig(): CloudArenaRuntimeConfig {
  return {
    apiBaseUrl: window.__CLOUD_ARENA_CONFIG__?.apiBaseUrl ?? "http://127.0.0.1:4311",
    contentMode: window.__CLOUD_ARENA_CONFIG__?.contentMode ?? "remote",
    sessionMode: window.__CLOUD_ARENA_CONFIG__?.sessionMode ?? "remote",
    routerMode: window.__CLOUD_ARENA_CONFIG__?.routerMode ?? "browser",
    cloudArcanumApiBaseUrl:
      window.__CLOUD_ARENA_CONFIG__?.cloudArcanumApiBaseUrl ?? "http://127.0.0.1:4310",
    cloudArcanumWebBaseUrl:
      window.__CLOUD_ARENA_CONFIG__?.cloudArcanumWebBaseUrl ?? "http://127.0.0.1:4320",
  };
}
