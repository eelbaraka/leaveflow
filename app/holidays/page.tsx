"use client";

import { useState, useMemo } from "react";
import { Globe2, Calendar as CalendarIcon } from "lucide-react";
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
import { fmtDate } from "@/lib/utils/dates";
import { parseISO, isAfter, format, isSameDay } from "date-fns";

export default function HolidaysPage() {
  const [country, setCountry] = useState("all");
  const today = new Date("2026-04-24");

  const filtered = useMemo(() => {
    const list = country === "all" ? holidays : holidays.filter((h) => h.countryCode === country);
    return list.slice().sort((a, b) => a.date.localeCompare(b.date));
  }, [country]);

  const upcoming = filtered.filter((h) => isAfter(parseISO(h.date), today) || isSameDay(parseISO(h.date), today));
  const past = filtered.filter((h) => !isAfter(parseISO(h.date), today) && !isSameDay(parseISO(h.date), today));

  // Group upcoming by month
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
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1320px] mx-auto">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Calendar</p>
          <h1 className="font-serif text-4xl tracking-tight">Public holidays</h1>
          <p className="text-muted-foreground mt-1">
            {holidays.length} holidays across {countries.length} countries for 2026.
          </p>
        </div>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-[220px]">
            <Globe2 className="h-3.5 w-3.5 mr-1" />
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

      {/* Country pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setCountry("all")}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
            country === "all"
              ? "bg-foreground text-background border-foreground"
              : "border-border hover:border-foreground/30"
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
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                active
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              {c.name} · {count}
            </button>
          );
        })}
      </div>

      {/* Grouped upcoming */}
      <div className="space-y-8">
        {byMonth.map(([month, items]) => (
          <section key={month}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="font-serif text-xl italic">{month}</h2>
              <div className="flex-1 editorial-rule h-px" />
              <span className="text-xs text-muted-foreground font-mono">{items.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((h) => {
                const date = parseISO(h.date);
                const isToday = isSameDay(date, today);
                return (
                  <Card
                    key={h.id}
                    className={`p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      isToday ? "border-accent bg-accent/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center w-12 h-14 rounded-md bg-muted/60 border border-border shrink-0">
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground leading-none">
                          {format(date, "MMM")}
                        </span>
                        <span className="font-serif text-2xl leading-none mt-0.5">
                          {format(date, "d")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{h.name}</p>
                        <p className="text-xs text-muted-foreground">{h.countryName}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                          {format(date, "EEEE")}
                        </p>
                      </div>
                      {isToday && <Badge variant="accent">Today</Badge>}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {past.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="font-serif text-lg italic text-muted-foreground mb-3">Past this year</h2>
          <div className="flex flex-wrap gap-2">
            {past.map((h) => (
              <div
                key={h.id}
                className="text-xs px-2.5 py-1 rounded border border-border bg-muted/30 text-muted-foreground"
              >
                {fmtDate(h.date, "MMM d")} · {h.name} ({h.countryCode})
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
