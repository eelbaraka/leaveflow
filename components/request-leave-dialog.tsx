"use client";

import * as React from "react";
import { AlertTriangle, CalendarIcon, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { leaveTypes, leaveTypeById } from "@/lib/mock/leave-types";
import { employees, CURRENT_USER_ID } from "@/lib/mock/employees";
import { leaveRequests, balanceFor } from "@/lib/mock/leave-requests";
import { countWorkingDays, fmtDate } from "@/lib/utils/dates";
import { parseISO } from "date-fns";

export function RequestLeaveDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const me = employees.find((e) => e.id === CURRENT_USER_ID)!;
  const [typeId, setTypeId] = React.useState("lt1");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const type = leaveTypeById(typeId);
  const balance = balanceFor(me.id, typeId);
  const days = startDate && endDate ? countWorkingDays(startDate, endDate, me.location) : 0;

  // Conflict: who else from the team is off during this range?
  const conflicts = React.useMemo(() => {
    if (!startDate || !endDate) return [];
    const s = parseISO(startDate);
    const e = parseISO(endDate);
    return leaveRequests
      .filter((r) => r.status === "approved" && r.employeeId !== me.id)
      .filter((r) => {
        const rs = parseISO(r.startDate);
        const re = parseISO(r.endDate);
        return rs <= e && re >= s;
      })
      .map((r) => employees.find((x) => x.id === r.employeeId)!)
      .filter((emp) => emp.team === me.team);
  }, [startDate, endDate, me.id, me.team]);

  const remaining = balance ? balance.allowance - balance.used - balance.pending : 0;
  const overAllowance = days > remaining && type?.paid;

  function reset() {
    setTypeId("lt1");
    setStartDate("");
    setEndDate("");
    setReason("");
    setSubmitted(false);
  }

  function handleSubmit() {
    // Prototype: just show success state
    setSubmitted(true);
    setTimeout(() => {
      onOpenChange(false);
      setTimeout(reset, 300);
    }, 1400);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setTimeout(reset, 300); onOpenChange(v); }}>
      <DialogContent className="max-w-xl">
        {submitted ? (
          <div className="py-10 flex flex-col items-center text-center gap-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-sage-100 flex items-center justify-center">
              <Check className="h-7 w-7 text-sage-700" />
            </div>
            <h3 className="font-serif text-2xl">Request submitted</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your manager will be notified. You'll see a reply within a day or two.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request time off</DialogTitle>
              <DialogDescription>
                Pick dates, tell us what it's for, and we'll do the rest.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="type">Leave type</Label>
                <Select value={typeId} onValueChange={setTypeId}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                          {t.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="start">From</Label>
                  <Input
                    id="start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min="2026-01-01"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end">To</Label>
                  <Input
                    id="end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || "2026-01-01"}
                  />
                </div>
              </div>

              {days > 0 && type && (
                <div className="rounded-md border border-border bg-muted/30 p-3 text-sm space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      Working days requested
                    </span>
                    <span className="font-medium font-mono">{days}</span>
                  </div>
                  {balance && type.paid && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Remaining after</span>
                      <span
                        className={`font-medium font-mono ${overAllowance ? "text-destructive" : ""}`}
                      >
                        {Math.max(0, remaining - days)} / {balance.allowance}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {overAllowance && (
                <div className="flex gap-2.5 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm animate-fade-in">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Exceeds allowance</p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      You only have {remaining} days of {type?.name} left.
                    </p>
                  </div>
                </div>
              )}

              {conflicts.length > 0 && (
                <div className="flex gap-2.5 p-3 rounded-md bg-ochre-50 border border-ochre-200 text-sm animate-fade-in">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-ochre-700 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-ochre-800">
                      {conflicts.length} teammate{conflicts.length > 1 ? "s" : ""} already off
                    </p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {conflicts.slice(0, 4).map((c) => (
                        <Badge key={c.id} variant="outline" className="text-[10px]">
                          {c.name}
                        </Badge>
                      ))}
                      {conflicts.length > 4 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{conflicts.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="reason">Note {!type?.requiresApproval && "(optional)"}</Label>
                <Textarea
                  id="reason"
                  placeholder="A short note for your manager…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!startDate || !endDate || days === 0}
              >
                {type?.requiresApproval ? "Submit for approval" : "Book leave"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
