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
  patientsLabel?: string;
  consultationLabel?: string;
  patientsUnitLabel?: string;
  consultationUnitLabel?: string;
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
  patientsLabel = "Total Patients",
  consultationLabel = "Total Consultations",
  patientsUnitLabel = "Persons",
  consultationUnitLabel = "Minutes",
  loading = false,
  error = false,
}: EcommerceMetricsProps) => {
  if (error) {
    return (
      <div className="rounded-lg border border-cultured bg-card p-6 ">
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 ">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-lg border border-cultured bg-card p-5 md:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-center w-9 h-9 bg-gradient-gray rounded-lg dark:bg-gray-800">
          <UsersIcon className="text-white" size={16} weight="duotone"/>
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-white">
              {patientsLabel}
            </span>
            <h4 className="mt-2 font-bold text-title-sm text-white flex items-end gap-x-1">
              {patientsDisplay}
              <p className="text-base mb-1 ml-0.5 text-sm text-accent">{patientsUnitLabel}</p>
            </h4>
          </div>
          {loading ? (
            <Badge size="sm" color="light">Loading</Badge>
          ) : hasPatientTrend ? (
            <Badge size="sm" color={patientTrendUp ? "success" : "error"}>
              {patientTrendUp ? (
                <ArrowUpIcon />
              ) : (
                <ArrowDownIcon className="text-error-500" />
              )}
              {formatPercent(patientsChangePct)}
            </Badge>
          ) : (
            <Badge size="sm" color="light">No trend</Badge>
          )}
        </div>
      </div>
      
      <div className="rounded-lg border border-cultured bg-card p-5 md:p-6">
        <div className="flex items-center justify-center w-9 h-9 bg-gradient-gray rounded-lg dark:bg-gray-800">
          <ClockUserIcon className="text-white" size={16} weight="duotone"/>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-white">
              {consultationLabel}
            </span>
            <h4 className="mt-2 font-bold text-title-sm text-white flex items-end gap-x-1">
              {minutesDisplay}
              <p className="text-base mb-1 ml-0.5 text-sm text-accent">{consultationUnitLabel}</p>
            </h4>
          </div>

          {loading ? (
            <Badge size="sm" color="light">Loading</Badge>
          ) : hasConsultationTrend ? (
            <Badge size="sm" color={consultationTrendUp ? "success" : "error"}>
              {consultationTrendUp ? (
                <ArrowUpIcon />
              ) : (
                <ArrowDownIcon className="text-error-500" />
              )}
              {formatPercent(consultationMinutesChangePct)}
            </Badge>
          ) : (
            <Badge size="sm" color="light">No trend</Badge>
          )}
        </div>
      </div>
    </div>
  );
};

