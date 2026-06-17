import fs from "node:fs/promises";
import path from "node:path";
import pdf from "pdf-parse";

export type ScriptDocument = {
  fileName: string;
  text: string;
};

const SCRIPTS_DIR = path.join(process.cwd(), "public", "scripts");

const FACH_DIR: Record<string, string> = {
  wpr: path.join(SCRIPTS_DIR, "wpr"),
  wima: path.join(SCRIPTS_DIR, "mathe", "wima"),
  statistik: path.join(SCRIPTS_DIR, "mathe", "statistik"),
};

async function listPdfsInDir(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".pdf"))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

async function readPdfFile(absolutePath: string, fileName: string): Promise<ScriptDocument | null> {
  try {
    const buffer = await fs.readFile(absolutePath);
    const parsed = await pdf(buffer);
    return { fileName, text: (parsed.text || "").trim() };
  } catch {
    return null;
  }
}

export async function readPdfsForThema(
  fach: "wpr" | "wima" | "statistik",
  pdfPraefix: string
): Promise<ScriptDocument[]> {
  const dir = FACH_DIR[fach] ?? SCRIPTS_DIR;
  const files = await listPdfsInDir(dir);
  const lower = (s: string) => s.toLowerCase();

  // startsWith first, then includes as fallback (needed for Klausur files starting with "1_" / "2_")
  let matched = files.filter((f) => lower(f).startsWith(lower(pdfPraefix)));
  if (matched.length === 0) {
    matched = files.filter((f) => lower(f).includes(lower(pdfPraefix)));
  }

  // For Probeklausur load up to 4 files (Klausur + Kurzlösung), otherwise max 2
  const isKlausur = lower(pdfPraefix).includes("übungsklausur") || lower(pdfPraefix).includes("klausur");
  const toUse = matched.slice(0, isKlausur ? 4 : 2);

  const docs = await Promise.all(
    toUse.map((f) => readPdfFile(path.join(dir, f), f))
  );
  return docs.filter((d): d is ScriptDocument => Boolean(d && d.text));
}

// Legacy: reads from root scripts dir (used by older routes)
export async function readScriptPdf(fileName: string): Promise<ScriptDocument | null> {
  const safeName = path.basename(fileName);
  return readPdfFile(path.join(SCRIPTS_DIR, safeName), safeName);
}
