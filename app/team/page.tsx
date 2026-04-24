"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employees, teams } from "@/lib/mock/employees";
import { balanceFor } from "@/lib/mock/leave-requests";
import { leaveTypeById } from "@/lib/mock/leave-types";

export default function TeamPage() {
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (query) {
        const q = query.toLowerCase();
        if (!e.name.toLowerCase().includes(q) && !e.email.toLowerCase().includes(q) && !e.jobTitle.toLowerCase().includes(q)) return false;
      }
      if (teamFilter !== "all" && e.team !== teamFilter) return false;
      if (roleFilter !== "all" && e.role !== roleFilter) return false;
      return true;
    });
  }, [query, teamFilter, roleFilter]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      <div className="mb-5 lg:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">People</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {employees.length} teammates across {teams.length} teams
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, title, or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
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
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filtered.map((emp) => {
          const initials = emp.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
          const ptoBalance = balanceFor(emp.id, "lt1");
          const ptoType = leaveTypeById("lt1")!;
          const ptoUsed = ptoBalance ? ptoBalance.used : 0;
          const ptoPct = ptoBalance ? (ptoUsed / ptoBalance.allowance) * 100 : 0;

          return (
            <Card key={emp.id} className="p-4 hover:border-ring/20 transition-colors">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-sm font-medium truncate">{emp.name}</p>
                    {emp.role === "admin" && <Badge variant="secondary" className="text-[9px] px-1 py-0 shrink-0">Admin</Badge>}
                    {emp.role === "manager" && <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">Lead</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{emp.jobTitle}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{emp.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span>{emp.team}</span>
                <span>·</span>
                <span>{emp.location}</span>
              </div>

              {ptoBalance && (
                <div>
                  <div className="flex justify-between mb-1 text-xs">
                    <span className="text-muted-foreground">PTO used</span>
                    <span className="font-medium tabular-nums">
                      {ptoUsed} / {ptoBalance.allowance}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${ptoPct}%`, backgroundColor: ptoType.color }}
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">No people match your filters</p>
        </Card>
      )}
    </div>
  );
}
