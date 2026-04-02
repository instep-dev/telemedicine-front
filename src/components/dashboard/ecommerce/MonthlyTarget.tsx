"use client";
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

import dynamic from "next/dynamic";
import { Dropdown } from "../ui/dropdown/Dropdown";
import Badge from "../ui/badge/Badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CircleNotchIcon,
  DotsThreeOutlineVerticalIcon,
  MinusIcon,
  SealCheckIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
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
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Target
        </h3>
        <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
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
  const progressLabel = Math.round(progressRaw);

  const diff = currentMonthCalls - safeTarget;
  const diffPercent = safeTarget > 0 ? (diff / safeTarget) * 100 : 0;
  const diffLabel = `${diffPercent >= 0 ? "+" : "-"}${Math.abs(
    Math.round(diffPercent),
  )}%`;

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
    colors: ["#465FFF"],
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
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5, // margin is in pixels
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -40,
            color: "#1D2939",
            formatter: function () {
              return `${progressLabel}%`;
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#465FFF"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Progress"],
  };

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

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
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Target
            </h3>
            <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
              Target you've set for each month
            </p>
          </div>
          <div className="relative inline-block">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              <DotsThreeOutlineVerticalIcon
                weight="fill"
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              />
            </button>
            <Dropdown
              isOpen={isOpen}
              onClose={closeDropdown}
              className="w-40 p-2"
            >
              <DropdownItem
                tag="a"
                variant={true}
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                View More
              </DropdownItem>
              <DropdownItem
                tag="a"
                variant={false}
                onItemClick={closeDropdown}
                className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
        <div className="relative ">
          <div className="max-h-[330px]">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>

          <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%]">
            <Badge
              color={
                loading
                  ? "light"
                  : diffPercent > 0
                    ? "success"
                    : diffPercent < 0
                      ? "error"
                      : "light"
              }
              size="sm"
            >
              {loading ? "--" : diffLabel}
            </Badge>
          </div>
        </div>
        <p className="mx-auto mt-10 w-full max-w-[250px] text-center text-sm text-gray-500 sm:text-base">
          {loading ? (
            "Loading consultations..."
          ) : (
            <>
              You did{" "}
              <span className="font-medium text-black">{todayCalls}</span>{" "}
              consultation{todayCalls >= 2 ? "s" : ""} today, {todayCalls === 0 ? "Try to start the consultation" : "Keep up the good work!"}
            </>
          )}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3.5 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
            Target
          </p>
          <div className="flex items-center justify-center gap-1.5 text-base font-semibold text-gray-800 dark:text-white/90 sm:text-lg">
            {targetLabel}
            <SealCheckIcon className="text-success-300 text-sm mt-0.5" weight="fill"/>
          </div>
        </div>

        <div className="w-px bg-gray-200 h-7 dark:bg-gray-800"></div>

        <div>
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
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
          <p className="mb-1 text-center text-gray-500 text-theme-xs dark:text-gray-400 sm:text-sm">
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
