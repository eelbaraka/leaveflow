"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Check, X, CalendarClock, TreePalm, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

  // My upcoming approved leave
  const myUpcoming = leaveRequests
    .filter((r) => r.employeeId === me.id && r.status === "approved" && isAfter(parseISO(r.endDate), today))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Pending approvals assigned to me
  const pendingForMe = leaveRequests.filter(
    (r) => r.status === "pending" && r.approverId === me.id
  );

  // Team on leave right now (anyone whose approved range covers today)
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

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1320px] mx-auto">
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-6 mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            {fmtDate(today, "EEEE · MMMM d, yyyy")}
          </p>
          <h1 className="font-serif text-5xl leading-[0.95] tracking-tight mb-3">
            Good morning, <span className="italic text-muted-foreground">{me.name.split(" ")[0]}.</span>
          </h1>
          <p className="text-muted-foreground max-w-md leading-relaxed">
            {nextHolidayDays !== null
              ? `Your next break begins in ${nextHolidayDays} days — ${fmtDateRange(myUpcoming[0].startDate, myUpcoming[0].endDate)}.`
              : "No time off scheduled. When did you last take a real break?"}
          </p>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => setOpenRequest(true)} size="lg" className="group">
              <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
              Request leave
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/calendar">
                See team calendar
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <QuickStat
            icon={<TreePalm className="h-4 w-4" />}
            label="Days off this year"
            value={leaveRequests
              .filter((r) => r.employeeId === me.id && r.status === "approved")
              .reduce((s, r) => s + r.days, 0)
              .toString()}
            sub="used so far"
          />
          <QuickStat
            icon={<CalendarClock className="h-4 w-4" />}
            label="Awaiting your nod"
            value={pendingForMe.length.toString()}
            sub={`${pendingForMe.length === 1 ? "request" : "requests"} pending`}
            accent={pendingForMe.length > 0}
          />
          <QuickStat
            icon={<Activity className="h-4 w-4" />}
            label="Out of office"
            value={onLeaveToday.length.toString()}
            sub="today"
          />
          <QuickStat
            icon={<TreePalm className="h-4 w-4" />}
            label="Next holiday"
            value={nextHolidayDays !== null ? `${nextHolidayDays}d` : "—"}
            sub={myUpcoming[0] ? fmtDate(myUpcoming[0].startDate, "MMM d") : "none scheduled"}
          />
        </div>
      </section>

      {/* Balances */}
      <section className="mb-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="font-serif text-2xl">Your allowances</h2>
            <p className="text-sm text-muted-foreground">Tracked automatically against company policy</p>
          </div>
          <Link href="/settings" className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
            Policies →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaveTypes
            .filter((t) => ["lt1", "lt2", "lt3", "lt5"].includes(t.id))
            .map((t) => {
              const b = balanceFor(me.id, t.id)!;
              const remaining = b.allowance - b.used - b.pending;
              const pct = (b.used / b.allowance) * 100;
              return (
                <div
                  key={t.id}
                  className="rounded-lg border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="text-sm font-medium">{t.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">{t.code}</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="font-serif text-4xl tracking-tight">{remaining}</span>
                    <span className="text-sm text-muted-foreground">/ {b.allowance} days</span>
                  </div>
                  <Progress value={pct} indicatorColor={t.color} className="mb-3" />
                  <div className="flex gap-4 text-xs">
                    <span className="text-muted-foreground">
                      Used <span className="text-foreground font-medium">{b.used}</span>
                    </span>
                    {b.pending > 0 && (
                      <span className="text-muted-foreground">
                        Pending <span className="text-foreground font-medium">{b.pending}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Pending approvals for managers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Awaiting your review</CardTitle>
              <CardDescription>
                {pendingForMe.length} pending {pendingForMe.length === 1 ? "request" : "requests"}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/requests">All requests →</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingForMe.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground italic font-serif">
                All clear. Your inbox is quiet.
              </div>
            )}
            {pendingForMe.slice(0, 4).map((r) => {
              const emp = employees.find((e) => e.id === r.employeeId)!;
              const type = leaveTypes.find((t) => t.id === r.typeId)!;
              const initials = emp.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/60 transition-colors group"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{emp.name}</p>
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-xs text-muted-foreground">{type.code}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {fmtDateRange(r.startDate, r.endDate)} · {r.days}d
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-sage-700">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Out of office today */}
        <Card>
          <CardHeader>
            <CardTitle>Out of office today</CardTitle>
            <CardDescription>{onLeaveToday.length} people away · {fmtDate(today, "EEEE")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {onLeaveToday.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground italic font-serif">
                Everyone's in today.
              </div>
            )}
            {onLeaveToday.map(({ request, employee }) => {
              const type = leaveTypes.find((t) => t.id === request.typeId)!;
              const initials = employee.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
              const daysLeft = differenceInCalendarDays(parseISO(request.endDate), today) + 1;
              return (
                <div key={request.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/60 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Back on {fmtDate(new Date(parseISO(request.endDate).getTime() + 86400000), "EEE, MMM d")}
                    </p>
                  </div>
                  <Badge variant="outline" style={{ borderColor: type.color + "66", color: type.color }}>
                    {type.code} · {daysLeft}d left
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <RequestLeaveDialog open={openRequest} onOpenChange={setOpenRequest} />
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
        accent ? "border-accent/40 bg-accent/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={accent ? "text-[hsl(var(--accent))]" : "text-muted-foreground"}>{icon}</span>
      </div>
      <div className="font-serif text-3xl leading-none">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}
