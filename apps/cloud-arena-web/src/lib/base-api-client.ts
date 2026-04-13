import type {
  CloudArenaApiContracts,
} from "../../../../src/cloud-arena/api-contract.js";

export type CloudApiClientOptions = {
  baseUrl: string;
  fetchFn?: typeof fetch;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveApiAssetUrls<TValue>(value: TValue, baseUrl: string): TValue {
  if (Array.isArray(value)) {
    return value.map((entry) => resolveApiAssetUrls(entry, baseUrl)) as TValue;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const resolvedEntries = Object.entries(value).map(([key, entryValue]) => {
    if (key === "publicUrl" && typeof entryValue === "string" && entryValue.startsWith("/")) {
      return [key, `${baseUrl}${entryValue}`];
    }

    return [key, resolveApiAssetUrls(entryValue, baseUrl)];
  });

  return Object.fromEntries(resolvedEntries) as TValue;
}

type CloudApiContracts = CloudArenaApiContracts;
export type CloudApiRouteName = keyof CloudApiContracts;
export type CloudApiResponse<TName extends CloudApiRouteName> =
  CloudApiContracts[TName]["response"];

type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

export class CloudArcanumApiClientError extends Error {
  readonly route: CloudApiRouteName;
  readonly status: number;
  readonly code: string | null;

  constructor(options: {
    code: string | null;
    message: string;
    route: CloudApiRouteName;
    status: number;
  }) {
    super(options.message);
    this.name = "CloudArcanumApiClientError";
    this.code = options.code;
    this.route = options.route;
    this.status = options.status;
  }
}

async function parseApiError(response: Response): Promise<ApiErrorResponse | null> {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload?.error ? payload : null;
  } catch {
    return null;
  }
}

export class BaseCloudApiClient {
  readonly #baseUrl: string;
  readonly #fetchFn: typeof fetch;

  constructor(options: CloudApiClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/$/, "");
    this.#fetchFn =
      options.fetchFn?.bind(globalThis) ?? globalThis.fetch.bind(globalThis);
  }

  protected async request<TName extends CloudApiRouteName>(
    route: TName,
    path: string,
    options: {
      body?: unknown;
      method?: "GET" | "POST";
      signal?: AbortSignal;
    } = {},
  ): Promise<CloudApiResponse<TName>> {
    const headers: Record<string, string> = {
      accept: "application/json",
    };
    const method = options.method ?? "GET";

    if (options.body !== undefined) {
      headers["content-type"] = "application/json";
    }

    const response = await this.#fetchFn(`${this.#baseUrl}${path}`, {
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      headers,
      method,
      signal: options.signal,
    });

    if (!response.ok) {
      const payload = await parseApiError(response);
      throw new CloudArcanumApiClientError({
        code: payload?.error.code ?? null,
        message: payload?.error.message ?? `Request failed with status ${response.status}.`,
        route,
        status: response.status,
      });
    }

    const payload = (await response.json()) as CloudApiResponse<TName>;
    return resolveApiAssetUrls(payload, this.#baseUrl);
  }
}
