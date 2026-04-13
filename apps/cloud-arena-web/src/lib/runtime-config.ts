type CloudArenaRuntimeConfig = {
  apiBaseUrl: string;
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
    cloudArcanumApiBaseUrl:
      window.__CLOUD_ARENA_CONFIG__?.cloudArcanumApiBaseUrl ?? "http://127.0.0.1:4310",
    cloudArcanumWebBaseUrl:
      window.__CLOUD_ARENA_CONFIG__?.cloudArcanumWebBaseUrl ?? "http://127.0.0.1:4320",
  };
}
