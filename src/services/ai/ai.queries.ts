import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { aiApi } from "./ai.api";
import type { AiResultItemDto, GetAiResultsParams } from "./ai.dto";

export const AI_RESULTS_REFETCH_INTERVAL_MS = 5000;

export type AiSsePayload = {
  type: "AI_STATUS_UPDATED";
  noteId: string;
  sessionId: string;
  aiStatus: string;
  aiError: string | null;
  summary: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  summarizedAt: string | null;
  transcribedAt: string | null;
};

export function useAiResultsQuery(
  accessToken: string | null,
  params: GetAiResultsParams,
  enabled: boolean = true,
  polling: boolean = false,
) {
  return useQuery({
    queryKey: ["ai-results", params],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return aiApi.getAiResults(accessToken, params);
    },
    enabled: !!accessToken && enabled,
    retry: false,
    refetchInterval: polling ? AI_RESULTS_REFETCH_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}

export function useAiResultDetailQuery(
  accessToken: string | null,
  id: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["ai-result-detail", id],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return aiApi.getAiResultById(accessToken, id);
    },
    enabled: !!accessToken && !!id && enabled,
    retry: false,
  });
}

export function useAiResultsWatcherQuery(
  accessToken: string | null,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["ai-results-watcher"],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return aiApi.getAiResults(accessToken, {
        limit: 50,
        sort: "newest",
      });
    },
    enabled: !!accessToken && enabled,
    retry: false,
    refetchInterval: AI_RESULTS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
}

/**
 * Opens a persistent SSE connection to /ai-results/stream.
 * Calls onUpdate whenever an AI status change event arrives.
 * Automatically reconnects with backoff if the connection drops.
 */
export function useAiStatusStream(
  accessToken: string | null,
  onUpdate: (payload: AiSsePayload) => void,
) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;
    let retryDelay = 2000;
    let activeController: AbortController | null = null;

    const connect = async () => {
      if (cancelled) return;

      const baseUrl = process.env.NEXT_PUBLIC_NEST_API ?? "";
      const url = `${baseUrl}/ai-results/stream`;
      const controller = new AbortController();
      activeController = controller;

      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "text/event-stream",
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`SSE response error: ${response.status}`);
        }

        // Connection succeeded, reset backoff
        retryDelay = 2000;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            try {
              const payload: AiSsePayload = JSON.parse(line.slice(5).trim());
              if (payload.type === "AI_STATUS_UPDATED") {
                onUpdateRef.current(payload);
              }
            } catch {
              // malformed SSE line — skip
            }
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError" || cancelled) return;
      }

      // Reconnect with backoff if not cancelled
      if (!cancelled) {
        setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30000);
      }
    };

    connect();

    return () => {
      cancelled = true;
      activeController?.abort();
    };
  }, [accessToken]);
}

export function useAiRetryMutation(accessToken: string | null) {
  return useMutation({
    mutationFn: (consultationId: string) => {
      if (!accessToken) throw new Error("No access token");
      return aiApi.retryAiSummary(accessToken, consultationId);
    },
  });
}
