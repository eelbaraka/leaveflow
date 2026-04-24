"use client";

import { Plus, Edit3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { leaveTypes } from "@/lib/mock/leave-types";
import { employees, teams } from "@/lib/mock/employees";
import { countries } from "@/lib/mock/holidays";

export default function SettingsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-5xl mx-auto">
      <div className="mb-5 lg:mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Leave policies, company details, integrations
        </p>
      </div>

      <Tabs defaultValue="types">
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="types">Leave types</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5">
              <div>
                <CardTitle>Leave types</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {leaveTypes.length} types configured
                </CardDescription>
              </div>
              <Button size="sm">
                <Plus /> Add type
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {leaveTypes.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-secondary/30 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: t.color + "15" }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{t.name}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">{t.code}</span>
                        {!t.paid && <Badge variant="secondary" className="text-[9px]">Unpaid</Badge>}
                        {!t.requiresApproval && <Badge variant="outline" className="text-[9px]">Auto</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                        {t.defaultAllowanceDays} days/year · accrues {t.accrualPerMonth.toFixed(2)}/mo
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <PolicyCard title="Working week" value="Monday – Friday" description="Weekends not counted toward balances" />
            <PolicyCard title="Year rollover" value="Up to 5 days" description="Unused PTO carries to next year" />
            <PolicyCard title="Approval chain" value="Direct manager" description="Requests route to line manager" />
            <PolicyCard title="Conflict threshold" value="3 per team" description="Calendar flags 3+ simultaneous leave" />
            <PolicyCard title="Notice period" value="14 days" description="PTO requires 2 weeks advance notice" />
            <PolicyCard title="Minimum tenure" value="90 days" description="No paid leave during probation" />
          </div>
        </TabsContent>

        <TabsContent value="company" className="mt-4">
          <Card>
            <CardHeader className="p-4 sm:p-5">
              <CardTitle>Company profile</CardTitle>
              <CardDescription className="text-xs">Shown on exports and invites</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label>Company name</Label>
                  <Input defaultValue="Leaveflow Inc." />
                </div>
                <div className="space-y-1.5">
                  <Label>Primary country</Label>
                  <Input defaultValue="United States" />
                </div>
                <div className="space-y-1.5">
                  <Label>Fiscal year start</Label>
                  <Input defaultValue="January 1" />
                </div>
                <div className="space-y-1.5">
                  <Label>Employees</Label>
                  <Input defaultValue={employees.length.toString()} readOnly />
                </div>
              </div>

              <div className="pt-4 border-t grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Teams</div>
                  <p className="text-xl font-semibold tabular-nums">{teams.length}</p>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Countries</div>
                  <p className="text-xl font-semibold tabular-nums">{countries.length}</p>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">Leave types</div>
                  <p className="text-xl font-semibold tabular-nums">{leaveTypes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { name: "Slack", desc: "Request and approve from Slack" },
              { name: "Google Calendar", desc: "Sync approved leave" },
              { name: "Outlook", desc: "Two-way calendar sync" },
              { name: "Gusto", desc: "Export to payroll" },
              { name: "Google SSO", desc: "Single sign-on" },
              { name: "Zapier", desc: "3,000+ app integrations" },
            ].map((i) => (
              <Card key={i.name} className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center shrink-0 text-xs font-semibold">
                  {i.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{i.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{i.desc}</p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0">
                  Connect
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PolicyCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <Card className="p-4 hover:border-ring/20 transition-colors">
      <div className="flex items-start justify-between mb-1.5">
        <p className="text-[11px] text-muted-foreground font-medium">{title}</p>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
          <Edit3 className="h-3 w-3" />
        </Button>
      </div>
      <p className="text-base font-semibold mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );
}
