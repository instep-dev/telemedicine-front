"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/dashboard/common/PageBreadCrumb";
import Button from "@/components/dashboard/ui/button/Button";
import { DownloadIcon, PlusIcon } from "@phosphor-icons/react";
import { useCreateRoom } from "@/hooks/useCreateRoom";
import { authStore } from "@/services/auth/auth.store";
import { useAiResultsQuery } from "@/services/ai/ai.queries";

const CreateRoomButton = () => {
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

function formatDate(date?: string | null) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDuration(durationSec?: number | null) {
  if (!durationSec || durationSec <= 0) return "-";

  const min = Math.floor(durationSec / 60);
  const sec = durationSec % 60;

  if (min <= 0) return `${sec} detik`;
  if (sec <= 0) return `${min} menit`;

  return `${min} menit ${sec} detik`;
}

function getInitials(name?: string | null) {
  if (!name) return "DR";

  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() ?? "DR";

  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function normalizeStatus(aiStatus?: string | null) {
  return (aiStatus ?? "").trim().toUpperCase();
}

function getStatusBucket(aiStatus?: string | null) {
  const value = normalizeStatus(aiStatus);

  if (value === "SUCCESS") {
    return "success";
  }

  if (value === "FAILED" || value.includes("ERROR")) {
    return "failed";
  }

  return "in-progress";
}

function getStageLabel(aiStatus?: string | null) {
  const value = normalizeStatus(aiStatus);

  if (!value) return "Waiting to start";
  if (value === "PENDING") return "Waiting in queue";
  if (value === "IN_PROGRESS") return "AI processing started";
  if (value.includes("WAITING_RECORDING")) return "Waiting for recording";
  if (value.includes("RECORDING_STARTED")) return "Recording started";
  if (value.includes("RECORDING_COMPLETED")) return "Recording completed";
  if (value.includes("COMPOSITION_STARTED")) return "Preparing video composition";
  if (value.includes("DOWNLOADING_RECORDING")) return "Downloading recording";
  if (value.includes("MEDIA_READY")) return "Media ready";
  if (value.includes("EXTRACTING_AUDIO")) return "Extracting audio from MP4";
  if (value.includes("TRANSCRIBING")) return "Transcribing with Faster Whisper";
  if (value.includes("TRANSCRIPTION_READY")) return "Transcript ready";
  if (value.includes("SUMMARIZING")) return "Generating SOAP summary with Gemini";
  if (value === "SUCCESS") return "Success";
  if (value === "FAILED" || value.includes("ERROR")) return "Failed";

  return value.replaceAll("_", " ");
}

function getEstimatedTimeText(
  aiStatus?: string | null,
  createdAt?: string | null,
  durationSec?: number | null,
) {
  const bucket = getStatusBucket(aiStatus);
  if (bucket === "success") return "Finished";
  if (bucket === "failed") return "Stopped";

  const status = normalizeStatus(aiStatus);
  const callMinutes = durationSec ? Math.max(1, Math.ceil(durationSec / 60)) : 1;

  let estimatedTotalSec = 180;

  if (callMinutes <= 2) estimatedTotalSec = 90;
  else if (callMinutes <= 5) estimatedTotalSec = 150;
  else if (callMinutes <= 10) estimatedTotalSec = 240;
  else if (callMinutes <= 20) estimatedTotalSec = 420;
  else estimatedTotalSec = 600;

  if (status.includes("WAITING_RECORDING")) estimatedTotalSec = 120;
  if (status.includes("COMPOSITION")) estimatedTotalSec = 150;
  if (status.includes("DOWNLOADING_RECORDING")) estimatedTotalSec = 90;
  if (status.includes("EXTRACTING_AUDIO")) estimatedTotalSec = 120;
  if (status.includes("TRANSCRIBING")) estimatedTotalSec = Math.max(120, Math.floor(estimatedTotalSec * 0.7));
  if (status.includes("SUMMARIZING")) estimatedTotalSec = Math.max(60, Math.floor(estimatedTotalSec * 0.35));

  if (!createdAt) {
    const mins = Math.ceil(estimatedTotalSec / 60);
    return `Estimasi sekitar ${mins} menit`;
  }

  const started = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsedSec = Math.max(0, Math.floor((now - started) / 1000));
  const remainingSec = Math.max(15, estimatedTotalSec - elapsedSec);

  if (remainingSec < 60) return `Estimasi ${remainingSec} detik lagi`;

  const min = Math.floor(remainingSec / 60);
  const sec = remainingSec % 60;

  if (sec === 0) return `Estimasi ${min} menit lagi`;
  return `Estimasi ${min} menit ${sec} detik lagi`;
}

export default function AiSummary() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  useEffect(() => {
    setAccessToken(authStore.getState().accessToken);

    const unsubscribe = authStore.subscribe((state) => {
      setAccessToken(state.accessToken);
    });

    return () => unsubscribe();
  }, []);

  const { data, isLoading, isFetching, error } = useAiResultsQuery(
    accessToken,
    {
      limit: 18,
      sort: "newest",
      cursor,
    },
    true,
  );

  const items = data?.data ?? [];

  const grouped = useMemo(() => {
    return {
      success: items.filter((item) => getStatusBucket(item.aiStatus) === "success"),
      inProgress: items.filter((item) => getStatusBucket(item.aiStatus) === "in-progress"),
      failed: items.filter((item) => getStatusBucket(item.aiStatus) === "failed"),
    };
  }, [items]);

  const filterData = [
    { title: "All", value: "all", count: items.length },
    { title: "Success", value: "success", count: grouped.success.length },
    { title: "In Progress", value: "in-progress", count: grouped.inProgress.length },
    { title: "Failed", value: "failed", count: grouped.failed.length },
  ];

  const kanbanColumns = [
    {
      key: "in-progress",
      title: "In Progress",
      count: grouped.inProgress.length,
      tone: "bg-yellow-50 text-yellow-600",
      tasks: grouped.inProgress,
    },
    {
      key: "success",
      title: "Success",
      count: grouped.success.length,
      tone: "bg-green-50 text-green-600",
      tasks: grouped.success,
    },
    {
      key: "failed",
      title: "Failed",
      count: grouped.failed.length,
      tone: "bg-red-50 text-red-600",
      tasks: grouped.failed,
    },
  ].filter((column) => activeFilter === "all" || activeFilter === column.key);

  return (
    <main>
      <PageBreadcrumb pageTitle="AI Summary" />

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="inline-flex w-full flex-wrap items-center gap-2 rounded-lg bg-[#f2f4f7] p-0.5 text-sm lg:w-auto">
            {filterData.map((item, i) => {
              const color = [
                "bg-brand-50 text-primary",
                "bg-green-50 text-green-600",
                "bg-yellow-50 text-yellow-600",
                "bg-red-50 text-red-600",
              ];

              const isActive = activeFilter === item.value;

              return (
                <button
                  key={item.value}
                  onClick={() => setActiveFilter(item.value)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-medium transition-all duration-200 ${
                    isActive
                      ? "border-gray-200 bg-white text-gray-900 shadow-theme-xs"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <span>{item.title}</span>
                  <span
                    className={`flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isActive ? color[i] : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" startIcon={<DownloadIcon />}>
              {isFetching ? "Refreshing..." : "Auto Refresh 5s"}
            </Button>
            <CreateRoomButton />
          </div>
        </div>

        {grouped.inProgress.length > 0 && (
          <div className="mx-6 mb-0 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            {grouped.inProgress.length} AI summary sedang diproses di background.
          </div>
        )}

        {isLoading ? (
          <div className="border-t border-gray-100 p-6 text-sm text-gray-500">
            Loading AI summaries...
          </div>
        ) : error ? (
          <div className="border-t border-gray-100 p-6 text-sm text-red-500">
            Failed to load AI summaries.
          </div>
        ) : items.length === 0 ? (
          <div className="border-t border-gray-100 p-6 text-sm text-gray-500">
            Belum ada AI summary.
          </div>
        ) : (
          <>
            <div className="grid gap-6 border-t border-gray-100 p-6 lg:grid-cols-3">
              {kanbanColumns.map((column) => (
                <div key={column.key} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {column.title}
                      </h3>
                      <span
                        className={`flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${column.tone}`}
                      >
                        {column.count}
                      </span>
                    </div>

                    <button className="rounded-full px-2 text-gray-400 hover:text-gray-600">
                      ...
                    </button>
                  </div>

                  <div className="space-y-4">
                    {column.tasks.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                        Tidak ada data.
                      </div>
                    ) : (
                      column.tasks.map((task) => {
                        const bucket = getStatusBucket(task.aiStatus);

                        const badgeTone =
                          bucket === "success"
                            ? "bg-green-50 text-green-600"
                            : bucket === "failed"
                              ? "bg-red-50 text-red-600"
                              : "bg-yellow-50 text-yellow-600";

                        const avatarTone =
                          bucket === "success"
                            ? "bg-green-100 text-green-700"
                            : bucket === "failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700";

                        const stageLabel = getStageLabel(task.aiStatus);
                        const estimateText = getEstimatedTimeText(
                          task.aiStatus,
                          task.createdAt,
                          task.callSession?.durationSec,
                        );

                        return (
                          <div
                            key={task.id}
                            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {task.roomName || task.patientIdentity || "Untitled Summary"}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                  {task.summary || task.subjective || task.transcriptRaw || "-"}
                                </p>
                              </div>

                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarTone}`}
                              >
                                {getInitials(task.doctorName)}
                              </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                              <p className="text-xs font-medium text-gray-700">
                                Stage: {stageLabel}
                              </p>
                              {bucket === "in-progress" && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {estimateText}
                                </p>
                              )}
                              {bucket === "failed" && task.aiError && (
                                <p className="mt-1 line-clamp-2 text-xs text-red-500">
                                  {task.aiError}
                                </p>
                              )}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-2">
                                <span className="inline-block h-3 w-3 rounded-sm border border-gray-300" />
                                {formatDate(task.createdAt)}
                              </span>

                              <span className="flex items-center gap-2">
                                <span className="inline-block h-3 w-3 rounded-full border border-gray-300" />
                                {formatDuration(task.callSession?.durationSec)}
                              </span>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${badgeTone}`}
                              >
                                {task.aiStatus || "UNKNOWN"}
                              </span>

                              <Link
                                href={`/dashboard/ai-summary/${task.id}`}
                                className="text-xs font-medium text-brand-600 hover:text-brand-700"
                              >
                                See More
                              </Link>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>

            {data?.pagination?.hasMore && (
              <div className="border-t border-gray-100 p-6">
                <Button
                  variant="outline"
                  disabled={isFetching || !data.pagination.nextCursor}
                  onClick={() => {
                    if (data.pagination.nextCursor) {
                      setCursor(data.pagination.nextCursor);
                    }
                  }}
                >
                  {isFetching ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}