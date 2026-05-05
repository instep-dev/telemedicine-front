"use client";
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CircleNotchIcon,
  MinusIcon,
  SealCheckIcon,
  XIcon,
} from "@phosphor-icons/react";
import DataEmpty from "@/components/reusable/DataEmpty";


type MonthlyTargetProps = {
  currentMonthCalls: number;
  target: number;
  todayCalls: number;
  loading?: boolean;
  error?: boolean;
};

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyTarget({
  currentMonthCalls,
  target,
  todayCalls,
  loading = false,
  error = false,
}: MonthlyTargetProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-cultured bg-card p-6">
        <h3 className="text-lg font-semibold text-white">
          Monthly Target
        </h3>
        <p className="mt-1 font-normal text-accent text-theme-sm dark:text-gray-400">
          Target you've set for each month
        </p>
        <div className="mt-4">
          <DataEmpty ItemIcon={XIcon} value="Failed to load" subValue="Target" />
        </div>
      </div>
    );
  }
  const safeTarget = Math.max(0, target);
  const progressRaw = safeTarget > 0 ? (currentMonthCalls / safeTarget) * 100 : 0;
  const progressPercent = Math.min(100, Number(progressRaw.toFixed(2)));
  const progressLabel = Math.min(100, Math.round(progressRaw));

  const diff = currentMonthCalls - safeTarget;
  const diffPercent = safeTarget > 0 ? (diff / safeTarget) * 100 : 0;
  const diffLabel = `${diffPercent >= 0 ? "+" : "-"}${Math.abs(Math.round(diffPercent))}%`;

  const getBadgeClass = (pct: number) => {
    if (pct <= 29) return "bg-red-500/10 text-red-600 border border-red-900";
    if (pct <= 60) return "bg-yellow-500/10 text-yellow-600 border border-yellow-950";
    return "bg-success-500/10 text-success-600 border border-success-950";
  };

  const renderTrendIcon = (delta: number) => {
    if (delta > 0) {
      return <ArrowUpIcon className="text-success-600" />;
    }
    if (delta < 0) {
      return <ArrowDownIcon className="text-error-500" />;
    }
    return <MinusIcon className="text-gray-500" />;
  };

  const series = [progressPercent];
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#0a0a0a",
          strokeWidth: "100%",
          margin: 5, 
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#ffffff",
            formatter: function () {
              return `${progressLabel}%`;
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#0059ff"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  const targetLabel = loading
    ? "-"
    : `${safeTarget} call${safeTarget === 1 ? "" : "s"}`;
  const monthLabel = loading
    ? "-"
    : `${currentMonthCalls} call${currentMonthCalls === 1 ? "" : "s"}`;
  const todayLabel = loading
    ? "-"
    : `${todayCalls} call${todayCalls === 1 ? "" : "s"}`;

  return (
    <div className="rounded-lg border border-cultured bg-gradient-gray w-full">
      <div className="px-5 pt-5 shadow-default rounded-lg pb-6 bg-card sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Monthly Target
            </h3>
            <p className="mt-1 font-semibold text-accent text-theme-sm">
              Target we've set for you each month
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="max-h-[400px]">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={400}
            />
          </div>

          <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 -translate-y-[95%]">
            <span className={`inline-flex items-center justify-center px-2.5 py-1 text-xs font-medium rounded ${
              loading ? "bg-white/5 text-accent border border-cultured" : getBadgeClass(progressLabel)
            }`}>
              {loading ? "--" : diffLabel}
            </span>
          </div>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[250px] text-center text-sm text-white sm:text-base">
          {loading ? (
            "Loading consultations..."
          ) : (
            <>
              You did{' '}
              <span className="font-medium text-blue-500">{todayCalls}</span>{" "}
              consultation{todayCalls >= 2 ? "s" : ""} today, {todayCalls === 0 ? "Try to start the consultation" : "Keep up the good work!"}
            </>
          )}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-accent text-theme-xs sm:text-sm">
            Target
          </p>
          <div className="flex items-center justify-center gap-1.5 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {targetLabel}
            <SealCheckIcon className="text-blue-500 text-sm mt-0.5" weight="fill"/>
          </div>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-accent text-theme-xs sm:text-sm">
            This Month
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {monthLabel}
            {loading ? (
              <CircleNotchIcon className="animate-spin"/>
            ) : (
              renderTrendIcon(currentMonthCalls - safeTarget)
            )}
          </p>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-accent text-theme-xs sm:text-sm">
            Today
          </p>
          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {todayLabel}
            {loading ? (
              <MinusIcon className="text-primary" />
            ) : (
              renderTrendIcon(todayCalls)
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
