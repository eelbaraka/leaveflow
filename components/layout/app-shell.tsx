"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Inbox,
  Users,
  Globe2,
  BarChart3,
  Settings,
  Menu,
  Search,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { employees, CURRENT_USER_ID } from "@/lib/mock/employees";
import { leaveRequests } from "@/lib/mock/leave-requests";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: Inbox },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/team", label: "People", icon: Users },
  { href: "/holidays", label: "Holidays", icon: Globe2 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavContent({ pathname, pendingCount, onNavigate }: { pathname: string; pendingCount: number; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 px-3 py-2">
      {nav.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        const badge = item.href === "/requests" ? pendingCount : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
              active
                ? "bg-secondary text-secondary-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {badge > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-foreground text-background tabular-nums min-w-[18px] text-center">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const currentUser = employees.find((e) => e.id === CURRENT_USER_ID)!;
  const pendingCount = leaveRequests.filter(
    (r) => r.status === "pending" && r.approverId === CURRENT_USER_ID
  ).length;
  const initials = currentUser.name.split(" ").map((s) => s[0]).slice(0, 2).join("");

  const Logo = (
    <Link href="/" className="flex items-center gap-2 px-4 h-14 border-b">
      <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="font-semibold text-sm tracking-tight">Leaveflow</span>
    </Link>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[220px] flex-col border-r bg-background shrink-0 sticky top-0 h-screen">
        {Logo}
        <div className="flex-1 overflow-y-auto">
          <NavContent pathname={pathname} pendingCount={pendingCount} />
        </div>
        <div className="border-t p-3">
          <div className="flex items-center gap-2.5 px-1.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate leading-tight">{currentUser.name}</p>
              <p className="text-[10.5px] text-muted-foreground truncate leading-tight mt-0.5">
                {currentUser.jobTitle}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center gap-2 h-14 px-3 sm:px-4 lg:px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Mobile menu trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden -ml-1">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[240px]">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {Logo}
              <NavContent
                pathname={pathname}
                pendingCount={pendingCount}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search..."
              className="w-full h-8 pl-8 pr-3 rounded-md border bg-secondary/30 text-sm outline-none focus:bg-background focus:border-ring transition-colors"
            />
          </div>

          <Button variant="ghost" size="icon" className="relative shrink-0">
            <Bell className="h-4 w-4" />
            {pendingCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
            )}
          </Button>

          {/* Mobile avatar */}
          <Avatar className="h-8 w-8 lg:hidden shrink-0">
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
