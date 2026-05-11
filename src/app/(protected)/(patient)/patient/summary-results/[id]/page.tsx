"use client";

import Link from "next/link";
import { use, useSyncExternalStore } from "react";
import { LockIcon, SparkleIcon } from "@phosphor-icons/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authStore } from "@/services/auth/auth.store";
import {
  useSoapNoteQuery,
  useSoapNoteStream,
} from "@/services/soap-notes/soap-notes.queries";
import {
  SummaryLoadingSkeleton,
  SummaryNotFound,
  SummaryResultsView,
} from "@/components/dashboard/summary/SummaryResultsView";

const getAuthState = () => authStore.getState();

function PendingFinalizationCard({ sessionId }: { sessionId: string }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Consultation Results</h1>
        <p className="text-sm text-accent">Session {sessionId}</p>
      </header>
      <div className="rounded-lg border border-cultured bg-card">
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <LockIcon size={20} className="text-accent" />
            <h3 className="font-semibold text-white">Awaiting Doctor</h3>
          </div>
          <p className="text-sm text-accent mt-2">
            Your consultation results are being reviewed by the doctor. This page will
            automatically update once the doctor has finalized the results.
          </p>
        </div>
        <div className="px-6 pb-6 pt-4 space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-400">
            <SparkleIcon size={16} className="animate-pulse" />
            Awaiting finalization from the doctor...
          </div>
          <Link href="/patient/history" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to History
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PatientSummaryResultsDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const { accessToken } = useSyncExternalStore(authStore.subscribe, getAuthState, getAuthState);

  const { data: note, isLoading, error } = useSoapNoteQuery(accessToken, sessionId);
  useSoapNoteStream(accessToken, sessionId, true);

  if (isLoading) return <SummaryLoadingSkeleton />;

  if (error) {
    const status = (error as any)?.response?.status;
    if (status === 403) return <PendingFinalizationCard sessionId={sessionId} />;
    return (
      <SummaryNotFound
        sessionId={sessionId}
        backHref="/patient/history"
        backLabel="Back to History"
      />
    );
  }

  if (!note)
    return (
      <SummaryNotFound
        sessionId={sessionId}
        backHref="/patient/history"
        backLabel="Back to History"
      />
    );
  if (!note.isFinalized) return <PendingFinalizationCard sessionId={sessionId} />;

  return (
    <SummaryResultsView
      note={note}
      role="patient"
      backHref="/patient/history"
      backLabel="Back to History"
    />
  );
}
