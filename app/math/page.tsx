"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function MathPage() {
	const [question, setQuestion] = useState("");
	const [latex, setLatex] = useState("x^2 + 5x + 6 = 0");
	const [answer, setAnswer] = useState("");
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

	const renderedLatex = useMemo(() => {
		try {
			return katex.renderToString(latex, { throwOnError: false, displayMode: true });
		} catch {
			return "Invalid LaTeX";
		}
	}, [latex]);

	async function createIsomorphicProblem() {
		setLoading(true);
		setAnswer("");
		setSourceInfo("");
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					mode: "math",
					scriptFile: selectedScript || undefined,
					question:
						"Erzeuge eine isomorphe Aufgabe mit derselben Loesungslogik, aber anderen Zahlen. Aufgabe: " +
						question,
				}),
			});
			const data = await res.json();
			setAnswer(data.answer ?? data.error ?? "No response");
			setSourceInfo(data.sourceInfo ?? "");
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="space-y-4">
			<h2 className="text-2xl font-semibold">Math Workspace</h2>

			<div className="rounded border bg-white p-4">
				<label className="mb-2 block text-sm text-slate-600">LaTeX Input</label>
				<input
					className="w-full rounded border p-2"
					value={latex}
					onChange={(e) => setLatex(e.target.value)}
				/>
				<div className="mt-4 rounded bg-slate-50 p-4" dangerouslySetInnerHTML={{ __html: renderedLatex }} />
			</div>

			<div className="rounded border bg-white p-4">
				<label className="mb-2 block text-sm text-slate-600">Selected math script (PDF)</label>
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

				<label className="mb-2 block text-sm text-slate-600">Original Problem</label>
				<textarea
					className="min-h-32 w-full rounded border p-2"
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
					placeholder="Enter a problem from your script"
				/>
				<button
					className="mt-3 rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
					disabled={loading || !question.trim() || !selectedScript}
					onClick={createIsomorphicProblem}
				>
					{loading ? "Generating..." : "Generate Isomorphic Problem"}
				</button>
				{sourceInfo ? <p className="mt-2 text-xs text-slate-500">{sourceInfo}</p> : null}
				{answer ? <pre className="mt-3 whitespace-pre-wrap text-sm">{answer}</pre> : null}
			</div>
		</section>
	);
}
