"use client";

import React from "react";
import { Star, Flame } from "lucide-react";
import { useUser } from "@/lib/UserContext";

function ProgressBar({ xp }: { xp: number }) {
	const pct = Math.min(100, Math.floor(((xp % 500) / 500) * 100));
	return (
		<div className="w-full bg-slate-200 rounded h-3 overflow-hidden">
			<div
				className="h-full bg-gradient-to-r from-indigo-500 to-pink-500"
				style={{ width: `${pct}%` }}
			/>
		</div>
	);
}

export default function Sidebar() {
	const { xp, streak, level, addMathXP, addLawXP } = useUser();

	return (
		<aside className="w-72 bg-white border-r p-4 flex flex-col gap-4">
			<div className="flex items-center gap-3">
				<Star className="text-yellow-500" />
				<div>
					<div className="text-sm text-slate-500">XP</div>
					<div className="font-semibold">{xp}</div>
				</div>
			</div>

			<div>
				<div className="text-xs text-slate-500">Progress to next level</div>
				<ProgressBar xp={xp} />
				<div className="text-xs text-slate-400 mt-1">Level {level}</div>
			</div>

			<div className="flex items-center gap-3">
					<Flame className="text-amber-500" />
				<div>
					<div className="text-sm text-slate-500">Study Streak</div>
					<div className="font-semibold">{streak} days</div>
				</div>
			</div>

			<div className="mt-auto">
				<div className="text-xs text-slate-500 mb-2">Quick XP (dev)</div>
				<div className="flex gap-2">
					<button
						className="px-3 py-1 bg-indigo-600 text-white rounded"
						onClick={() => addMathXP()}
					>
						+Math XP
					</button>
					<button
						className="px-3 py-1 bg-emerald-600 text-white rounded"
						onClick={() => addLawXP()}
					>
						+Law XP
					</button>
				</div>
			</div>
		</aside>
	);
}
