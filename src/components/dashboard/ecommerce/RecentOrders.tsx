"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { CardsIcon, FadersHorizontalIcon, SealCheckIcon } from "@phosphor-icons/react";
import Link from "next/link";
import type { CallItemDto } from "@/services/history/history.dto";
import trimText from "@/hooks/useTrimText";

type RecentConsultationsProps = {
  rows: CallItemDto[];
  loading?: boolean;
};

const formatDate = (date?: string | null) => {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  const datePart = parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timePart = parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex flex-col leading-tight">
      <span>{datePart}</span>
      <span className="text-xs text-gray-400">{timePart}</span>
    </div>
  );
};

const getStatusLabel = (status?: string | null): string => {
  if (status === "STARTED") return "STARTED";
  if (status === "CONNECTED") return "IN CALL";
  if (status === "RECORDING_READY") return "RECORDING";
  if (status === "COMPLETED") return "COMPLETED";
  if (status === "FAILED") return "FAILED";
  return status ?? "-";
};

const getStatusColor = (
  status?: string | null,
): "success" | "warning" | "error" | "light" => {
  if (status === "COMPLETED") return "success";
  if (status === "FAILED") return "error";
  if (status === "STARTED" || status === "CONNECTED" || status === "RECORDING_READY") {
    return "warning";
  }
  return "light";
};

const formatConsultationName = (item: CallItemDto) => {
  if (item.roomName) return item.roomName;
  if (item.roomSid) return item.roomSid;
  if (item.consultationId) return `Consultation ${item.consultationId.slice(0, 8)}`;
  return item.id;
};

const formatPatientName = (item: CallItemDto) => {
  return item.patientName ?? item.patientIdentity ?? "-";
};

export default function RecentConsultations({
  rows,
  loading = false,
}: RecentConsultationsProps) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent Consultations
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <FadersHorizontalIcon />
            Filter
          </button>
          <Link
            href={`/history`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <CardsIcon />
            See all
          </Link>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table className="table-fixed">
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[40%]"
              >
                Consultations
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[25%]"
              >
                Patients
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[20%]"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 w-[15%]"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell className="py-3 text-gray-500 text-theme-sm" colSpan={4}>
                  Loading consultations...
                </TableCell>
              </TableRow>
            ) : safeRows.length === 0 ? (
              <TableRow>
                <TableCell className="py-3 text-gray-500 text-theme-sm" colSpan={4}>
                  No consultations yet.
                </TableCell>
              </TableRow>
            ) : (
              safeRows.map((item) => {
                const doctorName = item.doctorName ?? "-";
                const consultationName = formatConsultationName(item);
                const patientName = formatPatientName(item);
                return (
                  <TableRow key={item.id} className="align-top">
                    <TableCell className="py-4 align-top">
                      <div className="min-w-0">
                        <div className="flex items-center gap-x-2">
                          <p
                            className="font-medium text-gray-800 text-theme-sm dark:text-white/90 truncate"
                            title={doctorName}
                          >
                            {trimText(doctorName, 32)}
                          </p>
                          <SealCheckIcon className="text-xs text-success-400" weight="fill"/>
                        </div>
                        <span
                          className="block text-gray-500 text-theme-xs dark:text-gray-400 truncate"
                          title={consultationName}
                        >
                          {trimText(consultationName, 22)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-gray-500 text-theme-sm dark:text-gray-400 align-top">
                      <span className="block truncate" title={patientName}>
                        {trimText(patientName, 20)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-gray-500 text-theme-sm dark:text-gray-400 align-top whitespace-nowrap">
                      {formatDate(item.startedAt ?? item.consultationStartedAt ?? item.createdAt)}
                    </TableCell>
                    <TableCell className="py-4 text-gray-500 text-theme-sm dark:text-gray-400 align-top whitespace-nowrap">
                      <Badge size="sm" color={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
