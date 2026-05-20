import { NextRequest, NextResponse } from "next/server";
import { callGemini, extractJSON } from "@/lib/ai-client";
import { readPdfsForThema } from "@/lib/pdf-utils";

type MatheAction = "quiz" | "aufgabe" | "korrektur";

async function getSourceText(pdfPraefix: string): Promise<string> {
  const docs = await readPdfsForThema("mathe", pdfPraefix);
  if (docs.length === 0) return "";
  return docs
    .map((d) => `### ${d.fileName}\n${d.text}`)
    .join("\n\n")
    .slice(0, 40000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action as MatheAction;
    const thema = (body.thema as string) || "";
    const pdfPraefix = (body.pdfPraefix as string) || "mathe";

    if (action === "quiz") {
      const source = await getSourceText(pdfPraefix);
      const sourceHint = source ? `Nutze dieses Lernmaterial als Grundlage:\n\n${source}\n\n` : "";
      const themaHint = thema ? `Fokus auf das Thema: "${thema}"\n` : "";
      const prompt = `${sourceHint}${themaHint}Du bist ein Mathe-Tutor für einen Wirtschaftsingenieur-Studenten. Generiere 4 Multiple-Choice-Fragen auf Deutsch${thema ? ` speziell zum Thema "${thema}"` : " zu wichtigen Themen der Hochschulmathematik"}.

Mix aus konzeptuellem Verständnis (2 Fragen) und konkreten Rechenbeispielen (2 Fragen).

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
      const source = await getSourceText(pdfPraefix);
      const sourceHint = source ? `Nutze dieses Lernmaterial als Grundlage:\n\n${source}\n\n` : "";
      const themaHint = thema ? `Thema: "${thema}"\n` : "";
      const prompt = `${sourceHint}${themaHint}Du bist ein Mathe-Tutor. Generiere eine ${schwierigkeit}schwere Übungsaufgabe für einen Hochschul-Mathematikkurs${thema ? ` zum Thema "${thema}"` : ""} auf Deutsch.

Die Aufgabe soll:
- Konkret und lösbar sein (nicht zu vage)
- Einen klaren Lösungsweg haben
- Für einen Wirtschaftsingenieur-Studenten relevant sein
- Wenn möglich aus dem bereitgestellten Lernmaterial entnommen oder daran angelehnt sein

Antworte NUR mit diesem JSON-Format, ohne weiteren Text:
{
  "aufgabe_text": "Die Aufgabe als normaler Text...",
  "aufgabe_latex": "Die Aufgabe mit LaTeX-Formeln ($ für inline, $$ für Display-Modus)...",
  "thema": "z.B. Differentialrechnung",
  "schwierigkeit": "mittel",
  "hinweise": ["Hinweis 1", "Hinweis 2"]
}`;
      const raw = await callGemini(prompt);
      const data = extractJSON<Record<string, unknown>>(raw);
      return NextResponse.json(data);
    }

    if (action === "korrektur") {
      const { aufgabe, loesung } = body as { aufgabe: string; loesung: string };
      if (!aufgabe || !loesung) {
        return NextResponse.json({ error: "aufgabe und loesung erforderlich" }, { status: 400 });
      }
      const prompt = `Du bist ein Mathe-Korrektor. Bewerte die folgende Lösung auf Deutsch.

Aufgabe: ${aufgabe}

Lösung des Studenten:
${loesung}

Prüfe:
- Ist die Lösung mathematisch korrekt?
- Ist der Rechenweg nachvollziehbar?
- Wurden alle Schritte angegeben?
- Ist das Ergebnis richtig?

Antworte NUR mit diesem JSON-Format, ohne weiteren Text:
{
  "korrekt": true,
  "punkte": 85,
  "feedback": "Allgemeines Feedback...",
  "fehler": ["Fehler 1 falls vorhanden"],
  "musterloesung_text": "Vollständige Musterlösung als Text...",
  "musterloesung_latex": "Vollständige Musterlösung mit LaTeX-Formeln ($ für inline, $$ für Display)..."
}`;
      const raw = await callGemini(prompt);
      const data = extractJSON<Record<string, unknown>>(raw);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Ungültige action" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
