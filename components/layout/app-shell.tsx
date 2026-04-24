"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Inbox,
  Users,
  Globe2,
  BarChart3,
  Settings,
  Bell,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { employees, CURRENT_USER_ID } from "@/lib/mock/employees";
import { leaveRequests } from "@/lib/mock/leave-requests";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/requests", label: "Requests", icon: Inbox },
  { href: "/calendar", label: "Team calendar", icon: CalendarDays },
  { href: "/team", label: "Directory", icon: Users },
  { href: "/holidays", label: "Holidays", icon: Globe2 },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentUser = employees.find((e) => e.id === CURRENT_USER_ID)!;
  const pendingForMe = leaveRequests.filter(
    (r) => r.status === "pending" && r.approverId === CURRENT_USER_ID
  ).length;
  const initials = currentUser.name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen grain flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[240px] flex-col border-r border-border bg-card/40 backdrop-blur-sm sticky top-0 h-screen">
        <div className="px-6 py-7">
          <Link href="/" className="flex items-baseline gap-1 group">
            <span className="font-serif text-2xl tracking-tight">leaveflow</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent mb-1 transition-transform group-hover:scale-125" />
          </Link>
          <p className="text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Time off, considered.
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            const badge = item.href === "/requests" ? pendingForMe : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all group",
                  active
                    ? "bg-foreground text-background font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "opacity-100" : "opacity-70")} />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      active ? "bg-accent text-accent-foreground" : "bg-accent/15 text-[hsl(var(--accent))]"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground truncate">{currentUser.jobTitle}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/70 backdrop-blur-md px-6">
          <div className="flex-1 flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search people, requests, policies…"
                className="w-full h-8 pl-9 pr-3 bg-transparent border-b border-transparent hover:border-border focus:border-foreground/50 text-sm outline-none transition-colors"
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {pendingForMe > 0 && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </Button>
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-border px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 Leaveflow · Prototype</span>
          <span className="font-mono">v0.1.0</span>
        </footer>
      </div>
    </div>
  );
}
