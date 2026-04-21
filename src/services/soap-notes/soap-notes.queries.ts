"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { soapNotesApi } from "./soap-notes.api";
import type { SoapNoteDto, SseNoteEvent, UpdateSoapNoteBody } from "./soap-notes.dto";

export const soapNoteKeys = {
  note: (sessionId: string) => ["soap-note", sessionId] as const,
};

export function useSoapNoteQuery(
  accessToken: string | null,
  sessionId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: soapNoteKeys.note(sessionId),
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return soapNotesApi.getNote(accessToken, sessionId);
    },
    enabled: !!accessToken && !!sessionId && enabled,
    retry: false,
  });
}

export function useUpdateSoapNoteMutation(accessToken: string | null, sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSoapNoteBody) => {
      if (!accessToken) throw new Error("No access token");
      return soapNotesApi.updateNote(accessToken, sessionId, body);
    },
    onSuccess: (data) => {
      qc.setQueryData(soapNoteKeys.note(sessionId), data);
    },
  });
}

export function useFinalizeSoapNoteMutation(accessToken: string | null, sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => {
      if (!accessToken) throw new Error("No access token");
      return soapNotesApi.finalizeNote(accessToken, sessionId);
    },
    onSuccess: (data) => {
      qc.setQueryData(soapNoteKeys.note(sessionId), data);
    },
  });
}

/**
 * Subscribes to SSE updates for a SOAP note using fetch (supports Auth headers).
 * Automatically updates the React Query cache when an update event is received.
 */
export function useSoapNoteStream(
  accessToken: string | null,
  sessionId: string,
  enabled = true,
) {
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!accessToken || !sessionId || !enabled) return;

    const baseUrl = process.env.NEXT_PUBLIC_NEST_API ?? "";
    const url = `${baseUrl}/soap-notes/${sessionId}/stream`;

    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "text/event-stream",
          },
          signal: controller.signal,
        });

        if (!response.ok || !response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            try {
              const event: SseNoteEvent = JSON.parse(line.slice(5).trim());
              if (event.type === "NOTE_UPDATED") {
                qc.setQueryData<SoapNoteDto>(
                  soapNoteKeys.note(sessionId),
                  event.note,
                );
              }
            } catch {
              // malformed line — ignore
            }
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        // connection dropped — React Query will refetch on next focus
      }
    })();

    return () => {
      controller.abort();
    };
  }, [accessToken, sessionId, enabled, qc]);
}
