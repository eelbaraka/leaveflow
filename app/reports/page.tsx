"use client";

import { useState, useMemo } from "react";
import { Download, TrendingUp, Users, Calendar as CalendarIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { leaveRequests, balanceFor } from "@/lib/mock/leave-requests";
import { fmtDateRange } from "@/lib/utils/dates";
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

  // Breakdown by type
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

  // Per employee
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

  // Monthly distribution
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
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1320px] mx-auto">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Insights</p>
          <h1 className="font-serif text-4xl tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1">Export-ready summaries for HR, payroll and planning.</p>
        </div>
        <div className="flex gap-3 items-center">
          <Select value={teamFilter} onValueChange={setTeamFilter}>
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[160px]">
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
          <Button onClick={exportCSV} variant="accent">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Total days used</span>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="font-serif text-4xl">{totalDays}</p>
          <p className="text-xs text-muted-foreground mt-1">across {filtered.length} requests</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Avg per person</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="font-serif text-4xl">
            {(totalDays / Math.max(1, byEmployee.length)).toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">days year-to-date</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Highest type</span>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="font-serif text-2xl truncate">{byType[0]?.type.name || "—"}</p>
          <p className="text-xs text-muted-foreground mt-1">{byType[0]?.days || 0} days</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Active employees</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="font-serif text-4xl">{byEmployee.length}</p>
          <p className="text-xs text-muted-foreground mt-1">tracked this year</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Breakdown by type */}
        <Card>
          <CardHeader>
            <CardTitle>Days by leave type</CardTitle>
            <CardDescription>Approved time off, year-to-date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {byType.map(({ type, days, count }) => (
              <div key={type.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
                    {type.name}
                  </span>
                  <span className="font-mono text-xs">
                    <span className="text-foreground">{days}d</span>{" "}
                    <span className="text-muted-foreground">· {count} req.</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(days / maxByType) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Monthly distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly distribution</CardTitle>
            <CardDescription>Where your team's time off falls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byMonth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                  />
                  <RechartsTooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card border border-border p-2 rounded-md shadow-sm">
                            <p className="text-xs font-medium">{payload[0].payload.month}</p>
                            <p className="text-xs text-muted-foreground">{payload[0].value} days off</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="days" radius={[4, 4, 0, 0]} activeBar={{ fill: "hsl(var(--accent))" }}>
                    {byMonth.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.days > 0 ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-employee table */}
      <Card>
        <CardHeader>
          <CardTitle>Per-employee breakdown</CardTitle>
          <CardDescription>Usage, remaining balance and coverage</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-medium px-6 py-2.5">Employee</th>
                  <th className="text-left font-medium px-3 py-2.5">Team</th>
                  <th className="text-right font-medium px-3 py-2.5">Used</th>
                  <th className="text-right font-medium px-3 py-2.5">Pending</th>
                  <th className="text-right font-medium px-3 py-2.5">Remaining</th>
                  <th className="text-right font-medium px-6 py-2.5">Utilisation</th>
                </tr>
              </thead>
              <tbody>
                {byEmployee.map(({ emp, used, pending, remaining, allowance }) => {
                  const pct = (used / allowance) * 100;
                  return (
                    <tr key={emp.id} className="border-b border-border hover:bg-muted/30">
                      <td className="px-6 py-3">
                        <div>
                          <p className="font-medium">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{emp.team}</td>
                      <td className="px-3 py-3 text-right font-mono">{used}</td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                        {pending || "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-mono">
                        <span className={remaining < 5 ? "text-destructive" : ""}>{remaining}</span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                              className="h-full rounded-full"
                              style={{
                                backgroundColor:
                                  pct > 80 ? "#c2433a" : pct > 50 ? "#d98618" : "#677854",
                              }}
                            />
                          </div>
                          <span className="font-mono text-xs w-10 text-right">{pct.toFixed(0)}%</span>
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
