"use client";

import { useState } from "react";
import { Plus, Edit3, Globe2, Building2, Users, Palette } from "lucide-react";
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
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1100px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Configuration</p>
        <h1 className="font-serif text-4xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Leave policies, company details, integrations.</p>
      </div>

      <Tabs defaultValue="types">
        <TabsList>
          <TabsTrigger value="types">Leave types</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="types">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Leave types</CardTitle>
                <CardDescription>
                  {leaveTypes.length} types configured. Customize names, colors, and default allowances.
                </CardDescription>
              </div>
              <Button variant="accent">
                <Plus className="h-4 w-4" /> New type
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {leaveTypes.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: t.color + "22" }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{t.name}</p>
                        <span className="font-mono text-[10px] text-muted-foreground uppercase">
                          {t.code}
                        </span>
                        {!t.paid && (
                          <Badge variant="muted" className="text-[10px]">
                            Unpaid
                          </Badge>
                        )}
                        {!t.requiresApproval && (
                          <Badge variant="secondary" className="text-[10px]">
                            Auto-approve
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.defaultAllowanceDays} days/year · accrues {t.accrualPerMonth.toFixed(2)}/month
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PolicyCard
              title="Working week"
              value="Monday – Friday"
              description="Weekend days are not counted toward leave balances."
            />
            <PolicyCard
              title="Year rollover"
              value="Up to 5 days"
              description="Unused PTO up to 5 days carries to next year."
            />
            <PolicyCard
              title="Approval chain"
              value="Direct manager"
              description="Requests route to the employee's line manager."
            />
            <PolicyCard
              title="Conflict threshold"
              value="3 per team"
              description="Calendar flags coverage risk when 3+ are away."
            />
            <PolicyCard
              title="Notice period"
              value="14 days"
              description="PTO requires 2 weeks advance notice; sick leave does not."
            />
            <PolicyCard
              title="Minimum tenure"
              value="90 days"
              description="New employees can't take paid leave before probation ends."
            />
          </div>
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company profile</CardTitle>
              <CardDescription>Basic details shown on exports and invites</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

              <div className="pt-4 border-t border-border grid grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    <Users className="h-3.5 w-3.5" /> Teams
                  </div>
                  <p className="font-serif text-2xl">{teams.length}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    <Globe2 className="h-3.5 w-3.5" /> Countries
                  </div>
                  <p className="font-serif text-2xl">{countries.length}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    <Palette className="h-3.5 w-3.5" /> Leave types
                  </div>
                  <p className="font-serif text-2xl">{leaveTypes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Slack", desc: "Request and approve leave from Slack", status: "Connect" },
              { name: "Google Calendar", desc: "Sync approved leave to calendar", status: "Connect" },
              { name: "Outlook", desc: "Two-way Outlook calendar sync", status: "Connect" },
              { name: "Payroll (Gusto)", desc: "Export leave data to payroll", status: "Connect" },
              { name: "SSO (Google)", desc: "Single sign-on for your team", status: "Connect" },
              { name: "Zapier", desc: "3,000+ app integrations", status: "Connect" },
            ].map((i) => (
              <Card key={i.name} className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.desc}</p>
                </div>
                <Button variant="outline" size="sm">
                  {i.status}
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PolicyCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
        <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 -mr-1">
          <Edit3 className="h-3 w-3" />
        </Button>
      </div>
      <p className="font-serif text-xl mb-1">{value}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </Card>
  );
}
