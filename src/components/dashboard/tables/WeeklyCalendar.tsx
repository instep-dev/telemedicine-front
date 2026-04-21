"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CaretLeftIcon, CaretRightIcon, CircleNotchIcon } from "@phosphor-icons/react";
import type { ConsultationSessionDto } from "@/services/consultations/consultations.dto";
import {
  CALENDAR_HOURS,
  CALENDAR_DAY_LABELS,
  SESSION_STATUS_COLOR,
  SESSION_STATUS_LABEL,
  getWeekStart,
  buildWeekDays,
  toLocalKey,
  minutesFromMidnight,
  formatCalendarHour,
  formatMonthYear,
  formatSessionTime,
} from "@/lib/utils";

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

  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const days = useMemo(() => buildWeekDays(weekStart), [weekStart]);
  const weekKeys = useMemo(() => days.map(toLocalKey), [days]);

  const goToToday = useCallback(() => setWeekStart(getWeekStart(new Date())), []);
  const prevWeek = useCallback(() =>
    setWeekStart((ws) => { const d = new Date(ws); d.setDate(d.getDate() - 7); return d; }), []);
  const nextWeek = useCallback(() =>
    setWeekStart((ws) => { const d = new Date(ws); d.setDate(d.getDate() + 7); return d; }), []);

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

  return (
    <div className="flex flex-col border border-cultured rounded-lg bg-card text-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 p-6 border-cultured shrink-0">
        <button
          onClick={goToToday}
          className="px-3 py-1.5 rounded-full border border-cultured bg-gradient-gray text-sm hover:bg-white/5 transition-colors"
        >
          Today Schedule
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="p-1.5 flex items-center justify-center border border-cultured bg-gradient-gray rounded-full hover:bg-white/10 transition-colors"
          >
            <CaretLeftIcon size={16} />
          </button>
          <button
            onClick={nextWeek}
            className="p-1.5 flex items-center justify-center border border-cultured bg-gradient-gray rounded-full hover:bg-white/10 transition-colors"
          >
            <CaretRightIcon size={16} />
          </button>
        </div>

        <h2 className="text-base font-medium">{formatMonthYear(weekStart)}</h2>

        <div className="ml-auto flex items-center gap-2">
          {isFetching && <CircleNotchIcon size={14} className="animate-spin text-accent" />}
          {topBarActions}
          <span className="text-xs border border-cultured px-2 py-1.5 rounded-lg text-accent">Week</span>
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex flex-col">
        {/* Day header row — sticky */}
        <div className="flex border-b border-cultured border-t bg-card/50 sticky top-24 z-10">
          <div className="w-14 shrink-0 border-r border-cultured" />
          {days.map((day, idx) => {
            const key = toLocalKey(day);
            const isToday = key === todayKey;
            return (
              <div key={key} className="flex-1 text-center py-2 border-r border-cultured last:border-r-0">
                <p className={`text-[10px] font-medium uppercase tracking-widest ${isToday ? "text-blue-400" : "text-accent"}`}>
                  {CALENDAR_DAY_LABELS[idx]}
                </p>
                <div
                  className={`mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                    isToday ? "bg-blue-500 text-white" : "text-white"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hour rows */}
        {CALENDAR_HOURS.map((h) => {
          const isCurrentHour = todayColIdx >= 0 && h === nowHour;

          return (
            <div
              key={h}
              className="flex border-b border-cultured/30 last:border-b-0"
              style={{ minHeight: HOUR_MIN_H }}
            >
              {/* Time label */}
              <div className="w-14 shrink-0 border-r border-cultured flex items-start justify-end pr-2 pt-0 relative">
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
                    {/* Current time indicator — red top border on the current hour's today cell */}
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
  );
}
