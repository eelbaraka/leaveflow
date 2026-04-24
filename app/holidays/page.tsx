"use client";

import { useState, useMemo } from "react";
import { Globe2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { holidays, countries } from "@/lib/mock/holidays";
import { parseISO, isAfter, format, isSameDay } from "date-fns";

export default function HolidaysPage() {
  const [country, setCountry] = useState("all");
  const today = new Date("2026-04-24");

  const filtered = useMemo(() => {
    const list = country === "all" ? holidays : holidays.filter((h) => h.countryCode === country);
    return list.slice().sort((a, b) => a.date.localeCompare(b.date));
  }, [country]);

  const upcoming = filtered.filter((h) => isAfter(parseISO(h.date), today) || isSameDay(parseISO(h.date), today));

  const byMonth = useMemo(() => {
    const map = new Map<string, typeof upcoming>();
    upcoming.forEach((h) => {
      const key = format(parseISO(h.date), "MMMM yyyy");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(h);
    });
    return Array.from(map.entries());
  }, [upcoming]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 lg:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Holidays</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {holidays.length} holidays · {countries.length} countries
          </p>
        </div>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Globe2 className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setCountry("all")}
          className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
            country === "all"
              ? "bg-foreground text-background border-foreground"
              : "border-border hover:bg-secondary"
          }`}
        >
          All · {holidays.length}
        </button>
        {countries.map((c) => {
          const count = holidays.filter((h) => h.countryCode === c.code).length;
          const active = country === c.code;
          return (
            <button
              key={c.code}
              onClick={() => setCountry(c.code)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                active
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {c.name} · {count}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {byMonth.map(([month, items]) => (
          <section key={month}>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-sm font-semibold">{month}</h2>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {items.map((h) => {
                const date = parseISO(h.date);
                const isToday = isSameDay(date, today);
                return (
                  <Card
                    key={h.id}
                    className={`p-3 flex items-center gap-3 hover:border-ring/20 transition-colors ${isToday ? "ring-1 ring-foreground" : ""}`}
                  >
                    <div className="flex flex-col items-center justify-center w-11 h-12 rounded-md border bg-secondary/30 shrink-0">
                      <span className="text-[9px] uppercase text-muted-foreground font-medium leading-none">
                        {format(date, "MMM")}
                      </span>
                      <span className="text-lg font-semibold tabular-nums leading-none mt-0.5">
                        {format(date, "d")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{h.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {h.countryName} · {format(date, "EEEE")}
                      </p>
                    </div>
                    {isToday && <Badge className="shrink-0 text-[10px]">Today</Badge>}
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
