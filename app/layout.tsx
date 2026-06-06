import React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/AuthContext";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Exam-Slayer",
  description: "Lernapp für WPR und Quantitative Methoden",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-slate-50 text-slate-900">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
