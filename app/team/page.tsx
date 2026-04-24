"use client";

import { useState, useMemo } from "react";
import { Search, MapPin } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { leaveTypeById } from "@/lib/mock/leave-types";

export default function TeamPage() {
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (query && !e.name.toLowerCase().includes(query.toLowerCase()) && !e.email.toLowerCase().includes(query.toLowerCase()) && !e.jobTitle.toLowerCase().includes(query.toLowerCase())) return false;
      if (teamFilter !== "all" && e.team !== teamFilter) return false;
      if (roleFilter !== "all" && e.role !== roleFilter) return false;
      return true;
    });
  }, [query, teamFilter, roleFilter]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1320px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">People</p>
        <h1 className="font-serif text-4xl tracking-tight">Directory</h1>
        <p className="text-muted-foreground mt-1">
          {employees.length} teammates across {teams.length} teams.
        </p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, title, email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((emp) => {
          const initials = emp.name.split(" ").map((s) => s[0]).slice(0, 2).join("");
          const manager = employees.find((e) => e.id === emp.managerId);
          const ptoBalance = balanceFor(emp.id, "lt1");
          const ptoType = leaveTypeById("lt1")!;
          const ptoUsed = ptoBalance ? ptoBalance.used : 0;
          const ptoPct = ptoBalance ? (ptoUsed / ptoBalance.allowance) * 100 : 0;

          return (
            <Card key={emp.id} className="p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-11 w-11">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{emp.name}</p>
                    {emp.role === "admin" && <Badge variant="accent">Admin</Badge>}
                    {emp.role === "manager" && <Badge variant="outline">Manager</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{emp.jobTitle}</p>
                  <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />
                  {emp.team}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {emp.location}
                </span>
              </div>

              {ptoBalance && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-muted-foreground">PTO used</span>
                    <span className="font-mono">
                      {ptoUsed} / {ptoBalance.allowance}
                    </span>
                  </div>
                  <Progress value={ptoPct} indicatorColor={ptoType.color} />
                </div>
              )}

              {manager && (
                <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border">
                  Reports to {manager.name}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <p className="font-serif text-xl italic text-muted-foreground">No one matches those filters.</p>
        </Card>
      )}
    </div>
  );
}
