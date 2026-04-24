import { differenceInCalendarDays, eachDayOfInterval, format, isSameDay, parseISO, isWeekend } from "date-fns";
import { holidays } from "../mock/holidays";

export function countWorkingDays(start: string | Date, end: string | Date, countryCode?: string): number {
  const s = typeof start === "string" ? parseISO(start) : start;
  const e = typeof end === "string" ? parseISO(end) : end;
  if (differenceInCalendarDays(e, s) < 0) return 0;
  const days = eachDayOfInterval({ start: s, end: e });
  return days.filter((d) => {
    if (isWeekend(d)) return false;
    if (countryCode) {
      return !holidays.some(
        (h) => h.countryCode === countryCode && isSameDay(parseISO(h.date), d)
      );
    }
    return true;
  }).length;
}

export function fmtDate(date: string | Date, pattern = "MMM d, yyyy") {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern);
}

export function fmtDateRange(start: string, end: string) {
  const s = parseISO(start);
  const e = parseISO(end);
  if (isSameDay(s, e)) return format(s, "MMM d, yyyy");
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${format(s, "MMM d")} – ${format(e, "d, yyyy")}`;
  }
  return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
}
