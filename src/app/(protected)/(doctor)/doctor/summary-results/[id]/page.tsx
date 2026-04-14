"use client"

import Link from "next/link"
import {
  BrainIcon,
  DownloadSimpleIcon,
  FileTextIcon,
  HeartbeatIcon,
  ShieldCheckIcon,
  SparkleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type SummaryData = {
  id: string
  patient: string
  doctor: string
  date: string
  duration: string
  main: string
  diagnosis: string
  confidence: string
  findings: string[]
  recommendations: string[]
  riskFlags: { label: string; level: string }[]
  highlights: string[]
  medication: string[]
}

const summaryById: Record<string, SummaryData> = {
  "CN-20260310-01": {
    id: "CN-20260310-01",
    patient: "Alya Pramesti",
    doctor: "dr. Rafi",
    date: "10 Mar 2026",
    duration: "32 menit",
    main:
      "Pasien melaporkan nyeri lambung ringan sejak 3 hari terakhir, membaik setelah makan."
      + " Tidak ada riwayat alergi obat, tekanan darah stabil, dan tidur terganggu karena rasa mual.",
    diagnosis: "Gastritis ringan",
    confidence: "92% (tinggi)",
    findings: [
      "Keluhan utama: nyeri ulu hati setelah makan berat.",
      "Tidak ditemukan demam atau sesak napas.",
      "Riwayat: stres kerja tinggi dan pola makan tidak teratur.",
    ],
    recommendations: [
      "Atur pola makan kecil namun sering, hindari makanan pedas.",
      "Pertimbangkan antasida ringan sesuai resep.",
      "Monitoring gejala selama 7 hari dan laporkan bila memburuk.",
    ],
    riskFlags: [
      { label: "Interaksi obat", level: "Rendah" },
      { label: "Follow-up", level: "Dalam 7 hari" },
    ],
    highlights: [
      "Pasien sudah mencoba obat OTC namun belum konsisten.",
      "Keluhan meningkat saat telat makan.",
      "Tidak ada riwayat penyakit kronis yang dilaporkan.",
    ],
    medication: [
      "Antasida ringan 2x sehari setelah makan selama 5 hari.",
      "Hindari kafein dan makanan tinggi asam.",
      "Hubungi klinik bila nyeri memburuk atau muntah berulang.",
    ],
  },
  "CN-20260309-08": {
    id: "CN-20260309-08",
    patient: "Raka Saputra",
    doctor: "dr. Nisa",
    date: "09 Mar 2026",
    duration: "18 menit",
    main:
      "Pasien mengeluhkan batuk kering dan sakit tenggorokan ringan selama 2 hari."
      + " Tidak ada demam tinggi, namun ada riwayat alergi debu.",
    diagnosis: "Iritasi saluran napas atas",
    confidence: "88% (sedang)",
    findings: [
      "Keluhan memburuk saat malam hari.",
      "Tidak ada riwayat asma atau penyakit kronis lain.",
      "Pasien belum mengonsumsi obat spesifik.",
    ],
    recommendations: [
      "Perbanyak cairan hangat dan istirahat cukup.",
      "Hindari paparan debu dan asap rokok.",
      "Kontrol ulang jika muncul demam tinggi.",
    ],
    riskFlags: [
      { label: "Alergi", level: "Perlu monitoring" },
      { label: "Follow-up", level: "Dalam 3 hari" },
    ],
    highlights: [
      "Gejala ringan dan responsif terhadap istirahat.",
      "Tidak ada nyeri dada atau sesak napas.",
      "Pasien meminta rekomendasi penanganan rumahan.",
    ],
    medication: [
      "Lozenges atau pereda tenggorokan sesuai kebutuhan.",
      "Semprot saline untuk membantu iritasi.",
      "Hindari minuman dingin selama 2-3 hari.",
    ],
  },
  "CN-20260309-06": {
    id: "CN-20260309-06",
    patient: "Dimas Rahman",
    doctor: "dr. Sinta",
    date: "09 Mar 2026",
    duration: "--",
    main: "Sesi dibatalkan oleh pasien sebelum konsultasi dimulai.",
    diagnosis: "-",
    confidence: "Tidak tersedia",
    findings: ["Tidak ada ringkasan karena sesi dibatalkan."],
    recommendations: ["Jadwalkan ulang bila keluhan masih berlanjut."],
    riskFlags: [{ label: "Follow-up", level: "Opsional" }],
    highlights: ["Tidak ada data klinis yang direkam."],
    medication: ["-"],
  },
  "CN-20260308-11": {
    id: "CN-20260308-11",
    patient: "Maya Salim",
    doctor: "dr. Kevin",
    date: "08 Mar 2026",
    duration: "27 menit",
    main:
      "Pasien mengalami ruam ringan di area lengan kanan sejak 4 hari terakhir."
      + " Tidak ada demam, riwayat alergi makanan laut ringan.",
    diagnosis: "Dermatitis kontak ringan",
    confidence: "90% (tinggi)",
    findings: [
      "Ruam tidak menyebar dan tidak ada infeksi.",
      "Gatal meningkat setelah mandi air panas.",
      "Tidak ada keluhan sistemik lainnya.",
    ],
    recommendations: [
      "Gunakan pelembap hypoallergenic.",
      "Hindari sabun berpewangi untuk sementara.",
      "Monitoring 5 hari dan evaluasi ulang jika memburuk.",
    ],
    riskFlags: [
      { label: "Alergi", level: "Rendah" },
      { label: "Follow-up", level: "Dalam 5 hari" },
    ],
    highlights: [
      "Riwayat alergi ringan terkonfirmasi.",
      "Tidak ada demam atau pembengkakan.",
      "Pasien bersedia mengikuti perawatan topikal.",
    ],
    medication: [
      "Krim anti-inflamasi ringan sesuai resep.",
      "Hindari menggaruk area ruam.",
      "Gunakan pakaian berbahan lembut.",
    ],
  },
  "CN-20260308-04": {
    id: "CN-20260308-04",
    patient: "Syifa Lestari",
    doctor: "dr. Rafi",
    date: "08 Mar 2026",
    duration: "14 menit",
    main:
      "Pasien melaporkan pusing ringan dan kelelahan setelah begadang selama 2 malam."
      + " Tidak ada mual berat atau gangguan penglihatan.",
    diagnosis: "Kelelahan ringan",
    confidence: "85% (sedang)",
    findings: [
      "Kurang tidur dan beban kerja meningkat.",
      "Tidak ada riwayat migrain kronis.",
      "Pasien belum konsumsi obat analgesik.",
    ],
    recommendations: [
      "Istirahat cukup dan kurangi aktivitas berat 24 jam.",
      "Perbanyak hidrasi dan konsumsi makanan bergizi.",
      "Kontrol ulang bila pusing berulang dalam 3 hari.",
    ],
    riskFlags: [
      { label: "Kelelahan", level: "Sedang" },
      { label: "Follow-up", level: "Dalam 3 hari" },
    ],
    highlights: [
      "Pasien bersedia memperbaiki pola tidur.",
      "Tidak ada tanda neurologis berat.",
      "Disarankan jeda layar digital sementara.",
    ],
    medication: [
      "Analgesik ringan jika diperlukan.",
      "Batasi kafein setelah pukul 16.00.",
      "Lakukan relaksasi sebelum tidur.",
    ],
  },
}

export default function SummaryResultsDetail({ params }: { params: { id: string } }) {
  const summary = summaryById[params.id]

  if (!summary) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">Summary Results</h1>
          <p className="text-sm text-muted-foreground">Summary untuk ID {params.id} belum tersedia.</p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Data Tidak Ditemukan</CardTitle>
            <CardDescription>Pastikan memilih item dari halaman History.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/history" className={cn(buttonVariants({ variant: "outline" }))}>
              Kembali ke History
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Summary Results</h1>
          <p className="text-sm text-muted-foreground">Detail AI untuk konsultasi {summary.id}.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/history" className={cn(buttonVariants({ variant: "outline" }))}>
            Kembali ke History
          </Link>
          <Button variant="outline" className="gap-2">
            <DownloadSimpleIcon size={16} />
            Unduh PDF
          </Button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Session Overview</CardTitle>
            <CardDescription>Ringkasan utama dan metadata konsultasi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <SparkleIcon size={12} />
                AI Generated
              </Badge>
              <Badge variant="outline">Updated {summary.date}</Badge>
            </div>
            <div className="rounded-lg border p-4 text-sm text-foreground">{summary.main}</div>
            <Separator />
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Pasien</p>
                <p className="font-medium">{summary.patient}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Dokter</p>
                <p className="font-medium">{summary.doctor}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Durasi</p>
                <p className="font-medium">{summary.duration}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Diagnosis</p>
                <p className="font-medium">{summary.diagnosis}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confidence & Risk</CardTitle>
            <CardDescription>Penilaian tingkat kepercayaan dan risiko.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg border p-2 text-primary">
                <BrainIcon size={18} weight="duotone" />
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium">Confidence Score</p>
                <p className="text-muted-foreground">{summary.confidence}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              {summary.riskFlags.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <span>{item.label}</span>
                  <Badge variant="secondary">{item.level}</Badge>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <WarningCircleIcon size={14} />
              Pastikan review manual sebelum finalisasi.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Key Findings</CardTitle>
            <CardDescription>Temuan utama dari sesi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {summary.findings.map((item) => (
              <div key={item} className="rounded-lg border p-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Langkah tindak lanjut yang disarankan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {summary.recommendations.map((item) => (
              <div key={item} className="rounded-lg border p-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Checklist untuk tim medis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <ShieldCheckIcon size={16} className="text-primary" />
              Verifikasi ulang riwayat alergi pasien.
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <HeartbeatIcon size={16} className="text-primary" />
              Jadwalkan follow-up sesuai rekomendasi.
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <FileTextIcon size={16} className="text-primary" />
              Kirim ringkasan ke pasien via email.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transcript Highlights</CardTitle>
            <CardDescription>Cuplikan penting dari percakapan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {summary.highlights.map((item) => (
              <div key={item} className="rounded-lg border p-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medication Plan</CardTitle>
            <CardDescription>Rencana terapi singkat.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {summary.medication.map((item) => (
              <div key={item} className="rounded-lg border p-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
