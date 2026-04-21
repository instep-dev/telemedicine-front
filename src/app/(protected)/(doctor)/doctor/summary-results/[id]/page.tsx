"use client";

import Link from "next/link";
import { useState } from "react";
import {
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { authStore } from "@/services/auth/auth.store";
import {
  useFinalizeSoapNoteMutation,
  useSoapNoteQuery,
  useSoapNoteStream,
  useUpdateSoapNoteMutation,
} from "@/services/soap-notes/soap-notes.queries";
import type { SoapNoteDto } from "@/services/soap-notes/soap-notes.dto";

type EditableField = "subjective" | "objective" | "assessment" | "plan";

const FIELD_LABELS: Record<EditableField, string> = {
  subjective: "Subjective",
  objective: "Objective",
  assessment: "Assessment",
  plan: "Plan",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AiStatusBadge({ status }: { status: string | null }) {
  if (status === "COMPLETED")
    return (
      <Badge className="gap-1 bg-green-500/10 text-green-400 border-green-500/20">
        <CheckCircleIcon size={12} />
        AI Selesai
      </Badge>
    );
  if (status === "PROCESSING" || status === "PENDING")
    return (
      <Badge variant="secondary" className="gap-1">
        <SparkleIcon size={12} className="animate-pulse" />
        AI {status === "PENDING" ? "Menunggu" : "Memproses"}
      </Badge>
    );
  if (status === "FAILED")
    return (
      <Badge className="gap-1 bg-red-500/10 text-red-400 border-red-500/20">
        <XCircleIcon size={12} />
        AI Gagal
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{FIELD_LABELS[field]}</CardTitle>
          {!editing && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => {
                setDraft(value ?? "");
                setEditing(true);
              }}
            >
              <PencilSimpleIcon size={13} />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-2">
            <textarea
              className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[120px] resize-y focus:outline-none focus:ring-1 focus:ring-ring"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" className="gap-1" onClick={handleSave} disabled={isSaving}>
                <FloppyDiskIcon size={13} />
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={isSaving}>
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[48px]">
            {value || <span className="italic opacity-50">Belum diisi</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded bg-muted" />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="h-64 rounded-lg bg-muted" />
        <div className="h-64 rounded-lg bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

function NoteNotFound({ sessionId }: { sessionId: string }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Summary Results</h1>
        <p className="text-sm text-muted-foreground">Hasil AI untuk sesi {sessionId} tidak tersedia.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Data Tidak Ditemukan</CardTitle>
          <CardDescription>SOAP note untuk sesi ini belum dibuat atau tidak dapat diakses.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/doctor/history" className={cn(buttonVariants({ variant: "outline" }))}>
            Kembali ke History
          </Link>
        </CardContent>
      </Card>
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
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Summary Results</h1>
          <p className="text-sm text-muted-foreground">
            Detail AI untuk sesi {note.consultationSessionId}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/doctor/history" className={cn(buttonVariants({ variant: "outline" }))}>
            Kembali ke History
          </Link>
          <Button variant="outline" className="gap-2">
            <DownloadSimpleIcon size={16} />
            Unduh PDF
          </Button>
          {note.isFinalized ? (
            <Badge className="gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 border-green-500/20 text-sm">
              <CheckCircleIcon size={14} />
              Sudah Dipublish ke Pasien
            </Badge>
          ) : (
            <Button
              className="gap-2"
              onClick={onFinalize}
              disabled={isFinalizing || note.aiStatus !== "COMPLETED"}
              title={note.aiStatus !== "COMPLETED" ? "Tunggu AI selesai memproses" : undefined}
            >
              <CheckCircleIcon size={16} />
              {isFinalizing ? "Memfinalisasi..." : "Finalize & Publish"}
            </Button>
          )}
        </div>
      </header>

      {note.aiStatus !== "COMPLETED" && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-400">
          <WarningCircleIcon size={16} />
          AI masih memproses hasil konsultasi. Tombol Finalize akan aktif setelah AI selesai.
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Session Overview</CardTitle>
            <CardDescription>Ringkasan utama dan metadata konsultasi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <AiStatusBadge status={note.aiStatus} />
              <Badge variant="outline">
                {note.isFinalized
                  ? `Finalized ${formatDateTime(note.finalizedAt)}`
                  : "Belum difinalisasi"}
              </Badge>
            </div>
            {note.summary && (
              <>
                <div className="rounded-lg border p-4 text-sm text-foreground">
                  {note.summary}
                </div>
                <Separator />
              </>
            )}
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Pasien</p>
                <p className="font-medium">{note.patientName ?? "-"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Dokter</p>
                <p className="font-medium">{note.doctorName ?? "-"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Waktu Mulai</p>
                <p className="font-medium">{formatDateTime(note.scheduledStartTime)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Durasi</p>
                <p className="font-medium">
                  {note.durationMinutes ? `${note.durationMinutes} menit` : "-"}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Mode Konsultasi</p>
                <p className="font-medium">{note.consultationMode ?? "-"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Status Sesi</p>
                <p className="font-medium">{note.sessionStatus ?? "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Info</CardTitle>
            <CardDescription>Status pemrosesan AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border p-2 text-primary">
                <BrainIcon size={18} weight="duotone" />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Status Pemrosesan</p>
                <AiStatusBadge status={note.aiStatus} />
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between rounded-lg border p-3">
                <span className="text-muted-foreground">Model</span>
                <span className="font-medium">{note.aiModel ?? "-"}</span>
              </div>
              <div className="flex justify-between rounded-lg border p-3">
                <span className="text-muted-foreground">Transkripsi</span>
                <span className="font-medium">{formatDateTime(note.transcribedAt)}</span>
              </div>
              <div className="flex justify-between rounded-lg border p-3">
                <span className="text-muted-foreground">Ringkasan AI</span>
                <span className="font-medium">{formatDateTime(note.summarizedAt)}</span>
              </div>
            </div>
            {note.aiError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                <XCircleIcon size={14} className="mt-0.5 shrink-0" />
                {note.aiError}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <WarningCircleIcon size={14} />
              Review manual sebelum finalisasi.
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardTextIcon size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">SOAP Note</h2>
          <Badge variant="outline" className="text-xs">Hanya dokter yang dapat mengedit</Badge>
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
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Checklist untuk tim medis.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <ShieldCheckIcon size={16} className="text-primary mt-0.5" />
              Verifikasi ulang riwayat alergi pasien.
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <HeartbeatIcon size={16} className="text-primary mt-0.5" />
              Jadwalkan follow-up sesuai rekomendasi.
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <FileTextIcon size={16} className="text-primary mt-0.5" />
              {note.isFinalized
                ? "Hasil sudah dapat dilihat oleh pasien."
                : "Finalize agar pasien dapat melihat hasil."}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default function DoctorSummaryResultsDetail({
  params,
}: {
  params: { id: string };
}) {
  const accessToken = authStore((s) => s.accessToken);
  const sessionId = params.id;

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
