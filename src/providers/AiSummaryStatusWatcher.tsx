"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { toast } from "react-toastify";
import { authStore } from "@/services/auth/auth.store";
import { useAiResultsWatcherQuery } from "@/services/ai/ai.queries";

type AiStatusItem = {
  id: string;
  consultationId: string;
  roomName?: string | null;
  patientIdentity?: string | null;
  aiStatus?: string | null;
  aiError?: string | null;
};

const useAuthSnapshot = () => {
  return useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getState(),
    () => authStore.getState(),
  );
};

function normalizeStatus(status?: string | null) {
  return String(status ?? "").trim().toUpperCase();
}

function isSuccessStatus(status?: string | null) {
  const value = normalizeStatus(status);
  return value === "SUCCESS";
}

function isFailedStatus(status?: string | null) {
  const value = normalizeStatus(status);
  return value === "FAILED" || value.includes("ERROR");
}

function getDisplayName(item: AiStatusItem) {
  return item.roomName || item.patientIdentity || item.consultationId || "AI summary";
}

export default function AiSummaryStatusWatcher() {
  const { accessToken, bootstrapped } = useAuthSnapshot();

  const initializedRef = useRef(false);
  const previousStatusMapRef = useRef<Record<string, string>>({});
  const notifiedStatusMapRef = useRef<Record<string, string>>({});

  const { data } = useAiResultsWatcherQuery(
    accessToken,
    bootstrapped && !!accessToken,
  );

  useEffect(() => {
    const items = data?.data ?? [];
    if (!items.length) return;

    const currentMap: Record<string, string> = {};

    for (const item of items) {
      currentMap[item.id] = normalizeStatus(item.aiStatus);
    }

    if (!initializedRef.current) {
      previousStatusMapRef.current = currentMap;
      initializedRef.current = true;
      return;
    }

    for (const item of items) {
      const currentStatus = normalizeStatus(item.aiStatus);
      const previousStatus = previousStatusMapRef.current[item.id];
      const alreadyNotifiedStatus = notifiedStatusMapRef.current[item.id];
      const displayName = getDisplayName(item);

      const becameSuccess =
        isSuccessStatus(currentStatus) &&
        !isSuccessStatus(previousStatus) &&
        alreadyNotifiedStatus !== currentStatus;

      const becameFailed =
        isFailedStatus(currentStatus) &&
        !isFailedStatus(previousStatus) &&
        alreadyNotifiedStatus !== currentStatus;

      if (becameSuccess) {
        toast.success(`AI summary success: ${displayName}`);
        notifiedStatusMapRef.current[item.id] = currentStatus;
      }

      if (becameFailed) {
        toast.error(
          item.aiError
            ? `AI summary failed: ${displayName} - ${item.aiError}`
            : `AI summary failed: ${displayName}`,
        );
        notifiedStatusMapRef.current[item.id] = currentStatus;
      }
    }

    previousStatusMapRef.current = currentMap;
  }, [data]);

  return null;
}