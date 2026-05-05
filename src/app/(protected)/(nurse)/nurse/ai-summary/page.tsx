"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/dashboard/ui/button/Button";
import {
  ArrowUpRightIcon,
  CircleNotchIcon,
  CheckIcon,
  SealWarningIcon,
  InfoIcon,
  XIcon,
  EmptyIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { authStore } from "@/services/auth/auth.store";
import { useAiResultsQuery, useAiStatusStream } from "@/services/ai/ai.queries";
import type { AiSsePayload } from "@/services/ai/ai.queries";
import type { AiResultItemDto } from "@/services/ai/ai.dto";
import { CalendarCheckIcon } from "@phosphor-icons/react/dist/ssr";
import { formatDuration } from "@/hooks/useDurationFormat";
import { getInitials } from "@/hooks/useInitials";
import { bucketStatus } from "@/hooks/useBucketStatus";
import DataEmpty from "@/components/reusable/DataEmpty";
import trimText from "@/hooks/useTrimText";
import Input from "@/components/dashboard/form/input/InputField";

const ITEMS_PER_PAGE = 10;

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function normalizeStatus(aiStatus?: string | null) {
  return (aiStatus ?? "").trim().toUpperCase();
}

function getStatusBucket(aiStatus?: string | null) {
  const value = normalizeStatus(aiStatus);
  if (value === "SUCCESS") return "success";
  if (value === "FAILED" || value.includes("ERROR")) return "failed";
  return "in-progress";
}

function getStageLabel(aiStatus?: string | null) {
  const value = normalizeStatus(aiStatus);
  if (!value) return "Waiting to start";
  if (value === "PENDING") return "Waiting in queue";
  if (value === "IN_PROGRESS") return "AI processing started";
  if (value === "SUCCESS") return "Success";
  if (value === "FAILED" || value.includes("ERROR")) return "Failed";
  return value.replaceAll("_", " ");
}

function getLabel(aiStatus?: string | null) {
  const value = normalizeStatus(aiStatus);
  if (!value) return "Waiting to start";
  if (value === "PENDING") return "PENDING";
  if (value === "IN_PROGRESS") return "IN PROGRESS";
  if (value === "SUCCESS") return "Success";
  if (value === "FAILED" || value.includes("ERROR")) return "Failed";
  return value.replaceAll("_", " ");
}

type TaskCardProps = {
  task: AiResultItemDto;
  onViewSummary: (sessionId: string) => void;
};

const TaskCard = ({ task, onViewSummary }: TaskCardProps) => {
  const bucket = getStatusBucket(task.aiStatus);
  const summaryText = trimText(task.summary, 40);
  const aiErrorText = trimText(task.aiError, 40);

  const badgeTone =
    bucket === "success"
      ? "bg-green-500/10 text-green-600 border border-green-900"
      : bucket === "failed"
        ? "bg-red-500/10 text-red-600 border border-red-950"
        : "bg-yellow-500/10 text-yellow-600 border border-yellow-900";

  const avatarTone =
    bucket === "success"
      ? "bg-green-500/10 text-green-600 border border-green-900"
      : bucket === "failed"
        ? "bg-red-500/10 text-red-600 border border-red-950"
        : "bg-yellow-500/10 text-yellow-600 border border-yellow-900";

  const stageLabel = getStageLabel(task.aiStatus);

  return (
    <div
      className="rounded-lg border border-cultured bg-card p-6 shadow-theme-xs hover:scale-102 transition-all duration-300 hover:opacity-70 cursor-pointer"
      onClick={() => bucket === "success" && task.consultationId && onViewSummary(task.consultationId)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-white flex items-center gap-1">
            <UserIcon weight="fill" className="text-neutral-500" />
            <p>{task.patientName || "-"}</p>
          </div>
          <div className="line-clamp-2 text-xs text-neutral-500 flex items-center gap-1">
            {task.roomName || task.patientIdentity || "-"}
          </div>
          <p className="mt-1 line-clamp-2 text-xs">
            {bucketStatus(bucket, summaryText)}
          </p>
        </div>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${avatarTone}`}>
          {getInitials(task.patientName || task.patientIdentity)}
        </div>
      </div>

      <div className="mt-6 rounded-md border border-cultured bg-gradient-to-b from-neutral-900 to-[#1e1e1f] p-4">
        <p className="text-sm font-medium text-white">{stageLabel}</p>
        {bucket === "success" && (
          <div className="mt-2 flex gap-x-2 items-center">
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-green-500/10 border border-green-900">
              <CheckIcon className="text-[10px] text-green-600" weight="bold" />
            </div>
            <p className="text-xs text-green-600">{summaryText}</p>
          </div>
        )}
        {bucket === "in-progress" && (
          <div className="mt-2 text-xs text-neutral-500 flex items-center gap-x-2">
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-yellow-500/10 border border-yellow-900">
              <CircleNotchIcon className="text-xs text-yellow-600 animate-spin" weight="bold" />
            </div>
            Processing...
          </div>
        )}
        {bucket === "failed" && task.aiError && (
          <div className="mt-2 flex gap-x-2 items-center">
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-red-500/10 border border-red-950">
              <SealWarningIcon className="text-xs text-red-600" weight="bold" />
            </div>
            <p className="text-xs text-red-500">{aiErrorText}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <CalendarCheckIcon weight="bold" />
          {formatDate(task.createdAt)}
        </span>
        <div className="w-1 h-1 bg-neutral-500 rounded-full" />
        <span className="flex items-center gap-1">
          {formatDuration(task.callSession?.durationSec)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className={`inline-flex uppercase items-center rounded-md px-3 py-1 text-xs font-medium ${badgeTone}`}>
          {getLabel(task.aiStatus || "unknown")}
        </span>
        {bucket === "success" && task.consultationId && (
          <div onClick={(e) => e.stopPropagation()}>
            <Button size="sm" onClick={() => onViewSummary(task.consultationId)} endIcon={<ArrowUpRightIcon weight="bold" />}>
              View Summary
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function NurseAiSummaryPage() {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allItems, setAllItems] = useState<AiResultItemDto[]>([]);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);
  const [sseActive, setSseActive] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const isLoadingMoreRef = useRef(false);
  const cursorRef = useRef<string | undefined>(undefined);
  const prevSearchQueryRef = useRef("");

  const updateCursor = (newCursor: string | undefined) => {
    cursorRef.current = newCursor;
    setCursor(newCursor);
  };

  useEffect(() => {
    setAccessToken(authStore.getState().accessToken);
    const unsubscribe = authStore.subscribe((state) => setAccessToken(state.accessToken));
    return () => unsubscribe();
  }, []);

  const { data, isLoading, error, isFetching } = useAiResultsQuery(
    accessToken,
    { limit: ITEMS_PER_PAGE, sort: "newest", cursor, search: searchQuery || undefined },
    true,
    false, // polling disabled — SSE handles live updates
  );

  useAiStatusStream(accessToken, (payload: AiSsePayload) => {
    setSseActive(true);
    setAllItems(prev =>
      prev.map(item =>
        item.id === payload.noteId
          ? {
              ...item,
              aiStatus: payload.aiStatus,
              aiError: payload.aiError,
              summary: payload.summary ?? item.summary,
              subjective: payload.subjective ?? item.subjective,
              objective: payload.objective ?? item.objective,
              assessment: payload.assessment ?? item.assessment,
              plan: payload.plan ?? item.plan,
              summarizedAt: payload.summarizedAt ?? item.summarizedAt,
              transcribedAt: payload.transcribedAt ?? item.transcribedAt,
            }
          : item,
      ),
    );
  });

  // Accumulate fetched pages into allItems
  useEffect(() => {
    if (!data?.data) return;

    if (isLoadingMoreRef.current) {
      isLoadingMoreRef.current = false;
      setAllItems(prev => {
        const existingIds = new Set(prev.map(i => i.id));
        return [...prev, ...data.data.filter(i => !existingIds.has(i.id))];
      });
      setDisplayLimit(v => v + ITEMS_PER_PAGE);
    } else {
      setAllItems(prev => {
        if (prev.length === 0) return data.data;
        const freshById = new Map(data.data.map(i => [i.id, i]));
        const existingIds = new Set(prev.map(i => i.id));
        const brandNew = cursorRef.current === undefined
          ? data.data.filter(i => !existingIds.has(i.id))
          : [];
        return [...brandNew, ...prev.map(i => freshById.get(i.id) ?? i)];
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleViewSummary = (sessionId: string) => {
    router.push(`/nurse/summary-results/${sessionId}`);
  };

  const handleShowMore = () => {
    if (displayLimit < allItems.length) {
      setDisplayLimit(v => v + ITEMS_PER_PAGE);
    } else if (data?.pagination?.hasMore && data.pagination.nextCursor) {
      isLoadingMoreRef.current = true;
      updateCursor(data.pagination.nextCursor);
    }
  };

  const handleShowLess = () => {
    setDisplayLimit(v => Math.max(ITEMS_PER_PAGE, v - ITEMS_PER_PAGE));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed === prevSearchQueryRef.current) return;
      prevSearchQueryRef.current = trimmed;
      setSearchQuery(trimmed);
      updateCursor(undefined);
      setAllItems([]);
      setDisplayLimit(ITEMS_PER_PAGE);
      isLoadingMoreRef.current = false;
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);


  const visibleItems = allItems.slice(0, displayLimit);

  const grouped = useMemo(() => ({
    success: visibleItems.filter((item) => getStatusBucket(item.aiStatus) === "success"),
    inProgress: visibleItems.filter((item) => getStatusBucket(item.aiStatus) === "in-progress"),
    failed: visibleItems.filter((item) => getStatusBucket(item.aiStatus) === "failed"),
  }), [visibleItems]);

  const filterData = [
    { title: "All", value: "all", count: visibleItems.length },
    { title: "Success", value: "success", count: grouped.success.length },
    { title: "In Progress", value: "in-progress", count: grouped.inProgress.length },
    { title: "Failed", value: "failed", count: grouped.failed.length },
  ];

  const kanbanColumns = [
    { key: "in-progress", title: "In Progress", count: grouped.inProgress.length, tone: "bg-yellow-500/10 text-yellow-600 border border-yellow-900", tasks: grouped.inProgress },
    { key: "success", title: "Success", count: grouped.success.length, tone: "bg-green-500/10 text-green-600 border border-green-900", tasks: grouped.success },
    { key: "failed", title: "Failed", count: grouped.failed.length, tone: "bg-red-500/10 text-red-600 border border-red-950", tasks: grouped.failed },
  ].filter((col) => activeFilter === "all" || activeFilter === col.key);

  const isAllView = activeFilter === "all";
  const singleColumn = !isAllView ? kanbanColumns[0] : null;
  const displayedCount = isAllView ? visibleItems.length : (singleColumn?.tasks.length ?? 0);

  const canShowMore = displayLimit < allItems.length || (data?.pagination?.hasMore ?? false);
  const canShowLess = displayLimit > ITEMS_PER_PAGE;

  return (
    <main>
      <div className="rounded-tl-lg rounded-tr-lg border-x border-t border-cultured bg-card h-auto">
        <div className="p-4 sm:p-6 space-y-4">
          <div className="relative w-full md:max-w-xs">
            <Input
              placeholder="Search patient name"
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={MagnifyingGlassIcon}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
              <div className="inline-flex items-center gap-1 rounded-lg bg-card border border-cultured p-0.5 text-sm">
                {filterData.map((item, i) => {
                  const color = [
                    "bg-brand-500/10 text-white border border-brand-900",
                    "bg-green-500/10 text-green-600 border border-green-900",
                    "bg-yellow-500/10 text-yellow-600 border border-yellow-900",
                    "bg-red-500/10 text-red-600 border border-red-950",
                  ];
                  const isActive = activeFilter === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setActiveFilter(item.value)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium whitespace-nowrap transition-all duration-200 ${isActive ? "bg-gradient-gray text-white shadow-theme-xs" : "text-accent"}`}
                    >
                      <span>{item.title}</span>
                      <span className={`flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${isActive ? color[i] : ""}`}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-cultured bg-card text-xs text-neutral-400 shrink-0">
              <span className={`w-2 h-2 rounded-full ${sseActive ? "bg-green-500 animate-pulse" : "bg-neutral-600"}`} />
              <span className="hidden sm:inline">{sseActive ? "Live" : "Connecting"}</span>
            </div>
          </div>
        </div>

        {grouped.inProgress.length > 0 && (
          <div className="mx-4 sm:mx-6 mb-4 rounded-lg border border-yellow-900 bg-gradient-to-r from-yellow-500/10 to-bg-card px-4 py-3 text-sm text-yellow-600 flex items-center gap-x-2">
            <InfoIcon className="text-base" />
            <p><span className="font-semibold mr-1.5">{grouped.inProgress.length}</span>Consultations AI Summary background process</p>
          </div>
        )}

        {isLoading ? (
          <div className="p-6"><DataEmpty ItemIcon={CircleNotchIcon} value="Loading" subValue="AI Summaries" /></div>
        ) : error ? (
          <div className="p-6"><DataEmpty ItemIcon={XIcon} value="Failed to load" subValue="Summaries" /></div>
        ) : displayedCount === 0 ? (
          <div className="p-6"><DataEmpty ItemIcon={EmptyIcon} value="Data Empty" subValue="No assigned sessions yet" /></div>
        ) : (
          <>
            {isAllView ? (
              <div className="border-t border-cultured">
                {/* Mobile: horizontal swipe kanban */}
                <div className="flex items-start gap-4 overflow-x-auto px-4 py-4 sm:hidden no-scrollbar snap-x snap-mandatory">
                  {kanbanColumns.map((column) => (
                    <div key={column.key} className="min-w-[82vw] snap-start space-y-3 rounded-lg border border-cultured bg-card/50 p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                        <span className={`flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${column.tone}`}>
                          {column.count}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {column.tasks.length === 0 ? (
                          <DataEmpty ItemIcon={EmptyIcon} value="Data Empty" subValue="No results" />
                        ) : (
                          column.tasks.map((task) => (
                            <TaskCard key={task.id} task={task} onViewSummary={handleViewSummary} />
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Desktop: 3-column grid */}
                <div className="hidden sm:grid gap-6 p-6 lg:grid-cols-3">
                  {kanbanColumns.map((column) => (
                    <div key={column.key} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                        <span className={`flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${column.tone}`}>
                          {column.count}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {column.tasks.length === 0 ? (
                          <DataEmpty ItemIcon={EmptyIcon} value="Data Empty" subValue="No results" />
                        ) : (
                          column.tasks.map((task) => (
                            <TaskCard key={task.id} task={task} onViewSummary={handleViewSummary} />
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border-t border-cultured p-4 sm:p-6">
                {singleColumn && (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-sm font-semibold text-white">{singleColumn.title}</h3>
                      <span className={`flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${singleColumn.tone}`}>
                        {singleColumn.count}
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {singleColumn.tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onViewSummary={handleViewSummary} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <div className="p-4 border border-cultured bg-card rounded-bl-lg rounded-br-lg">
        <div className="flex items-center gap-2">
          {canShowMore && (
            <button
              onClick={handleShowMore}
              disabled={isFetching}
              className="px-2 py-1 border rounded-md bg-brand-500/10 text-brand-600 border border-brand-950 text-xs border-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? "Loading..." : "Show more"}
            </button>
          )}
          {canShowLess && (
            <button
              onClick={handleShowLess}
              className="px-2 py-1 border rounded-md bg-neutral-500/10 text-neutral-400 border border-neutral-700 text-xs"
            >
              Show less
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
