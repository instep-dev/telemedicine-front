"use client";

import Link from "next/link";
import { use, useSyncExternalStore } from "react";
import {
  BrainIcon,
  CheckCircleIcon,
  ClipboardTextIcon,
  FileTextIcon,
  HeartbeatIcon,
  LockIcon,
  ShieldCheckIcon,
  SparkleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authStore } from "@/services/auth/auth.store";
import {
  useSoapNoteQuery,
  useSoapNoteStream,
} from "@/services/soap-notes/soap-notes.queries";
import type { SoapNoteDto } from "@/services/soap-notes/soap-notes.dto";

const getPatientAuthState = () => authStore.getState();

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReadOnlyField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-cultured bg-card">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-base font-semibold text-white">{label}</h3>
      </div>
      <div className="px-5 pb-5">
        <p className="text-sm text-accent whitespace-pre-wrap min-h-[48px]">
          {value || <span className="italic opacity-50">Not yet filled in by the doctor</span>}
        </p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded bg-card border border-cultured" />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="h-64 rounded-lg bg-card border border-cultured" />
        <div className="h-64 rounded-lg bg-card border border-cultured" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-lg bg-card border border-cultured" />
        ))}
      </div>
    </div>
  );
}

function NotFoundCard({ sessionId }: { sessionId: string }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Consultation Results</h1>
        <p className="text-sm text-accent">Session {sessionId}</p>
      </header>
      <div className="rounded-lg border border-cultured bg-card">
        <div className="px-6 pt-6 pb-2">
          <h3 className="font-semibold text-white">Data Not Found</h3>
          <p className="text-sm text-accent mt-1">
            Consultation results are unavailable or cannot be accessed.
          </p>
        </div>
        <div className="px-6 pb-6 pt-4">
          <Link href="/patient/history" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to History
          </Link>
        </div>
      </div>
    </div>
  );
}

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

function SummaryContent({ note }: { note: SoapNoteDto }) {
  const soapFields = [
    { field: "subjective" as const, label: "Subjective (Patient Complaints)" },
    { field: "objective" as const, label: "Objective (Physical Findings)" },
    { field: "assessment" as const, label: "Assessment (Diagnosis)" },
    { field: "plan" as const, label: "Plan (Treatment Plan)" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Consultation Results</h1>
          <p className="text-sm text-accent">
            Summary of your consultation on {formatDateTime(note.scheduledStartTime)}.
          </p>
        </div>
        <Link href="/patient/history" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to History
        </Link>
      </header>

      <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
        <CheckCircleIcon size={16} />
        Consultation results have been finalized by the doctor on {formatDateTime(note.finalizedAt)}.
      </div>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-cultured bg-card">
          <div className="px-6 pt-6 pb-4">
            <h3 className="font-semibold text-white">Session Summary</h3>
            <p className="text-sm text-accent mt-1">Your consultation information.</p>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="gap-1 bg-green-500/10 text-green-400 border-green-500/20">
                <CheckCircleIcon size={12} />
                Finalized
              </Badge>
              <Badge variant="outline">{formatDateTime(note.finalizedAt)}</Badge>
            </div>

            {note.summary && (
              <>
                <div className="rounded-lg border border-cultured bg-card/50 p-4 text-sm text-white">
                  {note.summary}
                </div>
                <div className="border-t border-cultured" />
              </>
            )}

            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-cultured bg-card/50 p-3">
                <p className="text-xs text-accent">Doctor</p>
                <p className="font-medium text-white">{note.doctorName ?? "-"}</p>
              </div>
              <div className="rounded-lg border border-cultured bg-card/50 p-3">
                <p className="text-xs text-accent">Consultation Time</p>
                <p className="font-medium text-white">{formatDateTime(note.scheduledStartTime)}</p>
              </div>
              <div className="rounded-lg border border-cultured bg-card/50 p-3">
                <p className="text-xs text-accent">Duration</p>
                <p className="font-medium text-white">
                  {note.durationMinutes ? `${note.durationMinutes} min` : "-"}
                </p>
              </div>
              <div className="rounded-lg border border-cultured bg-card/50 p-3">
                <p className="text-xs text-accent">Consultation Mode</p>
                <p className="font-medium text-white">{note.consultationMode ?? "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-cultured bg-card">
          <div className="px-6 pt-6 pb-4">
            <h3 className="font-semibold text-white">AI Info</h3>
            <p className="text-sm text-accent mt-1">Summary assisted by AI.</p>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border border-cultured p-2 text-primary">
                <BrainIcon size={18} weight="duotone" />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-white">Processed by AI</p>
                <p className="text-accent text-xs">
                  The SOAP results have been reviewed and finalized by your doctor.
                </p>
              </div>
            </div>
            <div className="border-t border-cultured" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between rounded-lg border border-cultured bg-card/50 p-3">
                <span className="text-accent">AI Model</span>
                <span className="font-medium text-white">{note.aiModel ?? "-"}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-cultured bg-card/50 p-3">
                <span className="text-accent">Finalized</span>
                <span className="font-medium text-white">{formatDateTime(note.finalizedAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-accent">
              <WarningCircleIcon size={14} />
              Results have been verified by your doctor.
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardTextIcon size={18} className="text-primary" />
          <h2 className="text-lg font-semibold text-white">SOAP Note</h2>
          <Badge variant="outline" className="gap-1 text-xs">
            <LockIcon size={10} />
            Read-only
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {soapFields.map(({ field, label }) => (
            <ReadOnlyField key={field} label={label} value={note[field]} />
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-lg border border-cultured bg-card">
          <div className="px-6 pt-6 pb-4">
            <h3 className="font-semibold text-white">Next Steps</h3>
            <p className="text-sm text-accent mt-1">Recommendations from your doctor.</p>
          </div>
          <div className="px-6 pb-6 grid gap-3 text-sm sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border border-cultured bg-card/50 p-3">
              <ShieldCheckIcon size={16} className="text-primary mt-0.5 shrink-0" />
              <span className="text-accent">Follow the treatment instructions as per the plan above.</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-cultured bg-card/50 p-3">
              <HeartbeatIcon size={16} className="text-primary mt-0.5 shrink-0" />
              <span className="text-accent">Schedule a follow-up if symptoms persist.</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-cultured bg-card/50 p-3">
              <FileTextIcon size={16} className="text-primary mt-0.5 shrink-0" />
              <span className="text-accent">Save these results as a reference for your health records.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PatientSummaryResultsDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const { accessToken } = useSyncExternalStore(
    authStore.subscribe,
    getPatientAuthState,
    getPatientAuthState,
  );

  const { data: note, isLoading, error } = useSoapNoteQuery(accessToken, sessionId);
  useSoapNoteStream(accessToken, sessionId, true);

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    const status = (error as any)?.response?.status;
    if (status === 403) return <PendingFinalizationCard sessionId={sessionId} />;
    return <NotFoundCard sessionId={sessionId} />;
  }

  if (!note) return <NotFoundCard sessionId={sessionId} />;
  if (!note.isFinalized) return <PendingFinalizationCard sessionId={sessionId} />;

  return <SummaryContent note={note} />;
}
