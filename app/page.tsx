"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  Check,
  X,
  CalendarClock,
  TreePalm,
  Users,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { employees, CURRENT_USER_ID } from "@/lib/mock/employees";
import { leaveTypes } from "@/lib/mock/leave-types";
import { leaveRequests, balanceFor } from "@/lib/mock/leave-requests";
import { fmtDate, fmtDateRange } from "@/lib/utils/dates";
import { RequestLeaveDialog } from "@/components/request-leave-dialog";
import { parseISO, differenceInCalendarDays, isAfter } from "date-fns";

export default function DashboardPage() {
  const [openRequest, setOpenRequest] = useState(false);
  const me = employees.find((e) => e.id === CURRENT_USER_ID)!;
  const today = new Date();

  const myUpcoming = leaveRequests
    .filter((r) => r.employeeId === me.id && r.status === "approved" && isAfter(parseISO(r.endDate), today))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const pendingForMe = leaveRequests.filter(
    (r) => r.status === "pending" && r.approverId === me.id
  );

  const onLeaveToday = leaveRequests
    .filter(
      (r) =>
        r.status === "approved" &&
        parseISO(r.startDate) <= today &&
        parseISO(r.endDate) >= today
    )
    .map((r) => ({ request: r, employee: employees.find((e) => e.id === r.employeeId)! }));

  const nextHolidayDays =
    myUpcoming.length > 0 ? differenceInCalendarDays(parseISO(myUpcoming[0].startDate), today) : null;

  const myUsedYTD = leaveRequests
    .filter((r) => r.employeeId === me.id && r.status === "approved")
    .reduce((s, r) => s + r.days, 0);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 lg:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Welcome back, {me.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {nextHolidayDays !== null
              ? `Next break in ${nextHolidayDays} days — ${fmtDateRange(myUpcoming[0].startDate, myUpcoming[0].endDate)}`
              : "No time off scheduled"}
          </p>
        </div>
        <Button onClick={() => setOpenRequest(true)} className="sm:w-auto w-full">
          <Plus /> Request leave
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
        <Stat
          icon={<TreePalm className="h-4 w-4" />}
          label="Used this year"
          value={myUsedYTD}
          unit="days"
        />
        <Stat
          icon={<CalendarClock className="h-4 w-4" />}
          label="Pending review"
          value={pendingForMe.length}
          unit={pendingForMe.length === 1 ? "request" : "requests"}
          highlight={pendingForMe.length > 0}
        />
        <Stat
          icon={<Users className="h-4 w-4" />}
          label="Out today"
          value={onLeaveToday.length}
          unit="people"
        />
        <Stat
          icon={<TrendingUp className="h-4 w-4" />}
          label="Next holiday"
          value={nextHolidayDays ?? "—"}
          unit={nextHolidayDays !== null ? "days away" : ""}
        />
      </div>

      {/* Balances */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Your balances</h2>
          <Link
            href="/settings"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View policies
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {leaveTypes
            .filter((t) => ["lt1", "lt2", "lt3", "lt5"].includes(t.id))
            .map((t) => {
              const b = balanceFor(me.id, t.id)!;
              const remaining = b.allowance - b.used - b.pending;
              const pct = Math.max(0, Math.min(100, (b.used / b.allowance) * 100));
              return (
                <Card key={t.id} className="p-4 hover:border-ring/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="text-xs font-medium truncate">{t.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                      {t.code}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2.5">
                    <span className="text-2xl font-semibold tabular-nums">{remaining}</span>
                    <span className="text-xs text-muted-foreground">/ {b.allowance} days</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: t.color }}
                    />
                  </div>
                  <div className="flex gap-3 text-[11px] mt-2 text-muted-foreground tabular-nums">
                    <span>Used <span className="text-foreground font-medium">{b.used}</span></span>
                    {b.pending > 0 && (
                      <span>
                        Pending <span className="text-foreground font-medium">{b.pending}</span>
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
        </div>
      </div>

      {/* Two-column panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5">
            <div>
              <CardTitle>Pending approvals</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {pendingForMe.length === 0 ? "No requests waiting" : `${pendingForMe.length} awaiting your review`}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href="/requests">
                View all <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 pt-0 sm:pt-0">
            {pendingForMe.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                All caught up
              </div>
            ) : (
              <div className="space-y-1">
                {pendingForMe.slice(0, 4).map((r) => {
                  const emp = employees.find((e) => e.id === r.employeeId)!;
                  const type = leaveTypes.find((t) => t.id === r.typeId)!;
                  const initials = emp.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{emp.name}</p>
                        <p className="text-xs text-muted-foreground truncate tabular-nums">
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                            style={{ backgroundColor: type.color }}
                          />
                          {fmtDateRange(r.startDate, r.endDate)} · {r.days}d
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-5">
            <CardTitle>Out today</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {onLeaveToday.length} {onLeaveToday.length === 1 ? "person" : "people"} away · {fmtDate(today, "EEEE, MMM d")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 pt-0 sm:pt-0">
            {onLeaveToday.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Everyone is in today
              </div>
            ) : (
              <div className="space-y-1">
                {onLeaveToday.map(({ request, employee }) => {
                  const type = leaveTypes.find((t) => t.id === request.typeId)!;
                  const initials = employee.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
                  const daysLeft = differenceInCalendarDays(parseISO(request.endDate), today) + 1;
                  return (
                    <div
                      key={request.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors"
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{employee.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Back {fmtDate(new Date(parseISO(request.endDate).getTime() + 86400000), "EEE, MMM d")}
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 tabular-nums text-[10px]">
                        {daysLeft}d left
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <RequestLeaveDialog open={openRequest} onOpenChange={setOpenRequest} />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  unit,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <Card className="p-4 hover:border-ring/20 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
        <span className={highlight ? "text-destructive" : "text-muted-foreground"}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tabular-nums leading-none">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </Card>
  );
}
