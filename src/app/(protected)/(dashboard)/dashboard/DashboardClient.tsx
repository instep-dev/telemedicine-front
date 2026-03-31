// @refresh reset
"use client";

import { useEffect, useMemo, useState } from "react";

import { EcommerceMetrics } from "@/components/dashboard/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/dashboard/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/dashboard/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/dashboard/ecommerce/StatisticsChart";
import RecentOrders from "@/components/dashboard/ecommerce/RecentOrders";
import DemographicCard from "@/components/dashboard/ecommerce/DemographicCard";
import { authStore } from "@/services/auth/auth.store";
import { historyApi } from "@/services/history/history.api";
import type { CallItemDto } from "@/services/history/history.dto";

const MONTHLY_TARGET = 30;
const getChangePct = (current: number, previous: number): number => {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
};

const getCallDate = (call: CallItemDto): Date | null => {
  const raw =
    call.startedAt ??
    call.createdAt ??
    call.consultationStartedAt ??
    call.consultationEndedAt ??
    call.updatedAt;

  if (!raw) return null;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const getPatientKey = (call: CallItemDto): string => {
  const key =
    call.patientIdentity ??
    call.patientName ??
    call.consultationId ??
    call.id;
  return String(key);
};

const isIndonesiaCall = (call: CallItemDto): boolean => {
  const code = (call.patientCountryCode ?? "").trim().toUpperCase();
  if (code) return code === "ID";

  const country = (call.patientCountry ?? "").trim().toLowerCase();
  return country === "indonesia";
};

export default function DashboardClient() {
  const [accessToken, setAccessToken] = useState(() => authStore.getState().accessToken);
  const [calls, setCalls] = useState<CallItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      setAccessToken(state.accessToken);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCalls() {
      if (!accessToken) {
        if (active) setCalls([]);
        return;
      }

      setLoading(true);
      try {
        const data = await historyApi.getAllCalls(accessToken, { sort: "newest" });
        if (active) setCalls(Array.isArray(data) ? data : []);
      } catch (error) {
        if (active) setCalls([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCalls();

    return () => {
      active = false;
    };
  }, [accessToken]);

  const safeCalls = Array.isArray(calls) ? calls : [];

  const metrics = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const today = now.getDate();

    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const monthlyCounts = Array(12).fill(0);
    const monthlySeconds = Array(12).fill(0);

    const cityMap = new Map<string, number>();
    const cityMarkerMap = new Map<string, { lat: number; lng: number; count: number }>();
    let cityTotal = 0;

    let totalSeconds = 0;
    let currentMonthCalls = 0;
    let currentMonthSeconds = 0;
    let previousMonthSeconds = 0;
    let todayCalls = 0;

    const patientsAll = new Set<string>();
    const patientsCurrent = new Set<string>();
    const patientsPrev = new Set<string>();

    for (const call of safeCalls) {
      const date = getCallDate(call);
      if (!date) continue;

      const isCompleted = call.status === "COMPLETED";
      if (!isCompleted) continue;

      const durationSec = typeof call.durationSec === "number" ? call.durationSec : 0;
      totalSeconds += durationSec;

      const patientKey = getPatientKey(call);
      patientsAll.add(patientKey);

      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        monthlyCounts[monthIndex] += 1;
        monthlySeconds[monthIndex] += durationSec;
      }

      if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
        currentMonthCalls += 1;
        currentMonthSeconds += durationSec;
        patientsCurrent.add(patientKey);

        if (date.getDate() === today) {
          todayCalls += 1;
        }
      } else if (
        date.getFullYear() === previousMonthYear &&
        date.getMonth() === previousMonth
      ) {
        previousMonthSeconds += durationSec;
        patientsPrev.add(patientKey);
      }

      if (isIndonesiaCall(call)) {
        const city = (call.patientCity ?? "").trim() || "Tidak diketahui";
        cityTotal += 1;
        cityMap.set(city, (cityMap.get(city) ?? 0) + 1);

        const lat =
          typeof call.patientLatitude === "number" ? call.patientLatitude : null;
        const lng =
          typeof call.patientLongitude === "number" ? call.patientLongitude : null;
        if (typeof lat === "number" && typeof lng === "number") {
          const existing = cityMarkerMap.get(city);
          if (existing) {
            existing.count += 1;
          } else {
            cityMarkerMap.set(city, { lat, lng, count: 1 });
          }
        }
      }
    }

    const totalMinutes = Math.round(totalSeconds / 60);
    const currentMonthMinutes = Math.round(currentMonthSeconds / 60);
    const previousMonthMinutes = Math.round(previousMonthSeconds / 60);

    const monthlyHours = monthlySeconds.map((sec) => Number((sec / 3600).toFixed(1)));

    const patientsCount = patientsAll.size;
    const patientsCurrentCount = patientsCurrent.size;
    const patientsPrevCount = patientsPrev.size;

    const patientsChangePct = getChangePct(patientsCurrentCount, patientsPrevCount);
    const minutesChangePct = getChangePct(currentMonthMinutes, previousMonthMinutes);

    const recentCalls = safeCalls.slice(0, 5);

    const cityStats = Array.from(cityMap.entries())
      .map(([city, count]) => ({
        city,
        count,
        percent: cityTotal > 0 ? (count / cityTotal) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const cityMarkers = Array.from(cityMarkerMap.entries())
      .map(([city, data]) => ({
        latLng: [data.lat, data.lng] as [number, number],
        name: `${city} (${data.count})`,
      }))
      .slice(0, 10);

    return {
      totalMinutes,
      patientsCount,
      patientsChangePct,
      minutesChangePct,
      currentMonthCalls,
      todayCalls,
      monthlyCounts,
      monthlyHours,
      recentCalls,
      cityStats,
      cityMarkers,
      cityTotal,
    };
  }, [safeCalls]);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6 xl:col-span-7">
        <EcommerceMetrics
          patientsCount={metrics.patientsCount}
          consultationMinutes={metrics.totalMinutes}
          patientsChangePct={metrics.patientsChangePct}
          consultationMinutesChangePct={metrics.minutesChangePct}
          loading={loading}
        />
        <MonthlySalesChart
          monthlyCounts={metrics.monthlyCounts}
          loading={loading}
        />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <MonthlyTarget
          currentMonthCalls={metrics.currentMonthCalls}
          target={MONTHLY_TARGET}
          todayCalls={metrics.todayCalls}
          loading={loading}
        />
      </div>

      <div className="col-span-12">
        <StatisticsChart
          monthlyCounts={metrics.monthlyCounts}
          monthlyHours={metrics.monthlyHours}
          loading={loading}
        />
      </div>

      <div className="col-span-12 xl:col-span-5">
        <DemographicCard
          cities={metrics.cityStats}
          markers={metrics.cityMarkers}
          total={metrics.cityTotal}
          loading={loading}
        />
      </div>

      <div className="col-span-12 xl:col-span-7">
        <RecentOrders rows={metrics.recentCalls} loading={loading} />
      </div>
    </div>
  );
}
