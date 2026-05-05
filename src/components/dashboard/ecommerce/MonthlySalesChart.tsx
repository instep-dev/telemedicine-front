"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { DotsThreeOutlineVerticalIcon, XIcon } from "@phosphor-icons/react";
import DataEmpty from "@/components/reusable/DataEmpty";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

type MonthlyConsultationChartProps = {
  monthlyCounts: number[];
  loading?: boolean;
  error?: boolean;
};

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyConsultationChart({
  monthlyCounts,
  loading = false,
  error = false,
}: MonthlyConsultationChartProps) {
  if (error) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Monthly Consultations
          </h3>
        </div>
        <div className="p-6">
          <DataEmpty ItemIcon={XIcon} value="Failed to load" subValue="Consultations" />
        </div>
      </div>
    );
  }
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#ffffff80",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        style: {
          colors: "#ffffff",
        },
      },
    },
    grid: {
      borderColor: "#393939",
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
      colors: ["#0059ff"],
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) =>
          `${val} call${val === 1 ? "" : "s"}`,
      },
    },
  };
  const safeCounts = Array.isArray(monthlyCounts) ? monthlyCounts : [];
  const normalizedCounts = loading
    ? Array(12).fill(0)
    : safeCounts.length === 12
      ? safeCounts
      : Array(12).fill(0);
  const series = [
    {
      name: "Consultations",
      data: normalizedCounts,
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-cultured bg-card px-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Monthly Consultations
          </h3>
          <p className="mt-1 font-semibold text-accent text-theme-sm">
            Your monthly total consultation
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-8 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}
