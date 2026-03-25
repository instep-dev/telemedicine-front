"use client";

import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "@/components/dashboard/common/PageBreadCrumb";
import Button from "@/components/dashboard/ui/button/Button";
import Input from "@/components/dashboard/form/input/InputField";
import Badge from "@/components/dashboard/ui/badge/Badge";
import Pagination from "@/components/dashboard/tables/Pagination";
import {
  CaretDownIcon,
  DownloadIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FadersHorizontalIcon,
  BookOpenTextIcon,
  SealCheckIcon,
} from "@phosphor-icons/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import { useCreateRoom } from "@/hooks/useCreateRoom";
import { authStore } from "@/services/auth/auth.store";
import { useCallsQuery } from "@/services/history/history.queries";

const PAGE_SIZE = 10;

const CreateRoomButton: React.FC = () => {
  const { handleCreateRoom, isCreating } = useCreateRoom();

  return (
    <Button
      onClick={handleCreateRoom}
      startIcon={<PlusIcon weight="bold" />}
      disabled={isCreating}
    >
      {isCreating ? "Creating..." : "Create Room"}
    </Button>
  );
};

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

  return `${datePart} ‣ ${timePart}`;
};

const getStatusColor = (status?: string | null): "success" | "warning" | "error" | "light" => {
  if (status === "COMPLETED") return "success";
  if (status === "FAILED") return "error";
  if (status === "STARTED" || status === "CONNECTED" || status === "RECORDING_READY") {
    return "warning";
  }
  return "light";
};

const HistoryPage = () => {
  const accessToken = authStore((s) => s.accessToken);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

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

  const currentCursor = cursorByPage[page];

  const { data, isLoading, isFetching, error } = useCallsQuery(
    accessToken,
    {
      limit: PAGE_SIZE,
      cursor: currentCursor,
      search: search || undefined,
      sort,
    },
    true,
  );

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

  // const handleNextPage = () => {
  //   if (data?.pagination?.hasMore) {
  //     setPage((prev) => prev + 1);
  //   }
  // };

  // const handlePrevPage = () => {
  //   if (page > 1) {
  //     setPage((prev) => prev - 1);
  //   }
  // };

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
      <PageBreadcrumb pageTitle="Consultations History" />

      <div className="overflow-hidden rounded-2xl border bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Consultations History
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your consultations and keep track.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" startIcon={<DownloadIcon />}>
              Export
            </Button>
            <CreateRoomButton />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              <MagnifyingGlassIcon />
            </span>
            <Input
              placeholder="Search room / identity / doctor..."
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
                className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <CaretDownIcon />
              </span>
            </div>

            <Button variant="outline" startIcon={<FadersHorizontalIcon />}>
              Filter
            </Button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1100px]">
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                <TableRow className="bg-[#f9fafb]/50">
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium tracking-tight text-black dark:text-gray-400 "
                  >
                    Doctor  
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium tracking-tight text-black dark:text-gray-400"
                  >
                    Patient
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium tracking-tight text-black dark:text-gray-400"
                  >
                    Room
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium tracking-tight text-black dark:text-gray-400"
                  >
                    Duration
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium tracking-tight text-black dark:text-gray-400"
                  >
                    Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start text-theme-sm font-medium tracking-tight text-black dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-end text-theme-sm font-medium tracking-tight text-black dark:text-gray-400"
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading || isFetching ? (
                  <TableRow>
                    <TableCell className="px-6 py-6 text-sm text-gray-500" colSpan={7}>
                      Loading calls...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-6 py-6 text-sm text-gray-500 flex items-center justify-center border w-full" colSpan={5}>
                      Tidak ada data call.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((item, i) => (
                    <TableRow key={item.id} className={`${i % 2 ? "bg-[#f9fafb]/50" : ""} hover:bg-[#f9fafb] transition-all duration-300 cursor-pointer`}>
                      <TableCell className="border-b border-gray-200 px-6 py-4 text-start">
                        <div className="block text-gray-500 text-theme-sm dark:text-white/90 flex items-center gap-x-2">
                          {item.doctorName ?? "-"}
                          <SealCheckIcon className="text-green-500" size={12} weight="fill"/>
                        </div>
                      </TableCell>

                      <TableCell className="group cursor-pointer border-b border-gray-200 p-6 relative text-theme-sm text-gray-500 dark:text-gray-400">
                        Fadlan Daris
                        <div className="absolute min-w-52 group-hover:opacity-100 opacity-0 -top-6 left-6 transition-all duration-200 rounded-br-lg rounded-t-lg text-xs bg-white shadow border">
                          <div className="p-2 relative">
                            {/* <div className="w-1 h-1 rounded-full bg-primary absolute -bottom-0.5 -left-0.5"/> */}
                            {item.patientIdentity}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="border-b border-gray-200 p-6 text-theme-sm text-gray-500 dark:text-gray-400">
                        {item.roomName ?? item.roomSid ?? "-"}
                      </TableCell>

                      <TableCell className="border-b border-gray-200 p-6 text-theme-sm text-gray-500 dark:text-gray-400">
                        {item.durationSec
                          ? `${Math.floor(item.durationSec / 60)} menit ${item.durationSec % 60} detik`
                          : "-"}
                      </TableCell>

                      <TableCell className="border-b border-gray-200 p-6 text-theme-sm text-gray-500 dark:text-gray-400">
                        {formatDate(item.createdAt)}
                      </TableCell>

                      <TableCell className="border-b border-gray-200 p-6 text-theme-sm text-gray-500 dark:text-gray-400">
                        <Badge size="sm"  color={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="border-b border-gray-200 p-6 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button className="flex items-center justify-center gap-x-2 rounded-lg border px-2 py-2 transition hover:border-brand-300 hover:text-brand-500 dark:border-gray-800 dark:text-gray-400">
                            <BookOpenTextIcon className="h-4 w-4 text-primary" />
                          </button>
                          <button className="flex items-center justify-center gap-x-2 rounded-lg border px-2 py-2 transition hover:border-red-300 hover:text-brand-500 dark:border-gray-800 dark:text-gray-400">
                            <TrashIcon className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium text-black">{rows.length}</span> item(s) on page <span className="font-medium text-black">{page}</span>
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page <span className="font-medium text-black">{rows.length}</span> of <span className="font-medium text-black">{totalPages}</span>
            </span>

            <div className="flex items-center gap-2">
              {/* <Button variant="outline" onClick={handlePrevPage} disabled={page === 1}>
                Prev
              </Button> */}

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />

              {/* <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={!data?.pagination?.hasMore}
              >
                Next
              </Button> */}
            </div>
          </div>
        </div>

        {error ? (
          <div className="px-6 pb-5 text-sm text-error-500">
            Gagal memuat data call.
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HistoryPage;