"use client";

import { useState, useMemo } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  parseISO,
  isWeekend,
  isSameMonth,
  getDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employees, teams } from "@/lib/mock/employees";
import { leaveTypes } from "@/lib/mock/leave-types";
import { leaveRequests } from "@/lib/mock/leave-requests";
import { holidays } from "@/lib/mock/holidays";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date(2026, 4, 1));
  const [teamFilter, setTeamFilter] = useState<string>("all");

  const filteredEmployees = useMemo(() => {
    if (teamFilter === "all") return employees;
    return employees.filter((e) => e.team === teamFilter);
  }, [teamFilter]);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOffset = (getDay(monthStart) + 6) % 7;

  const leaveForDay = (date: Date) =>
    leaveRequests
      .filter(
        (r) =>
          (r.status === "approved" || r.status === "pending") &&
          parseISO(r.startDate) <= date &&
          parseISO(r.endDate) >= date
      )
      .map((r) => ({
        request: r,
        employee: employees.find((e) => e.id === r.employeeId)!,
        type: leaveTypes.find((t) => t.id === r.typeId)!,
      }))
      .filter(({ employee }) => filteredEmployees.some((e) => e.id === employee.id));

  const holidayForDay = (date: Date) =>
    holidays.filter((h) => isSameDay(parseISO(h.date), date));

  const isConflictDay = (date: Date) => {
    const dayLeaves = leaveForDay(date);
    const teamCounts: Record<string, number> = {};
    dayLeaves.forEach(({ employee }) => {
      teamCounts[employee.team] = (teamCounts[employee.team] || 0) + 1;
    });
    return Object.values(teamCounts).some((c) => c >= 3);
  };

  const upcomingByDay = days
    .map((d) => ({
      date: d,
      leaves: leaveForDay(d),
      holidays: holidayForDay(d),
      conflict: isConflictDay(d),
    }))
    .filter((d) => d.leaves.length > 0 || d.holidays.length > 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 lg:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Team calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Plan around coverage gaps and avoid pile-ups
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teams.map((t) => (
                <SelectItem key={t.id} value={t.name}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-md shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setMonth(subMonths(month, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-medium tabular-nums min-w-[120px] text-center">
              {format(month, "MMM yyyy")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setMonth(addMonths(month, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground flex-wrap">
        {leaveTypes.slice(0, 4).map((t) => (
          <div key={t.id} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
            {t.name}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-amber-200 border border-amber-300" />
          Holiday
        </div>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 text-destructive" />
          Conflict
        </div>
      </div>

      {/* Desktop calendar */}
      <Card className="hidden md:block overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-secondary/30">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-[11px] font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div
              key={`pad-${i}`}
              className="min-h-[100px] lg:min-h-[110px] border-b border-r bg-secondary/20"
            />
          ))}
          {days.map((date, idx) => {
            const dayLeaves = leaveForDay(date);
            const dayHolidays = holidayForDay(date);
            const weekend = isWeekend(date);
            const conflict = isConflictDay(date);
            const isToday = isSameDay(date, new Date("2026-04-24"));
            const isLastRow = Math.floor((idx + startDayOffset) / 7) === Math.floor((days.length + startDayOffset - 1) / 7);
            const isLastCol = (idx + startDayOffset + 1) % 7 === 0;

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "min-h-[100px] lg:min-h-[110px] p-1.5 relative",
                  !isLastCol && "border-r",
                  !isLastRow && "border-b",
                  weekend && "bg-secondary/20",
                  dayHolidays.length > 0 && "bg-amber-50/40",
                  conflict && "bg-destructive/5",
                  !isSameMonth(date, monthStart) && "opacity-40"
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <span
                    className={cn(
                      "text-[11px] tabular-nums w-5 h-5 flex items-center justify-center rounded-full font-medium",
                      isToday && "bg-foreground text-background"
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  {conflict && <AlertCircle className="h-3 w-3 text-destructive" />}
                </div>
                {dayHolidays.length > 0 && (
                  <div
                    className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-900 truncate mb-0.5"
                    title={`${dayHolidays[0].name} · ${dayHolidays[0].countryName}`}
                  >
                    {dayHolidays[0].name}
                  </div>
                )}
                <div className="space-y-0.5">
                  {dayLeaves.slice(0, 3).map(({ request, employee, type }) => (
                    <div
                      key={request.id + date.toISOString()}
                      className={cn(
                        "text-[10.5px] px-1 py-0.5 rounded truncate font-medium",
                        request.status === "pending" && "opacity-60"
                      )}
                      style={{
                        backgroundColor: type.color + "20",
                        color: type.color,
                      }}
                      title={`${employee.name} · ${type.name}`}
                    >
                      {employee.name.split(" ")[0]}
                    </div>
                  ))}
                  {dayLeaves.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-1">
                      +{dayLeaves.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Mobile agenda view */}
      <div className="md:hidden space-y-2">
        {upcomingByDay.length === 0 && (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No leave or holidays this month
          </Card>
        )}
        {upcomingByDay.map(({ date, leaves, holidays: holsOnDay, conflict }) => (
          <Card key={date.toISOString()} className="overflow-hidden">
            <div className={cn(
              "flex items-center gap-3 px-4 py-2.5 border-b bg-secondary/20",
              conflict && "bg-destructive/5"
            )}>
              <div className="flex items-center justify-center w-10 h-10 rounded-md border bg-background shrink-0">
                <div className="text-center">
                  <div className="text-[9px] uppercase text-muted-foreground leading-none font-medium">
                    {format(date, "EEE")}
                  </div>
                  <div className="text-sm font-semibold tabular-nums leading-none mt-0.5">
                    {format(date, "d")}
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{format(date, "EEEE, MMM d")}</div>
                {conflict && (
                  <div className="text-[11px] text-destructive flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3" /> Coverage conflict
                  </div>
                )}
              </div>
            </div>
            <CardContent className="p-3 space-y-1.5">
              {holsOnDay.map((h) => (
                <div key={h.id} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-sm bg-amber-300" />
                  <span className="font-medium">{h.name}</span>
                  <span className="text-muted-foreground">· {h.countryName}</span>
                </div>
              ))}
              {leaves.map(({ request, employee, type }) => (
                <div key={request.id} className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
                  <span className="font-medium">{employee.name}</span>
                  <span className="text-muted-foreground truncate">· {type.code}</span>
                  {request.status === "pending" && (
                    <Badge variant="warning" className="ml-auto text-[9px] px-1 py-0">pending</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-5 lg:mt-6">
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground font-medium mb-1">Days used</div>
          <div className="text-xl sm:text-2xl font-semibold tabular-nums">
            {leaveRequests
              .filter(
                (r) => r.status === "approved" && isSameMonth(parseISO(r.startDate), month)
              )
              .reduce((s, r) => s + r.days, 0)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">this month</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground font-medium mb-1">Conflicts</div>
          <div className="text-xl sm:text-2xl font-semibold tabular-nums">
            {days.filter(isConflictDay).length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">coverage risks</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground font-medium mb-1">Holidays</div>
          <div className="text-xl sm:text-2xl font-semibold tabular-nums">
            {days.reduce((s, d) => s + holidayForDay(d).length, 0)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">across regions</div>
        </Card>
      </div>
    </div>
  );
}
