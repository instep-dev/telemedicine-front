"use client";

import { use, useSyncExternalStore } from "react";
import { authStore } from "@/services/auth/auth.store";
import { useSoapNoteQuery } from "@/services/soap-notes/soap-notes.queries";
import {
  SummaryLoadingSkeleton,
  SummaryNotFound,
  SummaryResultsView,
} from "@/components/dashboard/summary/SummaryResultsView";

const getAuthState = () => authStore.getState();

export default function NurseSummaryResultsDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const { accessToken } = useSyncExternalStore(authStore.subscribe, getAuthState, getAuthState);
  const { data: note, isLoading, error } = useSoapNoteQuery(accessToken, sessionId);

  if (isLoading) return <SummaryLoadingSkeleton />;
  if (error || !note)
    return (
      <SummaryNotFound
        sessionId={sessionId}
        backHref="/nurse/ai-summary"
        backLabel="Back to AI Summary"
      />
    );

  return (
    <SummaryResultsView
      note={note}
      role="nurse"
      backHref="/nurse/ai-summary"
      backLabel="Back to AI Summary"
    />
  );
}
