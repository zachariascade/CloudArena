import { useEffect, useState } from "react";

import { CloudArcanumApiClientError } from "./base-api-client.js";

type AsyncStatus = "idle" | "loading" | "success" | "error";

export type ApiRequestState<TData> = {
  data: TData | null;
  error: CloudArcanumApiClientError | Error | null;
  status: AsyncStatus;
};

export function useApiRequest<TData>(
  factory: (signal: AbortSignal) => Promise<TData>,
  dependencies: readonly unknown[],
): ApiRequestState<TData> {
  const [state, setState] = useState<ApiRequestState<TData>>({
    data: null,
    error: null,
    status: "idle",
  });

  useEffect(() => {
    const abortController = new AbortController();

    setState((currentState) => ({
      data: currentState.data,
      error: null,
      status: "loading",
    }));

    void factory(abortController.signal)
      .then((data) => {
        if (abortController.signal.aborted) {
          return;
        }

        setState({
          data,
          error: null,
          status: "success",
        });
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted) {
          return;
        }

        setState({
          data: null,
          error: error instanceof Error ? error : new Error(String(error)),
          status: "error",
        });
      });

    return () => {
      abortController.abort();
    };
  }, dependencies);

  return state;
}
