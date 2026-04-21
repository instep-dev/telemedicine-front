"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import {
  CardsIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CircleNotchIcon,
  EmptyIcon,
  FadersHorizontalIcon,
  SealCheckIcon,
  XIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { CallItemDto } from "@/services/history/history.dto";
import trimText from "@/hooks/useTrimText";
import DataEmpty from "@/components/reusable/DataEmpty";

type RecentConsultationsProps = {
  rows: CallItemDto[];
  loading?: boolean;
  error?: boolean;
  seeAllHref?: string;
  subtitle?: string;
  enableCursorPagination?: boolean;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 10;

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
      <span className="text-sm">{datePart} - {timePart}</span>
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

const findCursorStartIndex = (rows: CallItemDto[], cursor: string | null) => {
  if (!cursor) return 0;
  const cursorIndex = rows.findIndex((item) => item.id === cursor);
  if (cursorIndex === -1) return 0;
  return cursorIndex + 1;
};

export default function RecentConsultations({
  rows,
  loading = false,
  error = false,
  seeAllHref = "/history",
  subtitle = "5 last consultations",
  enableCursorPagination = false,
  pageSize = DEFAULT_PAGE_SIZE,
}: RecentConsultationsProps) {
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const normalizedPageSize = Math.max(1, pageSize);
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const validIds = useMemo(() => new Set(safeRows.map((item) => item.id)), [safeRows]);
  const resolvedCursorHistory = useMemo(() => {
    const normalized = cursorHistory.filter((entry, index) => {
      if (index === 0 && entry === null) return true;
      return !!entry && validIds.has(entry);
    });

    return normalized.length ? normalized : [null];
  }, [cursorHistory, validIds]);
  const cursor = resolvedCursorHistory[resolvedCursorHistory.length - 1] ?? null;

  const { visibleRows, hasNextPage } = useMemo(() => {
    if (!enableCursorPagination) {
      return {
        visibleRows: safeRows,
        hasNextPage: false,
      };
    }

    const startIndex = findCursorStartIndex(safeRows, cursor);
    const nextRows = safeRows.slice(startIndex, startIndex + normalizedPageSize);
    const hasNext = startIndex + normalizedPageSize < safeRows.length;

    return {
      visibleRows: nextRows,
      hasNextPage: hasNext,
    };
  }, [safeRows, enableCursorPagination, cursor, normalizedPageSize]);

  const rowsToRender = enableCursorPagination ? visibleRows : safeRows;
  const hasPrevPage = enableCursorPagination && resolvedCursorHistory.length > 1;

  const handleNextPage = () => {
    if (!enableCursorPagination || !hasNextPage || rowsToRender.length === 0) return;

    const nextCursor = rowsToRender[rowsToRender.length - 1].id;
    setCursorHistory([...resolvedCursorHistory, nextCursor]);
  };

  const handlePrevPage = () => {
    if (!enableCursorPagination || resolvedCursorHistory.length <= 1) return;
    setCursorHistory(resolvedCursorHistory.slice(0, -1));
  };

  return (
    <div className="overflow-hidden rounded-lg border border-cultured bg-card px-4 pb-3 pt-4 sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Recent Consultations
          </h3>
          <p className="mt-1 font-semibold text-accent text-theme-sm">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-2 rounded-lg border border-cultured bg-gradient-gray px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-gray-50 hover:hover:opacity-70 transition-all duration-300">
            <FadersHorizontalIcon />
            Filter
          </button>
          <Link
            href={seeAllHref}
            className="inline-flex items-center gap-2 rounded-lg border border-cultured bg-gradient-gray px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-gray-50 hover:hover:opacity-70 transition-all duration-300"
          >
            <CardsIcon />
            See all
          </Link>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table className="table-fixed">
          <TableHeader className="border-cultured border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-white text-start text-theme-xs w-[30%]"
              >
                Consultations
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-white text-start text-theme-xs w-[25%]"
              >
                Patients
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-white text-start text-theme-xs w-[30%]"
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-white text-start text-theme-xs w-[15%]"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rowsToRender.map((item) => {
              const doctorName = item.doctorName ?? "-";
              const consultationName = formatConsultationName(item);
              const patientName = formatPatientName(item);
              return (
                <TableRow key={item.id} className="align-top">
                  <TableCell className="py-4 align-top">
                    <div className="min-w-0">
                      <div className="flex items-center gap-x-1">
                        <p
                          className="font-medium text-white text-theme-sm truncate"
                          title={doctorName}
                        >
                          {trimText(doctorName, 32)}
                        </p>
                        <SealCheckIcon className="text-xs text-success-400" weight="fill" />
                      </div>
                      <span
                        className="block text-accent text-theme-xs truncate"
                        title={consultationName}
                      >
                        {trimText(consultationName, 22)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-white text-sm align-top">
                    <span className="block truncate" title={patientName}>
                      {trimText(patientName, 20)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-white text-sm align-top whitespace-nowrap">
                    {formatDate(item.startedAt ?? item.consultationStartedAt ?? item.createdAt)}
                  </TableCell>
                  <TableCell className="py-4 text-white text-sm align-top whitespace-nowrap">
                    <Badge size="sm" color={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {enableCursorPagination && !loading && !error && rowsToRender.length > 0 ? (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={!hasPrevPage}
            className="inline-flex items-center gap-1 rounded-md border border-cultured px-3 py-2 text-xs font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CaretLeftIcon size={14} />
            Prev
          </button>
          <button
            type="button"
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className="inline-flex items-center gap-1 rounded-md border border-cultured px-3 py-2 text-xs font-medium text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <CaretRightIcon size={14} />
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="">
          <DataEmpty ItemIcon={CircleNotchIcon} value="Loading" subValue="Consultations" />
        </div>
      ) : error ? (
        <div className="">
          <DataEmpty ItemIcon={XIcon} value="Failed to load" subValue="Consultations" />
        </div>
      ) : rowsToRender.length === 0 ? (
        <div className="">
          <DataEmpty ItemIcon={EmptyIcon} value="Data Empty" subValue="Starts consultations" />
        </div>
      ) : null}
    </div>
  );
}
