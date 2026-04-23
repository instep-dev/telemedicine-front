"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { authStore } from "@/services/auth/auth.store";
import {
  useAdminSessionsQuery,
  useCreateConsultationSessionMutation,
} from "@/services/consultations/consultations.queries";
import { consultationsApi } from "@/services/consultations/consultations.api";
import type {
  ConsultationMode,
  ConsultationSessionDto,
  DoctorOptionDto,
  PatientOptionDto,
  SessionType,
} from "@/services/consultations/consultations.dto";
import {
  PlusIcon,
  XIcon,
  CircleNotchIcon,
  VideoCameraIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import Input from "@/components/dashboard/form/input/InputField";
import WeeklyCalendar from "@/components/dashboard/tables/WeeklyCalendar";
import { SESSION_STATUS_COLOR, SESSION_STATUS_LABEL } from "@/lib/utils";

function toDateInput(d: Date): string {
  return d.toLocaleDateString("en-CA");
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-accent text-xs w-24 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

export default function AdminSchedulePage() {
  const { accessToken } = useSyncExternalStore(
    authStore.subscribe,
    () => authStore.getState(),
    () => authStore.getState(),
  );

  const sessionsQuery = useAdminSessionsQuery(accessToken, { sort: "oldest" }, true);
  const allSessions = useMemo(() => sessionsQuery.data ?? [], [sessionsQuery.data]);

  const [doctorOptions, setDoctorOptions] = useState<DoctorOptionDto[]>([]);
  const [patientOptions, setPatientOptions] = useState<PatientOptionDto[]>([]);
  const [lookupLoaded, setLookupLoaded] = useState(false);

  useEffect(() => {
    if (!accessToken || lookupLoaded) return;
    Promise.all([
      consultationsApi.listDoctors(accessToken),
      consultationsApi.listPatients(accessToken),
    ])
      .then(([docs, pats]) => {
        setDoctorOptions(docs);
        setPatientOptions(pats);
        setLookupLoaded(true);
      })
      .catch(() => {});
  }, [accessToken, lookupLoaded]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalDoctorId, setModalDoctorId] = useState("");
  const [modalPatientId, setModalPatientId] = useState("");
  const [modalSessionType, setModalSessionType] = useState<SessionType>("SCHEDULED");
  const [modalMode, setModalMode] = useState<ConsultationMode>("VIDEO");
  const [modalDate, setModalDate] = useState(toDateInput(new Date()));
  const [modalStartTime, setModalStartTime] = useState("08:00");
  const [modalEndTime, setModalEndTime] = useState("09:00");
  const [modalError, setModalError] = useState<string | null>(null);

  const createMutation = useCreateConsultationSessionMutation(accessToken);

  const openModal = useCallback(
    (day?: Date, hour?: number) => {
      setModalDoctorId(doctorOptions[0]?.userId ?? "");
      setModalPatientId(patientOptions[0]?.userId ?? "");
      setModalSessionType("SCHEDULED");
      setModalMode("VIDEO");
      setModalDate(toDateInput(day ?? new Date()));
      const h = hour ?? new Date().getHours();
      const hClamped = Math.max(0, Math.min(22, h));
      setModalStartTime(`${String(hClamped).padStart(2, "0")}:00`);
      setModalEndTime(`${String(hClamped + 1).padStart(2, "0")}:00`);
      setModalError(null);
      setModalOpen(true);
    },
    [doctorOptions, patientOptions],
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    if (!modalDoctorId || !modalPatientId) {
      setModalError("Please select a doctor and a patient.");
      return;
    }
    if (modalSessionType === "SCHEDULED") {
      const scheduledStart = new Date(`${modalDate}T${modalStartTime}:00+07:00`);
      const nowPlus3Min = new Date(Date.now() + 3 * 60 * 1000);
      if (scheduledStart < nowPlus3Min) {
        setModalError("Consultation schedule must be at least 3 minutes from now (WIB).");
        return;
      }
    }
    try {
      await createMutation.mutateAsync({
        doctorId: modalDoctorId,
        patientId: modalPatientId,
        sessionType: modalSessionType,
        consultationMode: modalMode,
        ...(modalSessionType === "SCHEDULED"
          ? { scheduledDate: modalDate, scheduledStartTime: modalStartTime, scheduledEndTime: modalEndTime }
          : {}),
      });
      setModalOpen(false);
      sessionsQuery.refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setModalError(Array.isArray(msg) ? msg.join(", ") : (msg ?? err?.message ?? "Failed to create session."));
    }
  };

  const [detail, setDetail] = useState<ConsultationSessionDto | null>(null);

  const handleGridClick = useCallback(
    (day: Date, hour: number) => openModal(day, hour),
    [openModal],
  );

  return (
    <>
      <WeeklyCalendar
        sessions={allSessions}
        isFetching={sessionsQuery.isFetching}
        onSessionClick={setDetail}
        renderSessionTitle={(s) => `${s.doctorName ?? "Doctor"} × ${s.patientName ?? "Patient"}`}
        onGridClick={handleGridClick}
        topBarActions={
          <button
            onClick={() => openModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-primary text-sm font-medium"
          >
            <PlusIcon size={14} weight="bold" />
            Create
          </button>
        }
      />

      {/* Create Session Modal */}
      <div className={`fixed min-h-screen py-20 flex items-center justify-center inset-0 z-[9999999] transition-all duration-300 ${modalOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 transition-all duration-300 ${modalOpen ? "bg-background/20 backdrop-blur-[10px]" : "bg-background/0 backdrop-blur-none"}`}
          onClick={() => setModalOpen(false)}
        />
        <div className={`${modalOpen ? "scale-100 opacity-100" : "scale-60 opacity-0"} transition-all duration-300 w-[450px] relative bg-card border border-cultured rounded-lg flex flex-col shadow-2xl`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-cultured">
            <h3 className="font-semibold text-sm">{modalSessionType === "INSTANT" ? "Instant Consultation" : "Scheduled Consultation"}</h3>
            <button
              onClick={() => setModalOpen(false)}
              className="w-5 h-5 rounded-full border border-cultured bg-gradient-gray flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <XIcon size={10} />
            </button>
          </div>

          <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-5 space-y-5">
            <div>
              <label className="block text-xs text-accent mb-2">Session Type</label>
              <div className="grid grid-cols-2 gap-2 p-1 border border-cultured rounded-lg">
                {(["SCHEDULED", "INSTANT"] as SessionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setModalSessionType(t)}
                    className={`py-2 rounded-md text-xs font-medium transition-colors ${
                      modalSessionType === t ? "bg-gradient-primary text-white" : "text-accent hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-accent mb-2">Mode</label>
              <div className="grid grid-cols-2 gap-2 p-1 border border-cultured rounded-lg">
                {(["VIDEO", "VOICE"] as ConsultationMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setModalMode(m)}
                    className={`py-2 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      modalMode === m ? "bg-gradient-primary text-white" : "text-accent hover:text-white"
                    }`}
                  >
                    {m === "VIDEO" ? <VideoCameraIcon size={13} /> : <PhoneIcon size={13} />}
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-accent mb-2">Doctor</label>
              <select
                value={modalDoctorId}
                onChange={(e) => setModalDoctorId(e.target.value)}
                className="w-full bg-card border border-cultured rounded-lg h-11 px-4 text-sm text-white focus:outline-none focus:border-white/30"
              >
                <option value="">Select Doctor</option>
                {doctorOptions.map((d) => (
                  <option key={d.userId} value={d.userId}>{d.fullName} ({d.license})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-accent mb-2">Patient</label>
              <select
                value={modalPatientId}
                onChange={(e) => setModalPatientId(e.target.value)}
                className="w-full bg-card border border-cultured rounded-lg h-11 px-4 text-sm text-white focus:outline-none focus:border-white/30"
              >
                <option value="">Select Patient</option>
                {patientOptions.map((p) => (
                  <option key={p.userId} value={p.userId}>{p.fullName}</option>
                ))}
              </select>
            </div>

            {modalSessionType === "SCHEDULED" && (
              <>
                <div>
                  <label className="block text-xs text-accent mb-2">Date</label>
                  <Input
                    type="date"
                    value={modalDate}
                    min={new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date())}
                    onChange={(e) => setModalDate(e.target.value)}
                    className="w-full bg-card border border-cultured rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-accent mb-2">Start (WIB)</label>
                    <Input
                      type="time"
                      value={modalStartTime}
                      onChange={(e) => setModalStartTime(e.target.value)}
                      className="w-full bg-card border border-cultured rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-accent mb-2">End (WIB)</label>
                    <Input
                      type="time"
                      value={modalEndTime}
                      onChange={(e) => setModalEndTime(e.target.value)}
                      className="w-full bg-card border border-cultured rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>
              </>
            )}

            {modalError && (
              <p className="text-red-500 text-xs rounded-lg bg-red-500/10 border border-red-900 px-3 py-2">
                {modalError}
              </p>
            )}

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-2.5 rounded-lg bg-gradient-primary text-sm font-medium disabled:opacity-60"
            >
              {createMutation.isPending ? (
                <CircleNotchIcon size={16} className="animate-spin mx-auto" />
              ) : (
                "Create Session"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Session Detail Panel */}
      <div className={`fixed min-h-screen py-20 flex items-center justify-center inset-0 z-[99999] transition-all duration-300 ${detail ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 transition-all duration-300 ${detail ? "bg-background/20 backdrop-blur-[10px]" : "bg-background/0 backdrop-blur-none"}`}
          onClick={() => setDetail(null)}
        />
        <div className={`${detail ? "scale-100 opacity-100" : "scale-75 opacity-0"} transition-all duration-300 w-[450px] relative bg-card border border-cultured rounded-lg flex flex-col shadow-2xl`}>
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
                  <DetailRow label="Created by" value={detail.createdByName ?? "-"} />
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
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
