"use client";

import { useState } from "react";
import { useEffect } from "react";

export default function LawPage() {
	const [draft, setDraft] = useState("");
	const [analysis, setAnalysis] = useState("");
	const [sourceInfo, setSourceInfo] = useState("");
	const [loading, setLoading] = useState(false);
	const [scripts, setScripts] = useState<string[]>([]);
	const [selectedScript, setSelectedScript] = useState("");

	useEffect(() => {
		fetch("/api/chat")
			.then((res) => res.json())
			.then((data) => {
				const files = Array.isArray(data?.availableScripts) ? data.availableScripts : [];
				setScripts(files);
				if (files.length > 0) {
					setSelectedScript(files[0]);
				}
			})
			.catch(() => {
				setScripts([]);
			});
	}, []);

	async function analyzeStructure() {
		setLoading(true);
		setAnalysis("");
		setSourceInfo("");
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					mode: "law",
					scriptFile: selectedScript || undefined,
					question:
						"Pruefe den folgenden Entwurf auf Gutachtenstil (Obersatz, Definition, Subsumtion, Ergebnis) und nenne Luecken:\n\n" +
						draft,
				}),
			});
			const data = await res.json();
			setAnalysis(data.answer ?? data.error ?? "No response");
			setSourceInfo(data.sourceInfo ?? "");
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="grid gap-4 lg:grid-cols-2">
			<div className="rounded border bg-white p-4">
				<h2 className="mb-2 text-xl font-semibold">Case / Script Viewer</h2>
				<label className="mb-2 block text-sm text-slate-600">Selected law script (PDF)</label>
				<select
					className="mb-3 w-full rounded border p-2"
					value={selectedScript}
					onChange={(e) => setSelectedScript(e.target.value)}
				>
					{scripts.length === 0 ? <option value="">No scripts found</option> : null}
					{scripts.map((file) => (
						<option key={file} value={file}>
							{file}
						</option>
					))}
				</select>
				<p className="text-sm text-slate-600">
					Place your law scripts in /public/scripts. They are used as the source of truth.
				</p>
			</div>

			<div className="rounded border bg-white p-4">
				<h2 className="mb-2 text-xl font-semibold">Gutachtenstil Editor</h2>
				<textarea
					className="min-h-56 w-full rounded border p-3"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					placeholder="Write your case analysis draft..."
				/>
				<button
					className="mt-3 rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
					disabled={loading || !draft.trim() || !selectedScript}
					onClick={analyzeStructure}
				>
					{loading ? "Analyzing..." : "Analyze Structure"}
				</button>
				{sourceInfo ? <p className="mt-2 text-xs text-slate-500">{sourceInfo}</p> : null}
				{analysis ? <pre className="mt-3 whitespace-pre-wrap text-sm">{analysis}</pre> : null}
			</div>
		</section>
	);
}
