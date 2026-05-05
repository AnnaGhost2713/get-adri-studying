import fs from "node:fs/promises";
import path from "node:path";
import pdf from "pdf-parse";

export type ScriptDocument = {
	fileName: string;
	text: string;
};

const SCRIPTS_DIR = path.join(process.cwd(), "public", "scripts");

export async function listScriptPdfs(): Promise<string[]> {
	try {
		const entries = await fs.readdir(SCRIPTS_DIR, { withFileTypes: true });
		return entries
			.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
			.map((entry) => entry.name);
	} catch {
		return [];
	}
}

export async function readScriptPdf(fileName: string): Promise<ScriptDocument | null> {
	const safeName = path.basename(fileName);
	const absolutePath = path.join(SCRIPTS_DIR, safeName);

	try {
		const fileBuffer = await fs.readFile(absolutePath);
		const parsed = await pdf(fileBuffer);
		return {
			fileName: safeName,
			text: (parsed.text || "").trim(),
		};
	} catch {
		return null;
	}
}

export async function readAllScriptPdfs(limit = 3): Promise<ScriptDocument[]> {
	const files = await listScriptPdfs();
	const selected = files.slice(0, Math.max(1, limit));

	const docs = await Promise.all(selected.map((f) => readScriptPdf(f)));
	return docs.filter((d): d is ScriptDocument => Boolean(d && d.text));
}
