"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
import { CalendarIcon } from "@phosphor-icons/react";
import type { ConsultationSessionDto } from "@/services/consultations/consultations.dto";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type StatisticsChartSessionsProps = {
  sessions: ConsultationSessionDto[];
  loading?: boolean;
};

const buildDefaultRange = (): [Date, Date] => {
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 6);
  return [start, today];
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

const getSessionSeconds = (session: ConsultationSessionDto): number => {
  if (typeof session.durationMinutes === "number" && Number.isFinite(session.durationMinutes)) {
    return Math.max(0, Math.round(session.durationMinutes * 60));
  }

  const started = session.startedAt ? new Date(session.startedAt) : null;
  const ended = session.endedAt ? new Date(session.endedAt) : null;
  if (!started || !ended) return 0;
  if (Number.isNaN(started.getTime()) || Number.isNaN(ended.getTime())) return 0;

  const diff = Math.round((ended.getTime() - started.getTime()) / 1000);
  return diff > 0 ? diff : 0;
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

export default function StatisticsChartSessions({
  sessions,
  loading = false,
}: StatisticsChartSessionsProps) {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [range, setRange] = useState<[Date, Date]>(() => buildDefaultRange());
  const initialRangeRef = useRef<[Date, Date]>(range);

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
          setRange([dates[0], dates[1]]);
        }
      },
    });

    return () => {
      if (!Array.isArray(fp)) {
        fp.destroy();
      }
    };
  }, []);

  const computed = useMemo(() => {
    const categories = buildDateKeys(range[0], range[1]);
    const counts = Array(categories.length).fill(0);
    const seconds = Array(categories.length).fill(0);
    const indexByDate = new Map<string, number>(
      categories.map((key, index) => [key, index]),
    );

    const start = toStartOfDay(range[0]).getTime();
    const end = toEndOfDay(range[1]).getTime();

    for (const session of sessions) {
      if (session.sessionStatus !== "COMPLETED") continue;
      const date = getSessionDate(session);
      if (!date) continue;

      const dateMs = date.getTime();
      if (dateMs < start || dateMs > end) continue;

      const key = toDateKey(date);
      const index = indexByDate.get(key);
      if (index === undefined) continue;

      counts[index] += 1;
      seconds[index] += getSessionSeconds(session);
    }

    const hours = seconds.map((value) => Number((value / 3600).toFixed(1)));

    return { categories, counts, hours };
  }, [sessions, range]);

  const dataLength = computed.categories.length;

  const normalizedCounts =
    !loading && computed.counts.length === dataLength
      ? computed.counts
      : Array(dataLength).fill(0);
  const normalizedHours =
    !loading && computed.hours.length === dataLength
      ? computed.hours
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
      categories: computed.categories,
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
    <div className="rounded-lg border border-cultured bg-card px-5 pb-5 pt-5  sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics consultations
          </h3>
          <p className="mt-1 text-accent text-theme-sm">
            Daily calls and consultation hours
          </p>
        </div>
        <div className="flex items-center sm:justify-end">
          <div className="relative inline-flex items-center">
            <CalendarIcon weight="duotone" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-3 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2 text-white pointer-events-none z-10" />
            <input
              ref={datePickerRef}
              className="h-10 w-10 lg:w-40 lg:h-auto lg:pl-10 lg:pr-3 lg:py-2 rounded-md border border-cultured bg-gradient-gray text-white text-sm font-semibold text-transparent outline-none cursor-pointer"
              placeholder="Select date range"
            />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
