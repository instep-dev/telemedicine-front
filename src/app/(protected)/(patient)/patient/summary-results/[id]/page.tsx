"use client";

import Link from "next/link";
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
  XCircleIcon,
} from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { authStore } from "@/services/auth/auth.store";
import {
  useSoapNoteQuery,
  useSoapNoteStream,
} from "@/services/soap-notes/soap-notes.queries";
import type { SoapNoteDto } from "@/services/soap-notes/soap-notes.dto";

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

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap min-h-[48px]">
          {value || <span className="italic opacity-50">Belum diisi oleh dokter</span>}
        </p>
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

function NotFoundCard({ sessionId }: { sessionId: string }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Hasil Konsultasi</h1>
        <p className="text-sm text-muted-foreground">Sesi {sessionId}</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Data Tidak Ditemukan</CardTitle>
          <CardDescription>
            Hasil konsultasi tidak tersedia atau belum dapat diakses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/patient/history" className={cn(buttonVariants({ variant: "outline" }))}>
            Kembali ke Riwayat
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function PendingFinalizationCard({ sessionId }: { sessionId: string }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Hasil Konsultasi</h1>
        <p className="text-sm text-muted-foreground">Sesi {sessionId}</p>
      </header>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LockIcon size={20} className="text-muted-foreground" />
            <CardTitle>Menunggu Dokter</CardTitle>
          </div>
          <CardDescription>
            Hasil konsultasi Anda sedang ditinjau oleh dokter. Halaman ini akan otomatis
            memperbarui ketika dokter telah memfinalisasi hasilnya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-400">
            <SparkleIcon size={16} className="animate-pulse" />
            Menunggu finalisasi dari dokter...
          </div>
          <Link href="/patient/history" className={cn(buttonVariants({ variant: "outline" }))}>
            Kembali ke Riwayat
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryContent({ note }: { note: SoapNoteDto }) {
  const soapFields = [
    { field: "subjective" as const, label: "Subjective (Keluhan Pasien)" },
    { field: "objective" as const, label: "Objective (Temuan Fisik)" },
    { field: "assessment" as const, label: "Assessment (Diagnosis)" },
    { field: "plan" as const, label: "Plan (Rencana Pengobatan)" },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Hasil Konsultasi</h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan konsultasi Anda pada {formatDateTime(note.scheduledStartTime)}.
          </p>
        </div>
        <Link href="/patient/history" className={cn(buttonVariants({ variant: "outline" }))}>
          Kembali ke Riwayat
        </Link>
      </header>

      <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
        <CheckCircleIcon size={16} />
        Hasil konsultasi telah difinalisasi oleh dokter pada {formatDateTime(note.finalizedAt)}.
      </div>

      {/* Overview + Dokter */}
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Sesi</CardTitle>
            <CardDescription>Informasi konsultasi Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="gap-1 bg-green-500/10 text-green-400 border-green-500/20">
                <CheckCircleIcon size={12} />
                Sudah Difinalisasi
              </Badge>
              <Badge variant="outline">{formatDateTime(note.finalizedAt)}</Badge>
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
                <p className="text-xs text-muted-foreground">Dokter</p>
                <p className="font-medium">{note.doctorName ?? "-"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Waktu Konsultasi</p>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Info AI</CardTitle>
            <CardDescription>Ringkasan dibantu oleh AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border p-2 text-primary">
                <BrainIcon size={18} weight="duotone" />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Diproses oleh AI</p>
                <p className="text-muted-foreground text-xs">
                  Hasil SOAP telah ditinjau dan difinalisasi oleh dokter Anda.
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between rounded-lg border p-3">
                <span className="text-muted-foreground">Model AI</span>
                <span className="font-medium">{note.aiModel ?? "-"}</span>
              </div>
              <div className="flex justify-between rounded-lg border p-3">
                <span className="text-muted-foreground">Difinalisasi</span>
                <span className="font-medium">{formatDateTime(note.finalizedAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <WarningCircleIcon size={14} />
              Hasil telah diverifikasi oleh dokter Anda.
            </div>
          </CardContent>
        </Card>
      </section>

      {/* SOAP — read only */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <ClipboardTextIcon size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">SOAP Note</h2>
          <Badge variant="outline" className="gap-1 text-xs">
            <LockIcon size={10} />
            Hanya bisa dilihat
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {soapFields.map(({ field, label }) => (
            <ReadOnlyField key={field} label={label} value={note[field]} />
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Langkah Selanjutnya</CardTitle>
            <CardDescription>Rekomendasi dari dokter Anda.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <ShieldCheckIcon size={16} className="text-primary mt-0.5" />
              Ikuti instruksi pengobatan sesuai plan di atas.
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <HeartbeatIcon size={16} className="text-primary mt-0.5" />
              Jadwalkan follow-up jika keluhan berlanjut.
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <FileTextIcon size={16} className="text-primary mt-0.5" />
              Simpan hasil ini sebagai referensi kesehatan Anda.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default function PatientSummaryResultsDetail({
  params,
}: {
  params: { id: string };
}) {
  const accessToken = authStore((s) => s.accessToken);
  const sessionId = params.id;

  const { data: note, isLoading, error } = useSoapNoteQuery(accessToken, sessionId);

  // Subscribe to SSE — when doctor finalizes, cache updates automatically and re-render happens
  useSoapNoteStream(accessToken, sessionId, true);

  if (isLoading) return <LoadingSkeleton />;

  // 403 from backend means not finalized yet, or access denied
  if (error) {
    const status = (error as any)?.response?.status;
    if (status === 403) {
      // Check if it's a "not finalized" case by trying to show the pending view
      return <PendingFinalizationCard sessionId={sessionId} />;
    }
    return <NotFoundCard sessionId={sessionId} />;
  }

  if (!note) return <NotFoundCard sessionId={sessionId} />;

  // This shouldn't happen (backend returns 403 for unfinalized for patients)
  // but defensive check just in case
  if (!note.isFinalized) return <PendingFinalizationCard sessionId={sessionId} />;

  return <SummaryContent note={note} />;
}
