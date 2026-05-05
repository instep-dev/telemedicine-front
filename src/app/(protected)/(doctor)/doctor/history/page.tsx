"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/dashboard/ui/button/Button";
import Input from "@/components/dashboard/form/input/InputField";
import Badge from "@/components/dashboard/ui/badge/Badge";
import Pagination from "@/components/dashboard/tables/Pagination";
import {
  CaretDownIcon,
  DownloadIcon,
  PlusIcon,
  TrashIcon,
  FadersHorizontalIcon,
  BookOpenTextIcon,
  SealCheckIcon,
  CircleNotchIcon,
  XIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import { Dropdown } from "@/components/dashboard/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/dashboard/ui/dropdown/DropdownItem";
import { useCreateRoom } from "@/hooks/useCreateRoom";
import { authStore } from "@/services/auth/auth.store";
import { useCallsQuery } from "@/services/history/history.queries";
import { formatDuration } from "@/hooks/useDurationFormat";
import DataEmpty from "@/components/reusable/DataEmpty";
import { EmptyIcon } from "@phosphor-icons/react";
import useTrimText from "@/hooks/useTrimText";

const PAGE_SIZE = 10;

const formatDate = (date: any) => {
  const d = new Date(date);

  const datePart = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timePart = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex items-center gap-x-1">
      {datePart}
      <div className="w-1 h-1 bg-gray-400 rounded-full"/>
      {timePart}
    </div>
   
  )
};

const getStatusLabel = (status?: string | null): string => {
  if (status === "STARTED") return "STARTED";
  if (status === "CONNECTED") return "IN CALL";
  if (status === "RECORDING_READY") return "RECORDING";
  if (status === "COMPLETED") return "COMPLETED";
  if (status === "FAILED") return "FAILED";
  return status ?? "-";
};

const getStatusColor = (status?: string | null): "success" | "warning" | "error" | "light" => {
  if (status === "COMPLETED") return "success";
  if (status === "FAILED") return "error";
  if (status === "STARTED" || status === "CONNECTED" || status === "RECORDING_READY") {
    return "warning";
  }
  return "light";
};

type StatusFilterValue =
  | "all"
  | "STARTED"
  | "CONNECTED"
  | "RECORDING_READY"
  | "COMPLETED"
  | "FAILED";

const HistoryPage = () => {
  const router = useRouter();
  const accessToken = authStore((s) => s.accessToken);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const [cursorByPage, setCursorByPage] = useState<Record<number, string | undefined>>({
    1: undefined,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
      setCursorByPage({ 1: undefined });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    setCursorByPage({ 1: undefined });
  }, [sort]);

  useEffect(() => {
    setPage(1);
    setCursorByPage({ 1: undefined });
  }, [statusFilter]);

  const currentCursor = cursorByPage[page];

  const { data, isLoading, isFetching, error } = useCallsQuery(
    accessToken,
    {
      limit: PAGE_SIZE,
      cursor: currentCursor,
      search: search || undefined,
      sort,
      status: statusFilter === "all" ? undefined : statusFilter,
    },
    true,
  );

  const statusOptions: { value: StatusFilterValue; label: string }[] = [
    { value: "all", label: "All" },
    { value: "COMPLETED", label: "Completed" },
    { value: "FAILED", label: "Failed" },
    { value: "CONNECTED", label: "In Call" },
    { value: "RECORDING_READY", label: "Recording" },
    { value: "STARTED", label: "Started" },
  ];

  const activeStatusLabel =
    statusOptions.find((option) => option.value === statusFilter)?.label ?? "Filter";

  const sortOptions: { value: "newest" | "oldest"; label: string }[] = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ];

  const activeSortLabel =
    sortOptions.find((option) => option.value === sort)?.label ?? "Newest";

  useEffect(() => {
    const nextCursor = data?.pagination?.nextCursor;
    const hasMore = data?.pagination?.hasMore;

    if (hasMore && nextCursor) {
      setCursorByPage((prev) => {
        if (prev[page + 1] === nextCursor) return prev;
        return {
          ...prev,
          [page + 1]: nextCursor,
        };
      });
    }
  }, [data, page]);

  const totalPages = useMemo(() => {
    if (!data) return page;
    return data.pagination.hasMore ? page + 1 : page;
  }, [data, page]);

  const rows = data?.data ?? [];

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;
    if (nextPage < page) {
      setPage(nextPage);
      return;
    }

    if (nextPage === page + 1 && data?.pagination?.hasMore) {
      setPage(nextPage);
    } 
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-cultured bg-card">
        <div className="flex flex-col gap-4 border-b border-cultured px-6 py-5 sm:flex-row sm:items-center sm:justify-between ">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Consultations History
            </h3>
            <p className="mt-1 text-sm text-accent">
              Manage your consultations and keep track.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-cultured px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Input
              placeholder="Patient name"
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={MagnifyingGlassIcon}
            />
          </div>
 
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className="dropdown-toggle pr-10"
                endIcon={<CaretDownIcon />}
              >
                {activeSortLabel}
              </Button>
              <Dropdown
                isOpen={isSortOpen}
                onClose={() => setIsSortOpen(false)}
                className="w-36 p-2"
              >
                {sortOptions.map((option) => {
                  const isActive = option.value === sort;
                  return (
                    <DropdownItem
                      variant={true}
                      key={option.value}
                      onItemClick={() => {
                        setSort(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium ${
                        isActive ? "bg-blue-500 text-white" : ""
                      }`}
                    >
                      {option.label}
                    </DropdownItem>
                  );
                })}
              </Dropdown>
            </div>

            <div className="relative">
              <Button
                variant="outline"
                startIcon={<FadersHorizontalIcon />}
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="dropdown-toggle"
              >
                {activeStatusLabel}
              </Button>
              <Dropdown
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                className="w-44 p-2 "
              >
                {statusOptions.map((option) => {
                  const isActive = option.value === statusFilter;
                  return (
                    <DropdownItem
                      variant={true}
                      key={option.value}
                      onItemClick={() => {
                        setStatusFilter(option.value);
                        setIsFilterOpen(false);
                      }}
                      className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium ${
                        isActive
                          ? "bg-blue-500 text-white"
                          : ""
                      }`}
                    >
                      {option.label}
                    </DropdownItem>
                  );
                })}
              </Dropdown>
            </div>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1100px]">
            <Table>
              <TableHeader className="border-b border-cultured">
                <TableRow className="">
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium text-neutral-500 "
                  >
                    Doctor  
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium text-neutral-500"
                  >
                    Patient
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium text-neutral-500"
                  >
                    Room
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium text-neutral-500"
                  >
                    Duration
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium text-neutral-500"
                  >
                    Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium text-neutral-500"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-end text-theme-sm font-medium text-neutral-500"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-cultured">
                {rows.map((item, i) => (
                  <TableRow key={item.id} className={` hover:opacity-70 transition-all duration-300 cursor-pointer`}>
                    <TableCell className="border-b border-cultured px-6 py-4 text-start group relative">
                      <div className="block text-theme-sm text-white flex items-center gap-x-1">
                        {useTrimText(item.doctorName ?? "-", 15)}
                        <SealCheckIcon className="text-blue-500" size={12} weight="fill"/>
                      </div>
                      <div className="absolute w-auto min-w-42 group-hover:opacity-100 opacity-0 -top-2 left-6 transition-all duration-200 rounded-br-lg rounded-t-lg text-xs bg-gradient-gray shadow border border-cultured">
                        <div className="p-2 relative">
                          {item.doctorName ?? "-"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="group cursor-pointer border-b border-cultured p-6 relative text-theme-sm text-white">
                      {useTrimText(item.patientName ?? "-", 15)}
                      <div className="absolute w-auto group-hover:opacity-100 opacity-0 -top-2 left-6 transition-all duration-200 rounded-br-lg rounded-t-lg text-xs bg-gradient-gray shadow border border-cultured">
                        <div className="p-2 relative">
                          {item.patientName ?? "-"}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="border-b border-cultured p-6 text-theme-sm text-white">
                      {useTrimText(item.roomName ?? item.roomSid ?? "-", 15)}
                    </TableCell>

                    <TableCell className="border-b border-cultured p-6 text-theme-sm text-white">
                      {formatDuration(item.durationSec)}
                    </TableCell>

                    <TableCell className="border-b border-cultured p-6 text-theme-sm text-white">
                      {formatDate(item.createdAt)}
                    </TableCell>

                    <TableCell className="border-b border-cultured p-6 text-theme-sm text-white">
                      <Badge size="sm" color={getStatusColor(item.status)}>
                        {getStatusLabel(item.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="border-b border-cultured p-6 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/doctor/summary-results/${item.consultationId}`)}
                          disabled={!item.consultationId}
                          className="flex items-center justify-center gap-x-2 rounded-lg border px-2 py-2 transition hover:scale-110 border-brand-900 bg-brand-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="View Summary"
                        >
                          <BookOpenTextIcon className="h-4 w-4 text-brand-500" />
                        </button>
                        <button className="flex items-center justify-center gap-x-2 rounded-lg border px-2 py-2 transition hover:scale-110 border-red-950 bg-red-500/10">
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {isLoading || isFetching ? (
            <div className="p-6">
              <DataEmpty ItemIcon={CircleNotchIcon} value="Loading" subValue="Consultations" />
            </div>
          ) : error ? (
            <div className="p-6">
              <DataEmpty ItemIcon={XIcon} value="Failed to load" subValue="Consultations" />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6">
              <DataEmpty ItemIcon={EmptyIcon} value="Data Empty" subValue="Starts consultations" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-accent">
            Showing <span className="font-medium text-white">{rows.length}</span> item(s) on page <span className="font-medium text-white">{page}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-sm text-accent">
              Page <span className="font-medium text-white">{page}</span> of <span className="font-medium text-white">{totalPages}</span>
            </span>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
