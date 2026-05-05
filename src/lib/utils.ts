import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Weekly Calendar ──────────────────────────────────────────────────────────

export const CALENDAR_HOUR_H = 64;
export const CALENDAR_TOTAL_H = CALENDAR_HOUR_H * 24;
export const CALENDAR_HOURS = Array.from({ length: 24 }, (_, i) => i);
export const CALENDAR_DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const CALENDAR_DAYS = 7;

export const SESSION_STATUS_COLOR: Record<string, string> = {
  CREATED:   "bg-gradient-primary border-l-[3px] border-blue-500 text-white",
  IN_CALL:   "bg-yellow-500/10 border-l-[3px] border-yellow-950 text-yellow-600",
  COMPLETED: "bg-success-500/10 border-l-[3px] border-success-900 text-success-600",
  FAILED:    "bg-red-500/10 border-l-[3px] border-red-900 text-red-600",
};

export const SESSION_STATUS_LABEL: Record<string, string> = {
  CREATED:   "Scheduled",
  IN_CALL:   "In Call",
  COMPLETED: "Completed",
  FAILED:    "Failed",
};

export function getWeekStart(from: Date): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - d.getDay()); // snap to Sunday
  d.setHours(0, 0, 0, 0);
  return d;
}

export function buildWeekDays(start: Date): Date[] {
  return Array.from({ length: CALENDAR_DAYS }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function toLocalKey(d: Date): string {
  return d.toLocaleDateString("en-CA");
}

export function minutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function formatCalendarHour(h: number): string {
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

export function formatMonthYear(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  if (weekStart.getMonth() === weekEnd.getMonth()) {
    return weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return `${weekStart.toLocaleDateString("en-US", { month: "short" })} – ${weekEnd.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
}

export function getSessionBlockStyle(
  scheduledStartTime: string,
  scheduledEndTime: string | null,
  dayKey: string,
): { top: number; height: number } | null {
  const start = new Date(scheduledStartTime);
  if (toLocalKey(start) !== dayKey) return null;
  const startMin = minutesFromMidnight(start);
  const endMin = scheduledEndTime
    ? minutesFromMidnight(new Date(scheduledEndTime))
    : startMin + 60;
  const dur = Math.max(endMin - startMin, 30);
  return {
    top: (startMin / 60) * CALENDAR_HOUR_H,
    height: (dur / 60) * CALENDAR_HOUR_H,
  };
}

export function formatSessionTime(
  scheduledStartTime: string,
  scheduledEndTime: string | null,
): string {
  const start = new Date(scheduledStartTime);
  const timeStr = start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  if (!scheduledEndTime) return timeStr;
  const endStr = new Date(scheduledEndTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${timeStr} – ${endStr}`;
}

export type SessionWithLayout = {
  scheduledStartTime: string;
  scheduledEndTime: string | null;
  colIdx: number;
  totalCols: number;
};

export function layoutSessions<T extends { scheduledStartTime: string; scheduledEndTime: string | null }>(
  sessions: T[],
): Array<T & { colIdx: number; totalCols: number }> {
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime(),
  );

  const placed: Array<{ endMs: number; col: number }> = [];
  const result: Array<T & { colIdx: number; totalCols: number }> = [];

  for (const session of sorted) {
    const startMs = new Date(session.scheduledStartTime).getTime();
    const endMs = session.scheduledEndTime
      ? new Date(session.scheduledEndTime).getTime()
      : startMs + 60 * 60 * 1000;

    const overlappingCols = new Set(
      placed.filter((p) => p.endMs > startMs).map((p) => p.col),
    );

    let col = 0;
    while (overlappingCols.has(col)) col++;

    placed.push({ endMs, col });
    result.push({ ...session, colIdx: col, totalCols: 0 });
  }

  // second pass: fix totalCols per overlap group
  for (let i = 0; i < result.length; i++) {
    const s = result[i];
    const startMs = new Date(s.scheduledStartTime).getTime();
    const endMs = s.scheduledEndTime
      ? new Date(s.scheduledEndTime).getTime()
      : startMs + 60 * 60 * 1000;

    let maxCol = s.colIdx;
    for (const other of result) {
      const oStart = new Date(other.scheduledStartTime).getTime();
      const oEnd = other.scheduledEndTime
        ? new Date(other.scheduledEndTime).getTime()
        : oStart + 60 * 60 * 1000;
      if (oStart < endMs && oEnd > startMs) {
        maxCol = Math.max(maxCol, other.colIdx);
      }
    }
    result[i] = { ...s, totalCols: maxCol + 1 };
  }

  return result;
}

