"use client";

import { useState } from "react";
import { Check, X, Clock, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employees, CURRENT_USER_ID } from "@/lib/mock/employees";
import { leaveTypes } from "@/lib/mock/leave-types";
import { leaveRequests } from "@/lib/mock/leave-requests";
import { fmtDate, fmtDateRange } from "@/lib/utils/dates";
import type { LeaveRequest, LeaveStatus } from "@/lib/types";
import { RequestLeaveDialog } from "@/components/request-leave-dialog";

export default function RequestsPage() {
  const me = employees.find((e) => e.id === CURRENT_USER_ID)!;
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [decisions, setDecisions] = useState<Record<string, LeaveStatus>>({});
  const [openRequest, setOpenRequest] = useState(false);

  const pendingForMe = leaveRequests.filter(
    (r) => r.status === "pending" && r.approverId === me.id && !decisions[r.id]
  );
  const myRequests = leaveRequests.filter((r) => r.employeeId === me.id);
  const all = leaveRequests;

  const filter = (list: LeaveRequest[]) =>
    list.filter((r) => typeFilter === "all" || r.typeId === typeFilter);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 lg:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Leave requests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review, approve, and track time off
          </p>
        </div>
        <Button onClick={() => setOpenRequest(true)} className="sm:w-auto w-full">
          <Plus /> New request
        </Button>
      </div>

      <Tabs defaultValue="pending">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="pending" className="flex-1 sm:flex-none">
              Pending
              {pendingForMe.length > 0 && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-foreground text-background tabular-nums">
                  {pendingForMe.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="mine" className="flex-1 sm:flex-none">Mine</TabsTrigger>
            <TabsTrigger value="all" className="flex-1 sm:flex-none">All</TabsTrigger>
          </TabsList>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-9">
              <SelectValue placeholder="All types" />
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
        </div>

        <TabsContent value="pending">
          <RequestList
            requests={filter(pendingForMe)}
            actions
            onDecision={(id, status) => setDecisions((d) => ({ ...d, [id]: status }))}
          />
        </TabsContent>
        <TabsContent value="mine">
          <RequestList requests={filter(myRequests)} decisions={decisions} />
        </TabsContent>
        <TabsContent value="all">
          <RequestList requests={filter(all)} decisions={decisions} />
        </TabsContent>
      </Tabs>

      <RequestLeaveDialog open={openRequest} onOpenChange={setOpenRequest} />
    </div>
  );
}

function RequestList({
  requests,
  actions,
  onDecision,
  decisions,
}: {
  requests: LeaveRequest[];
  actions?: boolean;
  onDecision?: (id: string, status: LeaveStatus) => void;
  decisions?: Record<string, LeaveStatus>;
}) {
  if (requests.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-sm text-muted-foreground">No requests match your filters</p>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {requests.map((r) => (
        <RequestRow
          key={r.id}
          request={r}
          actions={actions}
          decision={decisions?.[r.id]}
          onDecision={onDecision}
        />
      ))}
    </div>
  );
}

function RequestRow({
  request,
  actions,
  decision,
  onDecision,
}: {
  request: LeaveRequest;
  actions?: boolean;
  decision?: LeaveStatus;
  onDecision?: (id: string, status: LeaveStatus) => void;
}) {
  const emp = employees.find((e) => e.id === request.employeeId)!;
  const type = leaveTypes.find((t) => t.id === request.typeId)!;
  const effectiveStatus = decision || request.status;
  const initials = emp.name.split(" ").map((s) => s[0]).slice(0, 2).join("");

  return (
    <Card className="p-3 sm:p-4 hover:border-ring/20 transition-colors">
      <div className="flex items-start sm:items-center gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1.5fr,1.5fr,auto] gap-2 sm:gap-4 sm:items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{emp.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {emp.jobTitle} · {emp.team}
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
              <span className="truncate tabular-nums">{fmtDateRange(request.startDate, request.endDate)}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate tabular-nums mt-0.5">
              {request.days}d · {type.name} · {fmtDate(request.requestedAt, "MMM d")}
            </p>
          </div>

          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <StatusBadge status={effectiveStatus} />
            {actions && effectiveStatus === "pending" && onDecision && (
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  onClick={() => onDecision(request.id, "rejected")}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                  onClick={() => onDecision(request.id, "approved")}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {request.reason && (
        <p className="text-xs text-muted-foreground mt-2 pl-12 italic">"{request.reason}"</p>
      )}
    </Card>
  );
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, { label: string; variant: "warning" | "success" | "destructive" | "secondary"; icon?: React.ReactNode }> = {
    pending: { label: "Pending", variant: "warning", icon: <Clock className="h-2.5 w-2.5" /> },
    approved: { label: "Approved", variant: "success", icon: <Check className="h-2.5 w-2.5" /> },
    rejected: { label: "Rejected", variant: "destructive", icon: <X className="h-2.5 w-2.5" /> },
    cancelled: { label: "Cancelled", variant: "secondary" },
  };
  const s = map[status];
  return (
    <Badge variant={s.variant} className="shrink-0">
      {s.icon}
      {s.label}
    </Badge>
  );
}
