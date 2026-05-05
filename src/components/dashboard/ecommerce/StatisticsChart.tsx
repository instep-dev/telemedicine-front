"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
import { CalendarIcon } from "@phosphor-icons/react";
import { historyApi } from "@/services/history/history.api";
import type { CallStatsResponse } from "@/services/history/history.dto";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type StatisticsChartProps = {
  accessToken: string | null;
};

const PRESET_DAYS = [7, 4, 3] as const;
type PresetDays = (typeof PRESET_DAYS)[number];

const buildCenteredRange = (days: number): [Date, Date] => {
  const today = new Date();
  const before = Math.floor((days - 1) / 2);
  const after = Math.ceil((days - 1) / 2);
  const start = new Date(today);
  start.setDate(today.getDate() - before);
  const end = new Date(today);
  end.setDate(today.getDate() + after);
  return [start, end];
};

const toStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
const toEndOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map((part) => Number(part));
  return new Date(year, month - 1, day);
};

const buildDateKeys = (start: Date, end: Date): string[] => {
  const keys: string[] = [];
  const cursor = toStartOfDay(start);
  const endDate = toStartOfDay(end);

  while (cursor <= endDate) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
};

const shortFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const longFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default function StatisticsChart({ accessToken }: StatisticsChartProps) {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const fpRef = useRef<flatpickr.Instance | null>(null);
  const [selectedDays, setSelectedDays] = useState<PresetDays | null>(7);
  const [range, setRange] = useState<[Date, Date]>(() => buildCenteredRange(7));
  const initialRangeRef = useRef<[Date, Date]>(range);
  const [stats, setStats] = useState<CallStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePreset = useCallback((days: PresetDays) => {
    const [start, end] = buildCenteredRange(days);
    setSelectedDays(days);
    setRange([start, end]);
    fpRef.current?.setDate([start, end], false);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 640) {
      handlePreset(3);
    }
  }, [handlePreset]);

  useEffect(() => {
    if (!datePickerRef.current) return;

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M d",
      defaultDate: initialRangeRef.current,
      clickOpens: true,
      prevArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow:
        '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      onChange: (dates) => {
        if (dates.length === 2) {
          setSelectedDays(null);
          setRange([dates[0], dates[1]]);
        }
      },
    });

    fpRef.current = Array.isArray(fp) ? fp[0] : fp;

    return () => {
      fpRef.current?.destroy();
      fpRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setStats(null);
      setLoading(false);
      return;
    }

    if (!range[0] || !range[1]) {
      setStats(null);
      setLoading(false);
      return;
    }

    let active = true;

    const loadStats = async () => {
      setLoading(true);
      try {
        const startDate = toStartOfDay(range[0]).toISOString();
        const endDate = toEndOfDay(range[1]).toISOString();
        const tzOffset = new Date().getTimezoneOffset();
        const data = await historyApi.getCallStats(accessToken, {
          startDate,
          endDate,
          tzOffset,
        });

        if (active) {
          setStats(data);
        }
      } catch (error) {
        if (active) {
          setStats(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadStats();

    return () => {
      active = false;
    };
  }, [accessToken, range]);

  const fallbackCategories = useMemo(
    () => buildDateKeys(range[0], range[1]),
    [range],
  );

  const categories =
    stats?.categories?.length ? stats.categories : fallbackCategories;
  const dataLength = categories.length;

  const normalizedCounts =
    !loading && stats?.dailyCounts?.length === dataLength
      ? stats.dailyCounts
      : Array(dataLength).fill(0);
  const normalizedHours =
    !loading && stats?.dailyHours?.length === dataLength
      ? stats.dailyHours
      : Array(dataLength).fill(0);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#0059ff", "#8ebbff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    stroke: {
      curve: "straight",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        formatter: (value) => {
          const date = parseDateKey(String(value));
          if (Number.isNaN(date.getTime())) return String(value);
          return longFormatter.format(date);
        },
      },
    },
    xaxis: {
      type: "category",
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        formatter: (value) => {
          const date = parseDateKey(String(value));
          if (Number.isNaN(date.getTime())) return String(value);
          return shortFormatter.format(date);
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
        formatter: (val: number) => {
          const rounded = Number(val.toFixed(1));
          return rounded % 1 === 0 ? `${rounded.toFixed(0)}` : `${rounded}`;
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Calls",
      data: normalizedCounts,
    },
    {
      name: "Hours",
      data: normalizedHours,
    },
  ];

  return (
    <div className="rounded-lg border border-cultured bg-card px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics consultations
          </h3>
          <p className="mt-1 text-accent text-theme-sm">
            Daily calls and consultation hours
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 sm:justify-end">
          <div className="flex items-center gap-2">
            {PRESET_DAYS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => handlePreset(days)}
                className={`px-3 py-2 flex items-cenyter gap-x-1 flex items-center  rounded-md text-xs font-semibold border transition-all duration-200 ${
                  selectedDays === days
                    ? "bg-primary border-primary text-white"
                    : "border-cultured bg-gradient-gray text-white hover:opacity-70"
                }`}
              >
                {days}
                <span>day</span>
              </button>
            ))}
          </div>
          <div className="relative flex items-center">
            <CalendarIcon weight="duotone" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-3 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 text-white pointer-events-none z-10" />
            <input
              ref={datePickerRef}
              className="h-10 w-10 lg:w-42 lg:h-auto lg:pl-10 lg:pr-3 lg:py-2 rounded-md border border-cultured bg-gradient-gray text-white text-sm font-semibold text-transparent outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full -ml-2">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
