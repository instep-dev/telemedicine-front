"use client";

import Badge from "../ui/badge/Badge";
import {
  UsersIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ClockUserIcon,
  XIcon,
} from "@phosphor-icons/react";
import DataEmpty from "@/components/reusable/DataEmpty";

type EcommerceMetricsProps = {
  patientsCount: number;
  consultationMinutes: number;
  patientsChangePct?: number | null;
  consultationMinutesChangePct?: number | null;
  loading?: boolean;
  error?: boolean;
};

const formatPercent = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "--";
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(1)}%`;
};

export const EcommerceMetrics = ({
  patientsCount,
  consultationMinutes,
  patientsChangePct,
  consultationMinutesChangePct,
  loading = false,
  error = false,
}: EcommerceMetricsProps) => {
  if (error) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <DataEmpty ItemIcon={XIcon} value="Failed to load" subValue="Metrics" />
      </div>
    );
  }
  const hasPatientTrend =
    typeof patientsChangePct === "number" && Number.isFinite(patientsChangePct);
  const hasConsultationTrend =
    typeof consultationMinutesChangePct === "number" &&
    Number.isFinite(consultationMinutesChangePct);

  const patientTrendUp = hasPatientTrend ? patientsChangePct! >= 0 : true;
  const consultationTrendUp = hasConsultationTrend
    ? consultationMinutesChangePct! >= 0
    : true;

  const patientsDisplay = loading
    ? "-"
    : patientsCount.toLocaleString("en-US");
  const minutesDisplay = loading
    ? "-"
    : consultationMinutes.toLocaleString("en-US");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl dark:bg-gray-800">
          <UsersIcon className="text-primary size-5 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Patients
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 flex items-end gap-x-1">
              {patientsDisplay}
              <p className="text-base mb-1 ml-0.5 font-normal text-sm text-gray-500 dark:text-gray-400">Persons</p>
            </h4>
          </div>
          {loading ? (
            <Badge color="light">Loading</Badge>
          ) : hasPatientTrend ? (
            <Badge color={patientTrendUp ? "success" : "error"}>
              {patientTrendUp ? (
                <ArrowUpIcon />
              ) : (
                <ArrowDownIcon className="text-error-500" />
              )}
              {formatPercent(patientsChangePct)}
            </Badge>
          ) : (
            <Badge color="light">No trend</Badge>
          )}
        </div>
      </div>
      
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl dark:bg-gray-800">
          <ClockUserIcon className="text-primary size-5 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Consultations
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 flex items-end gap-x-1">
              {minutesDisplay}
              <p className="text-base mb-1 ml-0.5 font-normal text-sm text-gray-500 dark:text-gray-400">Minutes</p>
            </h4>
          </div>

          {loading ? (
            <Badge color="light">Loading</Badge>
          ) : hasConsultationTrend ? (
            <Badge color={consultationTrendUp ? "success" : "error"}>
              {consultationTrendUp ? (
                <ArrowUpIcon />
              ) : (
                <ArrowDownIcon className="text-error-500" />
              )}
              {formatPercent(consultationMinutesChangePct)}
            </Badge>
          ) : (
            <Badge color="light">No trend</Badge>
          )}
        </div>
      </div>
    </div>
  );
};

