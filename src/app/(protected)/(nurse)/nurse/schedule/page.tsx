"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { authStore } from "@/services/auth/auth.store";
import { useNurseSessionsQuery } from "@/services/consultations/consultations.queries";
import type { ConsultationSessionDto } from "@/services/consultations/consultations.dto";
import { XIcon, ArrowRightIcon } from "@phosphor-icons/react";
import WeeklyCalendar from "@/components/dashboard/tables/WeeklyCalendar";
import { SESSION_STATUS_COLOR, SESSION_STATUS_LABEL } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-accent text-xs w-24 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

export default function NurseSchedulePage() {
  const router = useRouter();
  const { accessToken } = useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getState(),
    () => authStore.getState(),
  );

  const sessionsQuery = useNurseSessionsQuery(accessToken, { sort: "oldest" }, true);
  const allSessions = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data]);

  const [detail, setDetail] = useState<ConsultationSessionDto | null>(null);
  const canJoin = detail?.nurseJoinState === "JOIN";
  const isJoined = detail?.nurseJoinState === "JOINED";
  const sessionEnded = detail?.sessionStatus === "COMPLETED" || detail?.sessionStatus === "FAILED";

  return (
    <>
      <WeeklyCalendar
        sessions={allSessions}
        isFetching={sessionsQuery.isFetching}
        onSessionClick={setDetail}
        renderSessionTitle={(s) => `${s.doctorName ?? "Doctor"} × ${s.patientName ?? "Patient"}`}
      />

      <div className={`fixed min-h-screen py-4 sm:py-20 flex items-center justify-center inset-0 z-[9999999] transition-all duration-300 ${detail ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 transition-all duration-300 ${detail ? "bg-background/20 backdrop-blur-[10px]" : "bg-background/0 backdrop-blur-none"}`}
          onClick={() => setDetail(null)}
        />
        <div className={`${detail ? "scale-100 opacity-100" : "scale-75 opacity-0"} transition-all duration-300 w-[calc(100%-2rem)] sm:w-[450px] max-w-[450px] relative bg-card border border-cultured rounded-lg flex flex-col shadow-2xl`}>
          {detail && (
            <>
              <div className="flex items-center justify-between px-5 py-4 border-b border-cultured">
                <div>
                  <p className="text-xs text-accent font-mono">{detail.sessionId}</p>
                  <h3 className="font-semibold text-sm mt-0.5">Session Detail</h3>
                </div>
                <button onClick={() => setDetail(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <XIcon size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium ${SESSION_STATUS_COLOR[detail.sessionStatus]}`}>
                  {SESSION_STATUS_LABEL[detail.sessionStatus] ?? detail.sessionStatus}
                </div>

                <div className="space-y-3 pt-1">
                  <DetailRow label="Doctor" value={detail.doctorName ?? "-"} />
                  <DetailRow label="Patient" value={detail.patientName ?? "-"} />
                  <DetailRow label="Mode" value={detail.consultationMode} />
                  <DetailRow label="Type" value={detail.sessionType} />
                  <DetailRow
                    label="Start"
                    value={new Date(detail.scheduledStartTime).toLocaleString("en-US", {
                      month: "short", day: "2-digit", year: "numeric",
                      hour: "2-digit", minute: "2-digit", hour12: true,
                    })}
                  />
                  <DetailRow
                    label="End"
                    value={
                      detail.scheduledEndTime
                        ? new Date(detail.scheduledEndTime).toLocaleString("en-US", {
                            month: "short", day: "2-digit", year: "numeric",
                            hour: "2-digit", minute: "2-digit", hour12: true,
                          })
                        : "—"
                    }
                  />
                  {detail.durationMinutes && (
                    <DetailRow label="Duration" value={`${detail.durationMinutes} min`} />
                  )}
                  <DetailRow label="Room" value={detail.roomName} />
                </div>

                <div className="border-t border-cultured pt-4 space-y-2">
                  <p className="text-xs text-accent font-medium">Join Status</p>
                  <div className="flex gap-2">
                    <span className={`flex-1 text-center text-xs py-1.5 rounded border ${
                      detail.doctorJoinState === "JOINED"
                        ? "border-emerald-800 bg-emerald-500/10 text-emerald-400"
                        : "border-cultured text-accent"
                    }`}>
                      Doctor · {detail.doctorJoinState}
                    </span>
                    <span className={`flex-1 text-center text-xs py-1.5 rounded border ${
                      detail.patientJoinState === "JOINED"
                        ? "border-emerald-800 bg-emerald-500/10 text-emerald-400"
                        : "border-cultured text-accent"
                    }`}>
                      Patient · {detail.patientJoinState}
                    </span>
                  </div>
                  <span className={`w-full text-center text-xs py-1.5 rounded border flex justify-center ${
                    detail.nurseJoinState === "JOINED"
                      ? "border-emerald-800 bg-emerald-500/10 text-emerald-400"
                      : "border-cultured text-accent"
                  }`}>
                    Nurse · {detail.nurseJoinState}
                  </span>
                </div>

                {!sessionEnded && (
                  <button
                    disabled={!canJoin && !isJoined}
                    onClick={() => router.push(`/consultations/${detail.sessionId}`)}
                    className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      canJoin
                        ? "bg-gradient-primary text-white"
                        : isJoined
                        ? "border border-emerald-800 bg-emerald-500/10 text-emerald-400"
                        : "border border-cultured text-accent cursor-not-allowed opacity-50"
                    }`}
                  >
                    {isJoined ? "Rejoin Consultation" : canJoin ? "Join Consultation" : "Not Yet Available"}
                    {(canJoin || isJoined) && <ArrowRightIcon size={14} weight="bold" />}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
