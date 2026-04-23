"use client";

import Link from "next/link";
import { use, useState, useSyncExternalStore } from "react";
import {
  ArticleIcon,
  BrainIcon,
  CheckCircleIcon,
  ClipboardTextIcon,
  DownloadSimpleIcon,
  FileTextIcon,
  FloppyDiskIcon,
  HeartbeatIcon,
  PencilSimpleIcon,
  ShieldCheckIcon,
  SparkleIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authStore } from "@/services/auth/auth.store";
import {
  useFinalizeSoapNoteMutation,
  useSoapNoteQuery,
  useSoapNoteStream,
  useUpdateSoapNoteMutation,
} from "@/services/soap-notes/soap-notes.queries";
import type { SoapNoteDto } from "@/services/soap-notes/soap-notes.dto";

const getDoctorAuthState = () => authStore.getState();

type EditableField = "subjective" | "objective" | "assessment" | "plan";

const FIELD_LABELS: Record<EditableField, string> = {
  subjective: "Subjective",
  objective: "Objective",
  assessment: "Assessment",
  plan: "Plan",
};

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

function AiStatusBadge({ status }: { status: string | null }) {
  if (status === "SUCCESS")
    return (
      <Badge className="gap-1 bg-green-500/10 text-green-400 border-green-500/20">
        <CheckCircleIcon size={12} />
        AI Complete
      </Badge>
    );
  if (status === "PROCESSING" || status === "PENDING")
    return (
      <Badge variant="secondary" className="gap-1">
        <SparkleIcon size={12} className="animate-pulse" />
        AI {status === "PENDING" ? "Pending" : "Processing"}
      </Badge>
    );
  if (status === "FAILED")
    return (
      <Badge className="gap-1 bg-red-500/10 text-red-400 border-red-500/20">
        <XCircleIcon size={12} />
        AI Failed
      </Badge>
    );
  return <Badge variant="outline">-</Badge>;
}

function SoapFieldCard({
  field,
  value,
  onSave,
  isSaving,
}: {
  field: EditableField;
  value: string | null;
  onSave: (field: EditableField, value: string) => void;
  isSaving: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  const handleSave = () => {
    onSave(field, draft);
    setEditing(false);
  };

  return (
    <div className="rounded-lg border border-cultured bg-card">
      <div className="flex items-center justify-between p-6">
        <h3 className="text-base text-white flex items-center gap-2">{FIELD_LABELS[field]}</h3>
        {!editing && (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 text-xs"
            onClick={() => {
              setDraft(value ?? "");
              setEditing(true);
            }}
          >
            <PencilSimpleIcon size={11} />
            Edit
          </Button>
        )}
      </div>
      <div className="p-6 pt-0">
        {editing ? (
          <div className="space-y-2">
            <textarea
              className="w-full rounded-md border border-cultured bg-card px-3 py-2 text-sm text-white min-h-[120px] resize-y focus:outline-none focus:ring-1 focus:ring-ring"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" className="gap-1" onClick={handleSave} disabled={isSaving}>
                <FloppyDiskIcon size={13} />
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/90 whitespace-pre-wrap min-h-[48px]">
            {value || <span className="italic opacity-50">Not yet filled in</span>}
          </p>
        )}
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

function NoteNotFound({ sessionId }: { sessionId: string }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Summary Results</h1>
        <p className="text-sm text-accent">AI results for session {sessionId} are not available.</p>
      </header>
      <div className="rounded-lg border border-cultured bg-card">
        <div className="px-6 pt-6 pb-2">
          <h3 className="font-semibold text-white">Data Not Found</h3>
          <p className="text-sm text-accent mt-1">The SOAP note for this session has not been created or cannot be accessed.</p>
        </div>
        <div className="px-6 pb-6 pt-4">
          <Link href="/doctor/history" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to History
          </Link>
        </div>
      </div>
    </div>
  );
}

function SummaryContent({
  note,
  onSave,
  isSaving,
  onFinalize,
  isFinalizing,
}: {
  note: SoapNoteDto;
  onSave: (field: EditableField, value: string) => void;
  isSaving: boolean;
  onFinalize: () => void;
  isFinalizing: boolean;
}) {
  const soapFields: EditableField[] = ["subjective", "objective", "assessment", "plan"];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="">
          <div className="flex items-center gap-2">
            <ClipboardTextIcon size={16} className="text-primary" />
            <h1 className="text-lg font-semibold tracking-tight text-white">Summary Results</h1>
          </div>
            <p className="text-sm text-accent">
              AI details for session {note.consultationSessionId}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/doctor/history" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to History
            </Link>
            <Button variant="outline" className="gap-2">
              <DownloadSimpleIcon size={16} />
              Download PDF
            </Button>
            {note.isFinalized ? (
              <Badge className="gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 border-green-500/20 text-sm">
                <CheckCircleIcon size={14} />
                Published to Patient
              </Badge>
            ) : (
              <Button
                className="gap-2"
                onClick={onFinalize}
                disabled={isFinalizing || note.aiStatus !== "SUCCESS"}
                title={note.aiStatus !== "SUCCESS" ? "Wait for AI to finish processing" : undefined}
              >
                <CheckCircleIcon size={16} />
                {isFinalizing ? "Finalizing..." : "Finalize & Publish"}
              </Button>
            )}
          </div>
      </header>

      {note.aiStatus !== "SUCCESS" && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-400">
          <WarningCircleIcon size={16} />
          AI is still processing the consultation results. The Finalize button will be active once AI has finished.
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-cultured bg-card p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-white">Session Overview</h3>
            <p className="text-sm text-accent ">Main consultation details</p>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <AiStatusBadge status={note.aiStatus} />
              <Badge variant="secondary">
                {note.isFinalized
                  ? `Finalized ${formatDateTime(note.finalizedAt)}`
                  : "Not yet finalized"}
              </Badge>
            </div>
            {note.summary && (
              <>
                <div className="rounded-lg border border-cultured bg-card p-4 text-sm text-white/90">
                  {note.summary}
                </div>
                <div className="border-t border-cultured" />
              </>
            )}
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-cultured bg-card/50 p-3">
                <p className="text-xs text-accent">Patient</p>
                <p className="font-medium text-white">{note.patientName ?? "-"}</p>
              </div>
              <div className="rounded-lg border border-cultured bg-card/50 p-3">
                <p className="text-xs text-accent">Doctor</p>
                <p className="font-medium text-white">{note.doctorName ?? "-"}</p>
              </div>
              <div className="rounded-lg border border-cultured bg-card/50 p-3">
                <p className="text-xs text-accent">Start Time</p>
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
              <div className="rounded-lg border border-cultured bg-card/50 p-3">
                <p className="text-xs text-accent">Session Status</p>
                <p className="font-medium text-white">{note.sessionStatus ?? "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-cultured bg-card">
          <div className="px-6 pt-6 pb-6">
            <h3 className="font-semibold text-white">AI Info</h3>
            <p className="text-sm text-accent mt-1">AI processing status.</p>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border bg-blue-500/10 border border-blue-950 border-cultured p-2 text-primary">
                <BrainIcon size={18} weight="duotone" />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-white">Processing Status</p>
                <AiStatusBadge status={note.aiStatus} />
              </div>
            </div>
            <div className="border-t border-cultured" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between rounded-lg border border-cultured bg-card/50 p-3">
                <span className="text-accent">Model</span>
                <span className="font-medium text-white">{note.aiModel ?? "-"}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-cultured bg-card/50 p-3">
                <span className="text-accent">Transcription</span>
                <span className="font-medium text-white">{formatDateTime(note.transcribedAt)}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-cultured bg-card/50 p-3">
                <span className="text-accent">AI Summary</span>
                <span className="font-medium text-white">{formatDateTime(note.summarizedAt)}</span>
              </div>
            </div>
            {note.aiError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                <XCircleIcon size={14} className="mt-0.5 shrink-0" />
                {note.aiError}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-accent border rounded-lg p-2 border-yellow-950 bg-yellow-500/10 text-yellow-600">
              <WarningCircleIcon size={14} />
              Manual review required before finalization.
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ArticleIcon size={18} className="text-primary" />
            <h2 className="text-lg font-semibold text-white">SOAP Note</h2>
          </div>
          <Badge variant="destructive" className="text-xs"><WarningCircleIcon/> Only the doctor can edit</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {soapFields.map((field) => (
            <SoapFieldCard
              key={field}
              field={field}
              value={note[field]}
              onSave={onSave}
              isSaving={isSaving}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="rounded-lg border border-cultured bg-card">
          <div className="px-6 pt-6 pb-4">
            <h3 className="font-semibold text-white">Next Steps</h3>
            <p className="text-sm text-accent mt-1">Checklist for the medical team.</p>
          </div>
          <div className="px-6 pb-6 grid gap-3 text-sm sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border border-cultured bg-card/50 p-3">
              <ShieldCheckIcon size={16} className="text-primary mt-0.5 shrink-0" />
              <span className="text-accent">Re-verify the patient's allergy history.</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-cultured bg-card/50 p-3">
              <HeartbeatIcon size={16} className="text-primary mt-0.5 shrink-0" />
              <span className="text-accent">Schedule a follow-up as recommended.</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-cultured bg-card/50 p-3">
              <FileTextIcon size={16} className="text-primary mt-0.5 shrink-0" />
              <span className="text-accent">
                {note.isFinalized
                  ? "Results are now visible to the patient."
                  : "Finalize so the patient can view the results."}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DoctorSummaryResultsDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const { accessToken } = useSyncExternalStore(
    authStore.subscribe,
    getDoctorAuthState,
    getDoctorAuthState,
  );

  const { data: note, isLoading, error } = useSoapNoteQuery(accessToken, sessionId);
  useSoapNoteStream(accessToken, sessionId, !!note);

  const updateMutation = useUpdateSoapNoteMutation(accessToken, sessionId);
  const finalizeMutation = useFinalizeSoapNoteMutation(accessToken, sessionId);

  if (isLoading) return <LoadingSkeleton />;
  if (error || !note) return <NoteNotFound sessionId={sessionId} />;

  return (
    <SummaryContent
      note={note}
      onSave={(field, value) => updateMutation.mutate({ [field]: value })}
      isSaving={updateMutation.isPending}
      onFinalize={() => finalizeMutation.mutate()}
      isFinalizing={finalizeMutation.isPending}
    />
  );
}
