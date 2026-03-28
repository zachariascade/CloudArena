type CloudArcanumRuntimeConfig = {
  apiBaseUrl: string;
};

declare global {
  interface Window {
    __CLOUD_ARCANUM_CONFIG__?: CloudArcanumRuntimeConfig;
  }
}

export function getCloudArcanumRuntimeConfig(): CloudArcanumRuntimeConfig {
  return {
    apiBaseUrl: window.__CLOUD_ARCANUM_CONFIG__?.apiBaseUrl ?? "http://127.0.0.1:4310",
  };
}
