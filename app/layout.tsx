import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leaveflow — calm leave management for calm teams",
  description: "A considered take on leave, PTO and absence tracking. Built for small and medium teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
