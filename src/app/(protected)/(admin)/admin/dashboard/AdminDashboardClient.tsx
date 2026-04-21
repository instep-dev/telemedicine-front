// @refresh reset
"use client";

import { useEffect, useMemo, useState } from "react";

import { EcommerceMetrics } from "@/components/dashboard/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/dashboard/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/dashboard/ecommerce/MonthlySalesChart";
import RecentOrders from "@/components/dashboard/ecommerce/RecentOrders";
import StatisticsChartSessions from "@/components/dashboard/ecommerce/StatisticsChartSessions";
import { authStore } from "@/services/auth/auth.store";
import { consultationsApi } from "@/services/consultations/consultations.api";
import type { ConsultationSessionDto } from "@/services/consultations/consultations.dto";
import type { CallItemDto } from "@/services/history/history.dto";

const MONTHLY_TARGET = 30;

const getChangePct = (current: number, previous: number): number => {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
};

const getSessionDate = (session: ConsultationSessionDto): Date | null => {
  const raw =
    session.endedAt ??
    session.startedAt ??
    session.scheduledStartTime ??
    session.createdAt;

  if (!raw) return null;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const getSessionDurationSec = (session: ConsultationSessionDto): number => {
  if (typeof session.durationMinutes === "number" && Number.isFinite(session.durationMinutes)) {
    return Math.max(0, Math.round(session.durationMinutes * 60));
  }

  if (!session.startedAt || !session.endedAt) return 0;
  const startedAt = new Date(session.startedAt);
  const endedAt = new Date(session.endedAt);

  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime())) return 0;

  const delta = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);
  return delta > 0 ? delta : 0;
};

const sessionStatusToCallStatus = (
  status: ConsultationSessionDto["sessionStatus"],
): CallItemDto["status"] => {
  if (status === "COMPLETED") return "COMPLETED";
  if (status === "FAILED") return "FAILED";
  if (status === "IN_CALL") return "CONNECTED";
  return "STARTED";
};

const toCallItem = (session: ConsultationSessionDto): CallItemDto => ({
  id: session.sessionId,
  consultationId: session.sessionId,
  doctorId: session.doctorId,
  doctorName: session.doctorName,
  patientName: session.patientName,
  status: sessionStatusToCallStatus(session.sessionStatus),
  roomSid: null,
  roomName: session.roomName,
  doctorIdentity: null,
  patientIdentity: null,
  startedAt: session.startedAt,
  endedAt: session.endedAt,
  recordingEnabled: session.consultationMode === "VIDEO",
  recordingStatus: null,
  recordingStartedAt: null,
  recordingCompletedAt: null,
  compositionSid: null,
  compositionStatus: null,
  compositionStartedAt: null,
  compositionReadyAt: null,
  mediaUrl: null,
  mediaFormat: null,
  durationSec: getSessionDurationSec(session),
  errorMessage: null,
  consultationStatus: session.sessionStatus,
  consultationStartedAt: session.startedAt,
  consultationEndedAt: session.endedAt,
  patientCity: null,
  patientProvince: null,
  patientCountry: null,
  patientCountryCode: null,
  patientLatitude: null,
  patientLongitude: null,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
});

export default function AdminDashboardClient() {
  const [accessToken, setAccessToken] = useState(() => authStore.getState().accessToken);
  const [sessions, setSessions] = useState<ConsultationSessionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      setAccessToken(state.accessToken);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSessions() {
      if (!accessToken) {
        if (active) setSessions([]);
        if (active) setError(false);
        return;
      }

      setLoading(true);
      setError(false);

      try {
        const data = await consultationsApi.listAdminHistorySessions(accessToken, {
          sort: "newest",
          status: "COMPLETED",
        });

        if (active) {
          setSessions(Array.isArray(data) ? data : []);
          setError(false);
        }
      } catch {
        if (active) {
          setSessions([]);
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSessions();

    return () => {
      active = false;
    };
  }, [accessToken]);

  const safeSessions = useMemo(
    () => (Array.isArray(sessions) ? sessions.filter((item) => item.sessionStatus === "COMPLETED") : []),
    [sessions],
  );

  const metrics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const today = now.getDate();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const monthlyCounts = Array(12).fill(0);

    let currentMonthCalls = 0;
    let todayCalls = 0;

    const patientsAll = new Set<string>();
    const doctorsAll = new Set<string>();

    const patientsCurrent = new Set<string>();
    const patientsPrev = new Set<string>();
    const doctorsCurrent = new Set<string>();
    const doctorsPrev = new Set<string>();

    for (const session of safeSessions) {
      const date = getSessionDate(session);
      if (!date) continue;

      patientsAll.add(session.patientId);
      doctorsAll.add(session.doctorId);

      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        monthlyCounts[monthIndex] += 1;
      }

      if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
        currentMonthCalls += 1;
        patientsCurrent.add(session.patientId);
        doctorsCurrent.add(session.doctorId);

        if (date.getDate() === today) {
          todayCalls += 1;
        }
      } else if (
        date.getFullYear() === previousMonthYear &&
        date.getMonth() === previousMonth
      ) {
        patientsPrev.add(session.patientId);
        doctorsPrev.add(session.doctorId);
      }
    }

    const patientsCount = patientsAll.size;
    const doctorsCount = doctorsAll.size;

    const patientsChangePct = getChangePct(patientsCurrent.size, patientsPrev.size);
    const doctorsChangePct = getChangePct(doctorsCurrent.size, doctorsPrev.size);

    const recentCalls = safeSessions.map((item) => toCallItem(item));

    return {
      patientsCount,
      doctorsCount,
      patientsChangePct,
      doctorsChangePct,
      currentMonthCalls,
      todayCalls,
      monthlyCounts,
      recentCalls,
    };
  }, [safeSessions]);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics
          patientsCount={metrics.patientsCount}
          consultationMinutes={metrics.doctorsCount}
          patientsChangePct={metrics.patientsChangePct}
          consultationMinutesChangePct={metrics.doctorsChangePct}
          patientsLabel="Total Patients"
          consultationLabel="Total Doctors"
          patientsUnitLabel="Persons"
          consultationUnitLabel="Persons"
          loading={loading}
          error={error}
        />
        <MonthlySalesChart
          monthlyCounts={metrics.monthlyCounts}
          loading={loading}
          error={error}
        />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget
          currentMonthCalls={metrics.currentMonthCalls}
          target={MONTHLY_TARGET}
          todayCalls={metrics.todayCalls}
          loading={loading}
          error={error}
        />
      </div>

      <div className="col-span-12">
        <StatisticsChartSessions sessions={safeSessions} loading={loading} />
      </div>

      <div className="col-span-12">
        <RecentOrders
          rows={metrics.recentCalls}
          loading={loading}
          error={error}
          subtitle="Completed consultations"
          seeAllHref="/admin/schedule"
          enableCursorPagination
          pageSize={10}
        />
      </div>
    </div>
  );
}
