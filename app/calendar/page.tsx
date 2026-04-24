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
import { ChevronLeft, ChevronRight, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  const [month, setMonth] = useState(new Date(2026, 4, 1)); // May 2026 — where action is
  const [teamFilter, setTeamFilter] = useState<string>("all");

  const filteredEmployees = useMemo(() => {
    if (teamFilter === "all") return employees;
    return employees.filter((e) => e.team === teamFilter);
  }, [teamFilter]);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOffset = (getDay(monthStart) + 6) % 7; // Monday first

  // Active leave on any given day
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

  // Conflict threshold: 3+ people from same team off on same day
  const isConflictDay = (date: Date) => {
    const dayLeaves = leaveForDay(date);
    const teamCounts: Record<string, number> = {};
    dayLeaves.forEach(({ employee }) => {
      teamCounts[employee.team] = (teamCounts[employee.team] || 0) + 1;
    });
    return Object.values(teamCounts).some((c) => c >= 3);
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1440px] mx-auto">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Planning</p>
          <h1 className="font-serif text-4xl tracking-tight">Team calendar</h1>
          <p className="text-muted-foreground mt-1">
            See who's away, plan around coverage gaps, avoid the pile-ups.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-[180px]">
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
          <div className="flex items-center gap-2 border border-border rounded-md bg-card">
            <Button variant="ghost" size="icon" onClick={() => setMonth(subMonths(month, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-serif text-lg min-w-[140px] text-center">
              {format(month, "MMMM yyyy")}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4 text-xs text-muted-foreground flex-wrap">
        {leaveTypes.slice(0, 4).map((t) => (
          <div key={t.id} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
            {t.name}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-ochre-200 border border-ochre-400" />
          Public holiday
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-destructive" />
          Conflict (3+ same team)
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Weekday header */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/30">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="px-3 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[120px] border-b border-r border-border bg-muted/10" />
          ))}
          {days.map((date) => {
            const dayLeaves = leaveForDay(date);
            const dayHolidays = holidayForDay(date);
            const weekend = isWeekend(date);
            const conflict = isConflictDay(date);
            const isToday = isSameDay(date, new Date("2026-04-24"));

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "min-h-[120px] border-b border-r border-border p-2 relative transition-colors",
                  weekend && "bg-muted/20",
                  dayHolidays.length > 0 && "bg-ochre-50/50",
                  conflict && "bg-destructive/5",
                  !isSameMonth(date, monthStart) && "opacity-40"
                )}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <span
                    className={cn(
                      "text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full",
                      isToday && "bg-foreground text-background font-medium"
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  {conflict && <AlertTriangle className="h-3 w-3 text-destructive" />}
                </div>

                {dayHolidays.length > 0 && (
                  <div className="mb-1">
                    {dayHolidays.slice(0, 1).map((h) => (
                      <div
                        key={h.id}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-ochre-100 text-ochre-800 border border-ochre-200 truncate"
                        title={`${h.name} · ${h.countryName}`}
                      >
                        {h.name}
                      </div>
                    ))}
                    {dayHolidays.length > 1 && (
                      <div className="text-[10px] text-muted-foreground pl-1">
                        +{dayHolidays.length - 1} more
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-0.5">
                  {dayLeaves.slice(0, 3).map(({ request, employee, type }) => {
                    const initials = employee.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("");
                    return (
                      <div
                        key={request.id + date.toISOString()}
                        className={cn(
                          "flex items-center gap-1.5 text-[10.5px] px-1 py-0.5 rounded truncate",
                          request.status === "pending" && "opacity-60 border border-dashed"
                        )}
                        style={{
                          backgroundColor: type.color + "18",
                          borderLeftWidth: 2,
                          borderLeftStyle: "solid",
                          borderLeftColor: type.color,
                        }}
                        title={`${employee.name} · ${type.name}${request.status === "pending" ? " (pending)" : ""}`}
                      >
                        <span className="font-mono text-[8px] font-medium">{initials}</span>
                        <span className="truncate">{employee.name.split(" ")[0]}</span>
                      </div>
                    );
                  })}
                  {dayLeaves.length > 3 && (
                    <div className="text-[10px] text-muted-foreground pl-1">
                      +{dayLeaves.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Month summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <Users className="h-3.5 w-3.5" /> Team usage
          </div>
          <p className="font-serif text-3xl">
            {leaveRequests
              .filter(
                (r) =>
                  r.status === "approved" &&
                  isSameMonth(parseISO(r.startDate), month)
              )
              .reduce((s, r) => s + r.days, 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">days off this month</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Coverage risk
          </div>
          <p className="font-serif text-3xl">{days.filter(isConflictDay).length}</p>
          <p className="text-xs text-muted-foreground mt-1">days with 3+ from same team off</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <Users className="h-3.5 w-3.5" /> Public holidays
          </div>
          <p className="font-serif text-3xl">
            {days.reduce((s, d) => s + holidayForDay(d).length, 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">across all locations</p>
        </Card>
      </div>
    </div>
  );
}
