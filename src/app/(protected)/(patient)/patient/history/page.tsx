"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpenTextIcon,
  CaretDownIcon,
  CircleNotchIcon,
  EmptyIcon,
  FadersHorizontalIcon,
  XIcon,
} from "@phosphor-icons/react";
import Button from "@/components/dashboard/ui/button/Button";
import Input from "@/components/dashboard/form/input/InputField";
import Badge from "@/components/dashboard/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import { Dropdown } from "@/components/dashboard/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/dashboard/ui/dropdown/DropdownItem";
import DataEmpty from "@/components/reusable/DataEmpty";
import { authStore } from "@/services/auth/auth.store";
import { usePatientSessionsQuery } from "@/services/consultations/consultations.queries";
import type { SessionStatus } from "@/services/consultations/consultations.dto";

type StatusFilterValue = "all" | SessionStatus;

const STATUS_LABEL: Record<string, string> = {
  CREATED: "Terjadwal",
  IN_CALL: "Sedang Berlangsung",
  COMPLETED: "Selesai",
  FAILED: "Gagal",
};

const STATUS_COLOR: Record<string, "success" | "warning" | "error" | "light"> = {
  CREATED: "light",
  IN_CALL: "warning",
  COMPLETED: "success",
  FAILED: "error",
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}

const PatientHistoryPage = () => {
  const router = useRouter();
  const accessToken = authStore((s) => s.accessToken);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: sessions, isLoading, isFetching, error } = usePatientSessionsQuery(
    accessToken,
    {
      search: search || undefined,
      sort,
      status: statusFilter === "all" ? undefined : statusFilter,
    },
  );

  const rows = sessions ?? [];

  const statusOptions: { value: StatusFilterValue; label: string }[] = [
    { value: "all", label: "Semua Status" },
    { value: "CREATED", label: "Terjadwal" },
    { value: "IN_CALL", label: "Sedang Berlangsung" },
    { value: "COMPLETED", label: "Selesai" },
    { value: "FAILED", label: "Gagal" },
  ];

  const sortOptions: { value: "newest" | "oldest"; label: string }[] = [
    { value: "newest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
  ];

  const activeStatusLabel =
    statusOptions.find((o) => o.value === statusFilter)?.label ?? "Filter";
  const activeSortLabel =
    sortOptions.find((o) => o.value === sort)?.label ?? "Terbaru";

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-cultured bg-card">
        <div className="flex flex-col gap-4 border-b border-cultured px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Riwayat Konsultasi</h3>
            <p className="mt-1 text-sm text-accent">
              Lihat semua sesi konsultasi yang pernah Anda lakukan.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-cultured px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Input
              placeholder="Cari nama dokter..."
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setIsSortOpen((p) => !p)}
                className="dropdown-toggle pr-10"
                endIcon={<CaretDownIcon />}
              >
                {activeSortLabel}
              </Button>
              <Dropdown isOpen={isSortOpen} onClose={() => setIsSortOpen(false)} className="w-36 p-2">
                {sortOptions.map((o) => (
                  <DropdownItem
                    variant={true}
                    key={o.value}
                    onItemClick={() => { setSort(o.value); setIsSortOpen(false); }}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium ${sort === o.value ? "bg-blue-500 text-white" : ""}`}
                  >
                    {o.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                startIcon={<FadersHorizontalIcon />}
                onClick={() => setIsFilterOpen((p) => !p)}
                className="dropdown-toggle"
              >
                {activeStatusLabel}
              </Button>
              <Dropdown isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} className="w-52 p-2">
                {statusOptions.map((o) => (
                  <DropdownItem
                    variant={true}
                    key={o.value}
                    onItemClick={() => { setStatusFilter(o.value); setIsFilterOpen(false); }}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium ${statusFilter === o.value ? "bg-blue-500 text-white" : ""}`}
                  >
                    {o.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            </div>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table>
              <TableHeader className="border-b border-cultured">
                <TableRow>
                  {["Dokter", "Tanggal & Waktu", "Durasi", "Mode", "Status", "Aksi"].map((h) => (
                    <TableCell
                      key={h}
                      isHeader
                      className={`px-6 py-4 text-theme-sm font-medium text-neutral-500 ${h === "Aksi" ? "text-end" : "text-start"}`}
                    >
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-cultured">
                {rows.map((item, i) => (
                  <TableRow
                    key={item.sessionId}
                    className={`${i % 2 ? "bg-neutral-800" : ""} hover:opacity-70 transition-all duration-300 cursor-pointer`}
                  >
                    <TableCell className="border-b border-cultured px-6 py-4 text-theme-sm text-white">
                      {item.doctorName ?? "-"}
                    </TableCell>
                    <TableCell className="border-b border-cultured px-6 py-4 text-theme-sm text-white">
                      {formatDateTime(item.scheduledStartTime)}
                    </TableCell>
                    <TableCell className="border-b border-cultured px-6 py-4 text-theme-sm text-white">
                      {item.durationMinutes ? `${item.durationMinutes} mnt` : "-"}
                    </TableCell>
                    <TableCell className="border-b border-cultured px-6 py-4 text-theme-sm text-white">
                      {item.consultationMode ?? "-"}
                    </TableCell>
                    <TableCell className="border-b border-cultured px-6 py-4 text-theme-sm">
                      <Badge
                        size="sm"
                        color={STATUS_COLOR[item.sessionStatus] ?? "light"}
                      >
                        {STATUS_LABEL[item.sessionStatus] ?? item.sessionStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="border-b border-cultured px-6 py-4 text-end">
                      <button
                        onClick={() =>
                          router.push(`/patient/summary-results/${item.sessionId}`)
                        }
                        disabled={item.sessionStatus !== "COMPLETED"}
                        className="flex items-center justify-center gap-x-2 rounded-lg border px-2 py-2 transition hover:scale-110 border-brand-900 bg-brand-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        title={
                          item.sessionStatus !== "COMPLETED"
                            ? "Konsultasi belum selesai"
                            : "Lihat hasil konsultasi"
                        }
                      >
                        <BookOpenTextIcon className="h-4 w-4 text-brand-500" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {isLoading || isFetching ? (
            <div className="p-6">
              <DataEmpty ItemIcon={CircleNotchIcon} value="Memuat" subValue="Riwayat Konsultasi" />
            </div>
          ) : error ? (
            <div className="p-6">
              <DataEmpty ItemIcon={XIcon} value="Gagal memuat" subValue="Riwayat Konsultasi" />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6">
              <DataEmpty ItemIcon={EmptyIcon} value="Belum ada data" subValue="Riwayat Konsultasi" />
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-accent">
            Menampilkan <span className="font-medium text-white">{rows.length}</span> sesi konsultasi
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryPage;
