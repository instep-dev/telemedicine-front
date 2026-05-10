"use client";

import { use, useSyncExternalStore } from "react";
import { authStore } from "@/services/auth/auth.store";
import {
  useFinalizeSoapNoteMutation,
  useSoapNoteQuery,
  useSoapNoteStream,
  useUpdateSoapNoteMutation,
} from "@/services/soap-notes/soap-notes.queries";
import {
  SummaryLoadingSkeleton,
  SummaryNotFound,
  SummaryResultsView,
} from "@/components/dashboard/summary/SummaryResultsView";

const getAuthState = () => authStore.getState();

export default function DoctorSummaryResultsDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const { accessToken } = useSyncExternalStore(authStore.subscribe, getAuthState, getAuthState);

  const { data: note, isLoading, error } = useSoapNoteQuery(accessToken, sessionId);
  useSoapNoteStream(accessToken, sessionId, !!note);

  const updateMutation = useUpdateSoapNoteMutation(accessToken, sessionId);
  const finalizeMutation = useFinalizeSoapNoteMutation(accessToken, sessionId);

  if (isLoading) return <SummaryLoadingSkeleton />;
  if (error || !note)
    return (
      <SummaryNotFound
        sessionId={sessionId}
        backHref="/doctor/history"
        backLabel="Back to History"
      />
    );

  return (
    <SummaryResultsView
      note={note}
      role="doctor"
      backHref="/doctor/history"
      backLabel="Back to History"
      onSave={(field, value) => updateMutation.mutate({ [field]: value })}
      isSaving={updateMutation.isPending}
      onFinalize={() => finalizeMutation.mutate()}
      isFinalizing={finalizeMutation.isPending}
    />
  );
}
