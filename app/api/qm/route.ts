import { NextRequest, NextResponse } from "next/server";
import { callGemini, callGeminiWithImage, extractJSON } from "@/lib/ai-client";
import { readPdfsForThema } from "@/lib/pdf-utils";

type QMAction = "quiz" | "aufgabe" | "korrektur";
type Subfach = "wima" | "statistik";

async function getSourceText(subfach: Subfach, pdfPraefix: string): Promise<string> {
  const docs = await readPdfsForThema(subfach, pdfPraefix);
  if (docs.length === 0) return "";
  return docs
    .map((d) => `### ${d.fileName}\n${d.text}`)
    .join("\n\n")
    .slice(0, 40000);
}

const SUBFACH_LABEL: Record<Subfach, string> = {
  wima: "Wirtschaftsmathematik",
  statistik: "Statistik",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action as QMAction;
    const subfach = ((body.subfach as string) || "wima") as Subfach;
    const thema = (body.thema as string) || "";
    const pdfPraefix = (body.pdfPraefix as string) || subfach;
    const fachLabel = SUBFACH_LABEL[subfach] ?? "Quantitative Methoden";

    if (action === "quiz") {
      const source = await getSourceText(subfach, pdfPraefix);
      const sourceHint = source ? `Nutze dieses Lernmaterial als Grundlage:\n\n${source}\n\n` : "";
      const themaHint = thema ? `Fokus auf das Thema: "${thema}"\n` : "";

      const wimaInstr = subfach === "wima"
        ? "Mix aus konzeptuellem Verständnis (2 Fragen) und konkreten Rechenbeispielen (2 Fragen)."
        : "Mix aus begrifflichem Verständnis (2 Fragen) und Interpretationsaufgaben (2 Fragen).";

      const prompt = `${sourceHint}${themaHint}Du bist ein ${fachLabel}-Tutor für Wirtschaftsingenieur-Studenten. Generiere 4 Multiple-Choice-Fragen auf Deutsch${thema ? ` speziell zum Thema "${thema}"` : ""}.

${wimaInstr}

Antworte NUR mit diesem JSON-Format, ohne weiteren Text:
{
  "questions": [
    {
      "frage": "Fragetext",
      "optionen": ["Option A", "Option B", "Option C", "Option D"],
      "richtig": 0,
      "erklaerung": "Kurze Erklärung warum diese Antwort richtig ist"
    }
  ]
}`;
      const raw = await callGemini(prompt);
      const data = extractJSON<{ questions: unknown[] }>(raw);
      return NextResponse.json(data);
    }

    if (action === "aufgabe") {
      const schwierigkeit = (body.schwierigkeit as string) || "mittel";
      const source = await getSourceText(subfach, pdfPraefix);
      const sourceHint = source ? `Nutze dieses Lernmaterial als Grundlage:\n\n${source}\n\n` : "";
      const themaHint = thema ? `Thema: "${thema}"\n` : "";

      const aufgabeInstr = subfach === "wima"
        ? `Die Aufgabe soll:
- Einen klaren mathematischen Rechenweg haben
- Formeln und Berechnungen erfordern
- Wenn möglich, wirtschaftliche Anwendungsbezüge haben
- Mit LaTeX-Formeln dargestellt werden ($ für inline, $$ für Display-Modus)

Antworte NUR mit diesem JSON-Format:
{
  "aufgabe_text": "Die Aufgabe als normaler Text...",
  "aufgabe_latex": "Die Aufgabe mit LaTeX-Formeln...",
  "thema": "z.B. Differentialrechnung",
  "schwierigkeit": "mittel",
  "hinweise": ["Hinweis 1", "Hinweis 2"]
}`
        : `Die Aufgabe soll:
- Konkrete Datenwerte oder Szenarien enthalten
- Statistische Kennzahlen berechnen lassen
- Einen klaren Lösungsweg haben
- Für Wirtschaftsstudenten relevant sein
- Formeln mit LaTeX darstellen ($ für inline wie $\\bar{x}$, $$ für Display-Modus)

Antworte NUR mit diesem JSON-Format:
{
  "aufgabe_text": "Die vollständige Aufgabe als normaler Text, inkl. aller Daten...",
  "aufgabe_latex": "Die Aufgabe mit LaTeX-Formeln für Symbole wie $\\bar{x}$, $s^2$, $\\sigma$ usw.",
  "thema": "z.B. Lagemaße",
  "schwierigkeit": "mittel",
  "hinweise": ["Hinweis 1", "Hinweis 2"]
}`;

      const prompt = `${sourceHint}${themaHint}Du bist ein ${fachLabel}-Tutor. Generiere eine ${schwierigkeit}schwere Übungsaufgabe${thema ? ` zum Thema "${thema}"` : ""} auf Deutsch.

${aufgabeInstr}`;
      const raw = await callGemini(prompt);
      const data = extractJSON<Record<string, unknown>>(raw);
      return NextResponse.json(data);
    }

    if (action === "korrektur") {
      const { aufgabe, loesung, imageBase64, imageMimeType } = body as {
        aufgabe: string;
        loesung: string;
        imageBase64?: string;
        imageMimeType?: string;
      };
      if (!aufgabe || !loesung) {
        return NextResponse.json({ error: "aufgabe und loesung erforderlich" }, { status: 400 });
      }

      const korrekturInstr = subfach === "wima"
        ? `Prüfe:
- Ist die Lösung mathematisch korrekt?
- Ist der Rechenweg nachvollziehbar und vollständig?
- Wurden alle Schritte und Formeln korrekt angewendet?
- Ist das Endergebnis richtig?

Antworte NUR mit diesem JSON-Format:
{
  "korrekt": true,
  "punkte": 85,
  "feedback": "Allgemeines Feedback...",
  "fehler": ["Fehler 1 falls vorhanden"],
  "musterloesung_text": "Vollständige Musterlösung als Text...",
  "musterloesung_latex": "Vollständige Musterlösung mit LaTeX-Formeln ($ für inline, $$ für Display)..."
}`
        : `Prüfe:
- Sind die berechneten Kennzahlen korrekt?
- Wurde der richtige statistische Begriff / die richtige Formel angewendet?
- Ist der Rechenweg nachvollziehbar?
- Sind Einheiten und Interpretation korrekt?

Antworte NUR mit diesem JSON-Format:
{
  "korrekt": true,
  "punkte": 85,
  "feedback": "Allgemeines Feedback...",
  "fehler": ["Fehler 1 falls vorhanden"],
  "musterloesung": "Vollständige Musterlösung als normaler Text...",
  "musterloesung_latex": "Vollständige Musterlösung mit LaTeX-Formeln ($ für inline, $$ für Display)..."
}`;

      const prompt = `Du bist ein ${fachLabel}-Korrektor. Bewerte die folgende Lösung auf Deutsch.

Aufgabe: ${aufgabe}

Lösung des Studenten:
${loesung}

${korrekturInstr}`;
      const raw = imageBase64
        ? await callGeminiWithImage(
            prompt + "\n\nDie Lösung des Studenten ist als handschriftliches Foto beigefügt. Lies und bewerte es.",
            imageBase64,
            (imageMimeType as "image/jpeg" | "image/png" | "image/webp") ?? "image/jpeg"
          )
        : await callGemini(prompt);
      const data = extractJSON<Record<string, unknown>>(raw);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Ungültige action" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
