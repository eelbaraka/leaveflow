import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leaveflow — Leave management for modern teams",
  description: "Request, approve, and track time off. Designed for small and medium teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
