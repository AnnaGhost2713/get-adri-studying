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

/**
 * Sucht zuerst nach thema-spezifischen PDFs (z.B. "wpr-01-*.pdf"),
 * fällt zurück auf fach-spezifische PDFs ("wpr*.pdf"),
 * und dann auf alle verfügbaren PDFs.
 *
 * Benennungskonvention in /public/scripts/:
 *   wpr-01-rechtssubjekte.pdf  ← thema-spezifisch (beste Genauigkeit)
 *   wpr.pdf                    ← gesamtes WPR-Skript
 *   mathe-05-differential.pdf  ← thema-spezifisch
 *   mathe.pdf                  ← gesamtes Mathe-Skript
 */
export async function readPdfsForThema(
  fach: "wpr" | "mathe",
  pdfPraefix: string
): Promise<ScriptDocument[]> {
  const files = await listScriptPdfs();

  const lower = (s: string) => s.toLowerCase();

  // 1. Thema-spezifische Datei: beginnt mit pdfPraefix (z.B. "wpr-01")
  const themaFiles = files.filter((f) => lower(f).startsWith(lower(pdfPraefix)));

  // 2. Fach-spezifische Datei: beginnt mit fach (z.B. "wpr")
  const fachFiles = files.filter(
    (f) => lower(f).startsWith(lower(fach)) && !themaFiles.includes(f)
  );

  // 3. Alle anderen als Fallback
  const restFiles = files.filter(
    (f) => !themaFiles.includes(f) && !fachFiles.includes(f)
  );

  // Priorität: thema > fach > rest, jeweils max. 2 Dateien
  const ausgewaehlt = [
    ...themaFiles.slice(0, 2),
    ...fachFiles.slice(0, 2),
    ...restFiles.slice(0, 1),
  ].slice(0, 3);

  if (ausgewaehlt.length === 0) return [];

  const docs = await Promise.all(ausgewaehlt.map((f) => readScriptPdf(f)));
  return docs.filter((d): d is ScriptDocument => Boolean(d && d.text));
}
