"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CaretLeftIcon, CaretRightIcon, CircleNotchIcon } from "@phosphor-icons/react";
import type { ConsultationSessionDto } from "@/services/consultations/consultations.dto";
import {
  CALENDAR_HOURS,
  CALENDAR_DAY_LABELS,
  SESSION_STATUS_COLOR,
  SESSION_STATUS_LABEL,
  toLocalKey,
  minutesFromMidnight,
  formatCalendarHour,
  formatSessionTime,
} from "@/lib/utils";

const WINDOW_SIZE = 5;

function getWindowStart(anchor: Date): Date {
  const d = new Date(anchor);
  d.setDate(d.getDate() - 1); // today lands at column 2 (index 1)
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildWindowDays(start: Date): Date[] {
  return Array.from({ length: WINDOW_SIZE }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatWindowTitle(days: Date[]): string {
  const start = days[0];
  const end = days[days.length - 1];
  if (start.getMonth() === end.getMonth()) {
    return start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return `${start.toLocaleDateString("en-US", { month: "short" })} – ${end.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
}

const HOUR_MIN_H = 42;
const SESSION_MIN_H = 28;

type WeeklyCalendarProps = {
  sessions: ConsultationSessionDto[];
  isFetching?: boolean;
  onSessionClick: (session: ConsultationSessionDto) => void;
  renderSessionTitle: (session: ConsultationSessionDto) => string;
  onGridClick?: (day: Date, hour: number) => void;
  topBarActions?: React.ReactNode;
};

export default function WeeklyCalendar({
  sessions,
  isFetching,
  onSessionClick,
  renderSessionTitle,
  onGridClick,
  topBarActions,
}: WeeklyCalendarProps) {
  const todayKey = useMemo(() => toLocalKey(new Date()), []);

  const [windowStart, setWindowStart] = useState<Date>(() => getWindowStart(new Date()));
  const days = useMemo(() => buildWindowDays(windowStart), [windowStart]);
  const weekKeys = useMemo(() => days.map(toLocalKey), [days]);
  const title = useMemo(() => formatWindowTitle(days), [days]);

  const goToToday = useCallback(() => setWindowStart(getWindowStart(new Date())), []);
  const prevWeek = useCallback(() =>
    setWindowStart((ws) => { const d = new Date(ws); d.setDate(d.getDate() - WINDOW_SIZE); return d; }), []);
  const nextWeek = useCallback(() =>
    setWindowStart((ws) => { const d = new Date(ws); d.setDate(d.getDate() + WINDOW_SIZE); return d; }), []);

  const [nowMin, setNowMin] = useState(() => minutesFromMidnight(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNowMin(minutesFromMidnight(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);
  const nowHour = Math.floor(nowMin / 60);
  const todayColIdx = days.findIndex((d) => toLocalKey(d) === todayKey);

  const weekSessions = useMemo(
    () => sessions.filter((s) => weekKeys.includes(toLocalKey(new Date(s.scheduledStartTime)))),
    [sessions, weekKeys],
  );

  const getHourSessions = useCallback(
    (dayKey: string, hour: number) =>
      weekSessions.filter((s) => {
        const start = new Date(s.scheduledStartTime);
        return toLocalKey(start) === dayKey && start.getHours() === hour;
      }),
    [weekSessions],
  );

  // Refs untuk sync horizontal scroll antara header dan body grid
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const onBodyScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (headerRef.current) {
      headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  return (
    <div className="flex flex-col border border-cultured rounded-lg bg-card text-white">
      {/* Top bar */}
      <div className="p-3 sm:p-6 border-b border-cultured shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={goToToday}
            className="px-2.5 sm:px-3 py-1.5 rounded-full border border-cultured bg-gradient-gray text-xs sm:text-sm whitespace-nowrap hover:bg-white/5 transition-colors"
          >
            Today Schedule
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={prevWeek}
              className="p-1.5 flex items-center justify-center border border-cultured bg-gradient-gray rounded-full hover:bg-white/10 transition-colors"
            >
              <CaretLeftIcon size={14} />
            </button>
            <button
              onClick={nextWeek}
              className="p-1.5 flex items-center justify-center border border-cultured bg-gradient-gray rounded-full hover:bg-white/10 transition-colors"
            >
              <CaretRightIcon size={14} />
            </button>
          </div>

          <h2 className="text-sm sm:text-base font-medium">{title}</h2>

          <div className="ml-auto flex items-center gap-2">
            {isFetching && <CircleNotchIcon size={14} className="animate-spin text-accent" />}
            {topBarActions && <div className="hidden sm:block">{topBarActions}</div>}
            <span className="text-xs border border-cultured px-2 py-1.5 rounded-lg text-accent">Week</span>
          </div>
        </div>

        {/* Mobile: topBarActions on second row */}
        {topBarActions && (
          <div className="mt-2 flex sm:hidden">
            {topBarActions}
          </div>
        )}
      </div>

      {/*
        Day header — dipisah dari grid jam agar sticky bisa bekerja terhadap page scroll.
        overflow-x: auto pada parent merusak sticky karena CSS spec memaksa overflow-y: auto
        juga, sehingga sticky hanya bekerja di dalam container itu (yang tidak scroll secara
        vertikal). Solusi: header dan grid adalah dua sibling terpisah; horizontal scroll
        di-sync lewat JS melalui onBodyScroll.
      */}
      <div
        ref={headerRef}
        className="overflow-x-hidden border-t border-b border-cultured bg-card/50 sticky top-24 z-20"
      >
        <div className="flex min-w-[520px]">
          <div className="w-10 sm:w-14 shrink-0 border-r border-cultured" />
          {days.map((day) => {
            const key = toLocalKey(day);
            const isToday = key === todayKey;
            return (
              <div key={key} className="flex-1 text-center py-2 border-r border-cultured last:border-r-0">
                <p className={`text-[9px] sm:text-[10px] font-medium uppercase tracking-widest ${isToday ? "text-blue-400" : "text-accent"}`}>
                  {CALENDAR_DAY_LABELS[day.getDay()]}
                </p>
                <div
                  className={`mx-auto mt-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs sm:text-sm font-medium ${
                    isToday ? "bg-blue-500 text-white" : "text-white"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hour grid — horizontal scroll di-sync ke header */}
      <div
        ref={bodyRef}
        className="overflow-x-auto"
        onScroll={onBodyScroll}
      >
        <div className="flex flex-col min-w-[520px]">
          {CALENDAR_HOURS.map((h) => {
            const isCurrentHour = todayColIdx >= 0 && h === nowHour;

            return (
              <div
                key={h}
                className="flex border-b border-cultured/30 last:border-b-0"
                style={{ minHeight: HOUR_MIN_H }}
              >
                {/* Time label */}
                <div className="w-10 sm:w-14 shrink-0 border-r border-cultured flex items-start justify-end pr-1.5 sm:pr-2 pt-0 relative">
                  {h !== 0 && (
                    <span className="text-[10px] text-accent -translate-y-[6px]">{formatCalendarHour(h)}</span>
                  )}
                </div>

                {/* Day cells */}
                {days.map((day) => {
                  const dayKey = toLocalKey(day);
                  const isToday = dayKey === todayKey;
                  const hourSessions = getHourSessions(dayKey, h);

                  return (
                    <div
                      key={dayKey}
                      className={`flex-1 border-r border-cultured/30 last:border-r-0 flex flex-col gap-1 p-1.5 relative ${
                        onGridClick ? "cursor-pointer" : ""
                      } ${isToday ? "bg-blue-500/[0.03]" : ""}`}
                      onClick={onGridClick ? () => onGridClick(day, h) : undefined}
                    >
                      {/* Current time indicator */}
                      {isCurrentHour && isToday && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-500 pointer-events-none z-10" />
                      )}

                      {hourSessions.map((session) => (
                        <div
                          key={session.sessionId}
                          onClick={(e) => { e.stopPropagation(); onSessionClick(session); }}
                          className={`rounded-sm px-1.5 py-1 cursor-pointer overflow-hidden text-[11px] transition-opacity hover:opacity-90 ${SESSION_STATUS_COLOR[session.sessionStatus]}`}
                          style={{ minHeight: SESSION_MIN_H }}
                        >
                          <p className="font-semibold leading-tight truncate">
                            {renderSessionTitle(session)}
                          </p>
                          <p className="text-[10px] opacity-70 leading-tight mt-0.5 truncate">
                            {formatSessionTime(session.scheduledStartTime, session.scheduledEndTime)}
                          </p>
                          <p className="text-[10px] opacity-50 leading-tight truncate">
                            {session.consultationMode} · {SESSION_STATUS_LABEL[session.sessionStatus]}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
