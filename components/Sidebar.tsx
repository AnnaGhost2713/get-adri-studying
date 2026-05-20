"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, Flame, Scale, Calculator, Home, Map } from "lucide-react";
import { useUser } from "@/lib/UserContext";

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname();
  const aktiv = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        aktiv
          ? "bg-indigo-50 text-indigo-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function FortschrittBalken({ xp }: { xp: number }) {
  const pct = Math.min(100, Math.floor(((xp % 500) / 500) * 100));
  return (
    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function Sidebar() {
  const { xp, streak, level } = useUser();

  return (
    <aside className="w-60 bg-white border-r border-slate-200 p-4 flex flex-col gap-4 shrink-0">
      <div className="px-1">
        <h1 className="font-bold text-slate-800 text-lg">Exam-Slayer</h1>
        <p className="text-xs text-slate-400">Dein Lernbegleiter</p>
      </div>

      <nav className="space-y-1">
        <NavLink href="/" icon={<Home className="w-4 h-4" />} label="Dashboard" />
        <NavLink href="/law" icon={<Scale className="w-4 h-4" />} label="WPR" />
        <NavLink href="/math" icon={<Calculator className="w-4 h-4" />} label="Mathematik" />
        <NavLink href="/lernplan" icon={<Map className="w-4 h-4" />} label="Lernplan" />
      </nav>

      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Star className="text-yellow-500 w-4 h-4 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs text-slate-500">Level {level}</div>
            <div className="font-semibold text-slate-800 text-sm">{xp} XP</div>
          </div>
        </div>
        <FortschrittBalken xp={xp} />
        <p className="text-xs text-slate-400">
          noch {500 - (xp % 500)} XP bis Level {level + 1}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Flame className="text-amber-500 w-4 h-4 shrink-0" />
        <div>
          <div className="text-xs text-slate-500">Lernserie</div>
          <div className="font-semibold text-slate-800 text-sm">
            {streak === 0 ? "Noch kein Streak" : `${streak} ${streak === 1 ? "Tag" : "Tage"}`}
          </div>
        </div>
      </div>
    </aside>
  );
}
