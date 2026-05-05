// @refresh reset
"use client";

import { useEffect, useMemo, useState } from "react";

import { EcommerceMetrics } from "@/components/dashboard/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/dashboard/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/dashboard/ecommerce/MonthlySalesChart";
import StatisticsChartSessions from "@/components/dashboard/ecommerce/StatisticsChartSessions";
import RecentOrders from "@/components/dashboard/ecommerce/RecentOrders";
import DemographicCard from "@/components/dashboard/ecommerce/DemographicCard";
import { authStore } from "@/services/auth/auth.store";
import { consultationsApi } from "@/services/consultations/consultations.api";
import type { ConsultationSessionDto } from "@/services/consultations/consultations.dto";
import type { CallItemDto } from "@/services/history/history.dto";

const MONTHLY_TARGET = 30;

const getChangePct = (current: number, previous: number): number => {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const getSessionDate = (s: ConsultationSessionDto): Date | null => {
  const raw = s.startedAt ?? s.scheduledStartTime ?? s.createdAt;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

const STATUS_MAP: Record<string, CallItemDto["status"]> = {
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  IN_CALL: "CONNECTED",
  CREATED: "STARTED",
};

function sessionToCallItem(s: ConsultationSessionDto): CallItemDto {
  return {
    id: s.sessionId,
    consultationId: s.sessionId,
    doctorId: s.doctorId,
    doctorName: s.doctorName,
    patientName: s.patientName,
    status: STATUS_MAP[s.sessionStatus] ?? "STARTED",
    roomSid: null,
    roomName: s.roomName,
    doctorIdentity: null,
    patientIdentity: null,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    recordingEnabled: false,
    recordingStatus: null,
    recordingStartedAt: null,
    recordingCompletedAt: null,
    compositionSid: null,
    compositionStatus: null,
    compositionStartedAt: null,
    compositionReadyAt: null,
    mediaUrl: null,
    mediaFormat: null,
    durationSec: s.durationMinutes != null ? s.durationMinutes * 60 : null,
    errorMessage: null,
    consultationStatus: s.sessionStatus,
    consultationStartedAt: s.startedAt,
    consultationEndedAt: s.endedAt,
    patientCity: null,
    patientProvince: null,
    patientCountry: null,
    patientCountryCode: null,
    patientLatitude: null,
    patientLongitude: null,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export default function NurseDashboardClient() {
  const [accessToken, setAccessToken] = useState(() => authStore.getState().accessToken);
  const [sessions, setSessions] = useState<ConsultationSessionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => setAccessToken(state.accessToken));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!accessToken) {
        if (active) setSessions([]);
        return;
      }
      setLoading(true);
      setError(false);
      try {
        const data = await consultationsApi.listNurseSessions(accessToken, { sort: "newest" });
        if (active) setSessions(Array.isArray(data) ? data : []);
      } catch {
        if (active) {
          setSessions([]);
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [accessToken]);

  const safeSessions = useMemo(() => (Array.isArray(sessions) ? sessions : []), [sessions]);

  const metrics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const today = now.getDate();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const monthlyCounts = Array(12).fill(0);
    let totalMinutes = 0;
    let currentMonthSessions = 0;
    let todaySessions = 0;
    let currentMonthMinutes = 0;
    let previousMonthMinutes = 0;

    const patientsAll = new Set<string>();
    const patientsCurrent = new Set<string>();
    const patientsPrev = new Set<string>();

    for (const s of safeSessions) {
      const date = getSessionDate(s);
      if (!date) continue;

      const durationMin = typeof s.durationMinutes === "number" ? s.durationMinutes : 0;
      const isCompleted = s.sessionStatus === "COMPLETED";

      patientsAll.add(s.patientId);
      if (isCompleted) totalMinutes += durationMin;

      if (date.getFullYear() === currentYear) {
        monthlyCounts[date.getMonth()] += 1;
      }

      if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
        currentMonthSessions += 1;
        patientsCurrent.add(s.patientId);
        if (isCompleted) currentMonthMinutes += durationMin;
        if (date.getDate() === today) todaySessions += 1;
      } else if (
        date.getFullYear() === previousMonthYear &&
        date.getMonth() === previousMonth
      ) {
        patientsPrev.add(s.patientId);
        if (isCompleted) previousMonthMinutes += durationMin;
      }
    }

    return {
      totalMinutes,
      patientsCount: patientsAll.size,
      patientsChangePct: getChangePct(patientsCurrent.size, patientsPrev.size),
      minutesChangePct: getChangePct(currentMonthMinutes, previousMonthMinutes),
      currentMonthSessions,
      todaySessions,
      monthlyCounts,
      recentCalls: safeSessions.slice(0, 5).map(sessionToCallItem),
    };
  }, [safeSessions]);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics
          patientsCount={metrics.patientsCount}
          consultationMinutes={metrics.totalMinutes}
          patientsChangePct={metrics.patientsChangePct}
          consultationMinutesChangePct={metrics.minutesChangePct}
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
          currentMonthCalls={metrics.currentMonthSessions}
          target={MONTHLY_TARGET}
          todayCalls={metrics.todaySessions}
          loading={loading}
          error={error}
        />
      </div>

      <div className="col-span-12">
        <StatisticsChartSessions sessions={safeSessions} loading={loading} />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard
          cities={[]}
          markers={[]}
          total={0}
          loading={loading}
          error={error}
        />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders
          rows={metrics.recentCalls}
          loading={loading}
          error={error}
          seeAllHref="/nurse/schedule"
        />
      </div>
    </div>
  );
}
