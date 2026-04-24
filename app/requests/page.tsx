"use client";

import { useState, useMemo } from "react";
import { Check, X, Clock, Filter, Plus } from "lucide-react";
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [decisions, setDecisions] = useState<Record<string, LeaveStatus>>({});
  const [openRequest, setOpenRequest] = useState(false);

  const pendingForMe = leaveRequests.filter(
    (r) => r.status === "pending" && r.approverId === me.id && !decisions[r.id]
  );
  const myRequests = leaveRequests.filter((r) => r.employeeId === me.id);
  const all = leaveRequests;

  const filter = (list: LeaveRequest[]) =>
    list.filter((r) => {
      if (typeFilter !== "all" && r.typeId !== typeFilter) return false;
      const effectiveStatus = decisions[r.id] || r.status;
      if (statusFilter !== "all" && effectiveStatus !== statusFilter) return false;
      return true;
    });

  return (
    <div className="px-8 py-8 max-w-[1320px] mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
            Inbox
          </p>
          <h1 className="font-serif text-4xl tracking-tight">Leave requests</h1>
          <p className="text-muted-foreground mt-1">Review, approve, and track time off — yours and your team's.</p>
        </div>
        <Button onClick={() => setOpenRequest(true)}>
          <Plus className="h-4 w-4" /> New request
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="h-3.5 w-3.5" /> Filter
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[160px] text-xs">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending approval
            {pendingForMe.length > 0 && (
              <span className="ml-2 text-[10px] bg-accent/15 text-[hsl(var(--accent))] rounded-full px-1.5 py-0.5">
                {pendingForMe.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="mine">My requests ({myRequests.length})</TabsTrigger>
          <TabsTrigger value="all">All requests</TabsTrigger>
        </TabsList>

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
        <p className="font-serif text-xl italic text-muted-foreground">Nothing here.</p>
        <p className="text-sm text-muted-foreground mt-1">Try changing your filters.</p>
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
  const approver = employees.find((e) => e.id === request.approverId);
  const effectiveStatus = decision || request.status;
  const initials = emp.name.split(" ").map((s) => s[0]).slice(0, 2).join("");

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[1.5fr,1.5fr,1fr,auto] gap-3 items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{emp.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {emp.jobTitle} · {emp.team}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
              <span className="text-sm">{fmtDateRange(request.startDate, request.endDate)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {request.days} day{request.days > 1 ? "s" : ""} · {type.name}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground truncate italic">
              {request.reason || "—"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              Requested {fmtDate(request.requestedAt, "MMM d")}
            </p>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <StatusBadge status={effectiveStatus} />
            {actions && effectiveStatus === "pending" && onDecision && (
              <div className="flex gap-1 ml-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 hover:border-destructive hover:text-destructive"
                  onClick={() => onDecision(request.id, "rejected")}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 hover:border-sage-500 hover:text-sage-700 hover:bg-sage-50"
                  onClick={() => onDecision(request.id, "approved")}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {request.note && (
        <div className="mt-3 ml-14 pl-4 border-l-2 border-border text-xs text-muted-foreground italic">
          {approver?.name}: "{request.note}"
        </div>
      )}
    </Card>
  );
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const map: Record<LeaveStatus, { label: string; variant: any; icon?: React.ReactNode }> = {
    pending: { label: "Pending", variant: "warning", icon: <Clock className="h-2.5 w-2.5" /> },
    approved: { label: "Approved", variant: "success", icon: <Check className="h-2.5 w-2.5" /> },
    rejected: { label: "Rejected", variant: "destructive", icon: <X className="h-2.5 w-2.5" /> },
    cancelled: { label: "Cancelled", variant: "muted" },
  };
  const s = map[status];
  return (
    <Badge variant={s.variant}>
      {s.icon}
      {s.label}
    </Badge>
  );
}
