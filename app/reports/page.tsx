"use client";

import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employees, teams } from "@/lib/mock/employees";
import { leaveTypes } from "@/lib/mock/leave-types";
import { leaveRequests, balanceFor } from "@/lib/mock/leave-requests";
import { parseISO, format } from "date-fns";

export default function ReportsPage() {
  const [teamFilter, setTeamFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return leaveRequests
      .filter((r) => r.status === "approved")
      .filter((r) => {
        if (typeFilter !== "all" && r.typeId !== typeFilter) return false;
        const emp = employees.find((e) => e.id === r.employeeId)!;
        if (teamFilter !== "all" && emp.team !== teamFilter) return false;
        return true;
      });
  }, [teamFilter, typeFilter]);

  const byType = useMemo(() => {
    return leaveTypes
      .map((t) => ({
        type: t,
        days: filtered.filter((r) => r.typeId === t.id).reduce((s, r) => s + r.days, 0),
        count: filtered.filter((r) => r.typeId === t.id).length,
      }))
      .filter((x) => x.days > 0)
      .sort((a, b) => b.days - a.days);
  }, [filtered]);

  const totalDays = filtered.reduce((s, r) => s + r.days, 0);
  const maxByType = Math.max(...byType.map((x) => x.days), 1);

  const byEmployee = useMemo(() => {
    return employees
      .map((emp) => {
        const used = leaveRequests
          .filter((r) => r.employeeId === emp.id && r.status === "approved")
          .reduce((s, r) => s + r.days, 0);
        const pending = leaveRequests
          .filter((r) => r.employeeId === emp.id && r.status === "pending")
          .reduce((s, r) => s + r.days, 0);
        const ptoBalance = balanceFor(emp.id, "lt1")!;
        return {
          emp,
          used,
          pending,
          remaining: ptoBalance.allowance - ptoBalance.used - ptoBalance.pending,
          allowance: ptoBalance.allowance,
        };
      })
      .filter(({ emp }) => teamFilter === "all" || emp.team === teamFilter)
      .sort((a, b) => b.used - a.used);
  }, [teamFilter]);

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      const key = format(parseISO(r.startDate), "MMM");
      map.set(key, (map.get(key) || 0) + r.days);
    });
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthOrder.map((m) => ({ month: m, days: map.get(m) || 0 }));
  }, [filtered]);

  const maxByMonth = Math.max(...byMonth.map((x) => x.days), 1);

  function exportCSV() {
    const rows = [
      ["Employee", "Team", "Type", "Start", "End", "Days", "Status", "Reason"].join(","),
      ...leaveRequests.map((r) => {
        const emp = employees.find((e) => e.id === r.employeeId)!;
        const t = leaveTypes.find((lt) => lt.id === r.typeId)!;
        return [
          `"${emp.name}"`,
          `"${emp.team}"`,
          `"${t.name}"`,
          r.startDate,
          r.endDate,
          r.days,
          r.status,
          `"${(r.reason || "").replace(/"/g, '""')}"`,
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leave-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 lg:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Export-ready summaries for HR and payroll
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-9">
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {leaveTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportCSV} variant="outline" className="shrink-0">
            <Download /> <span className="hidden sm:inline">CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5 lg:mb-6">
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground font-medium mb-1">Total days</div>
          <div className="text-xl sm:text-2xl font-semibold tabular-nums">{totalDays}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">{filtered.length} requests</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground font-medium mb-1">Avg per person</div>
          <div className="text-xl sm:text-2xl font-semibold tabular-nums">
            {(totalDays / Math.max(1, byEmployee.length)).toFixed(1)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">YTD</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground font-medium mb-1">Top type</div>
          <div className="text-base sm:text-lg font-semibold truncate">{byType[0]?.type.name || "—"}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">{byType[0]?.days || 0} days</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground font-medium mb-1">People</div>
          <div className="text-xl sm:text-2xl font-semibold tabular-nums">{byEmployee.length}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">tracked</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-5 lg:mb-6">
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle>Days by leave type</CardTitle>
            <CardDescription className="text-xs">Approved time off, year-to-date</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0 space-y-2.5">
            {byType.map(({ type, days, count }) => (
              <div key={type.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: type.color }} />
                    <span className="font-medium">{type.name}</span>
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    <span className="text-foreground font-medium">{days}d</span> · {count}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(days / maxByType) * 100}%`, backgroundColor: type.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-5 pb-3">
            <CardTitle>Monthly distribution</CardTitle>
            <CardDescription className="text-xs">Where your team's time off falls</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-0">
            <div className="flex items-end gap-1 h-32">
              {byMonth.map(({ month, days }) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 tabular-nums">
                    {days}
                  </span>
                  <div
                    className="w-full bg-foreground/80 hover:bg-foreground rounded-sm transition-colors"
                    style={{
                      height: `${(days / maxByMonth) * 100}%`,
                      minHeight: days > 0 ? "2px" : "0",
                    }}
                  />
                  <span className="text-[9px] text-muted-foreground">{month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-5 pb-3">
          <CardTitle>Per-employee breakdown</CardTitle>
          <CardDescription className="text-xs">Usage and remaining balance</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y text-xs text-muted-foreground">
                  <th className="text-left font-medium px-4 sm:px-6 py-2">Employee</th>
                  <th className="text-left font-medium px-3 py-2 hidden sm:table-cell">Team</th>
                  <th className="text-right font-medium px-3 py-2 tabular-nums">Used</th>
                  <th className="text-right font-medium px-3 py-2 tabular-nums hidden sm:table-cell">Pending</th>
                  <th className="text-right font-medium px-3 py-2 tabular-nums">Left</th>
                  <th className="text-right font-medium px-4 sm:px-6 py-2 hidden md:table-cell">Usage</th>
                </tr>
              </thead>
              <tbody>
                {byEmployee.map(({ emp, used, pending, remaining, allowance }) => {
                  const pct = (used / allowance) * 100;
                  return (
                    <tr key={emp.id} className="border-b hover:bg-secondary/30">
                      <td className="px-4 sm:px-6 py-3">
                        <div>
                          <p className="font-medium truncate">{emp.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{emp.jobTitle}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground hidden sm:table-cell">{emp.team}</td>
                      <td className="px-3 py-3 text-right tabular-nums">{used}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                        {pending || "—"}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">
                        <span className={remaining < 5 ? "text-destructive font-medium" : ""}>{remaining}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-20 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                backgroundColor:
                                  pct > 80 ? "hsl(var(--destructive))" : pct > 50 ? "#f59e0b" : "#10b981",
                              }}
                            />
                          </div>
                          <span className="text-xs tabular-nums w-9 text-right text-muted-foreground">
                            {pct.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
