import { NextRequest, NextResponse } from "next/server";
import { callGemini, callGeminiWithImage, extractJSON } from "@/lib/ai-client";
import { readPdfsForThema } from "@/lib/pdf-utils";

type WPRAction = "quiz" | "fall" | "korrektur";

async function getSourceText(pdfPraefix: string): Promise<string> {
  const docs = await readPdfsForThema("wpr", pdfPraefix);
  if (docs.length === 0) return "";
  return docs
    .map((d) => `### ${d.fileName}\n${d.text}`)
    .join("\n\n")
    .slice(0, 40000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action as WPRAction;
    const thema = (body.thema as string) || "";
    const pdfPraefix = (body.pdfPraefix as string) || "wpr";

    if (action === "quiz") {
      const source = await getSourceText(pdfPraefix);
      const sourceHint = source ? `Nutze dieses Lernmaterial als Grundlage:\n\n${source}\n\n` : "";
      const themaHint = thema ? `Fokus auf das Thema: "${thema}"\n` : "";
      const prompt = `${sourceHint}${themaHint}Du bist ein WPR-Lernassistent für Wirtschaftsprivatrecht (BGB). Generiere 4 Multiple-Choice-Fragen auf Deutsch${thema ? ` speziell zum Thema "${thema}"` : " zu wichtigen BGB-Themen"}.

Die Fragen sollen unterschiedlich schwer sein: 1x einfach, 2x mittel, 1x anspruchsvoll.

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

    if (action === "fall") {
      const schluesselwoerter = (body.schluesselwoerter as string[]) || [];
      const source = await getSourceText(pdfPraefix);
      const sourceHint = source ? `Nutze dieses Lernmaterial als Grundlage:\n\n${source}\n\n` : "";
      const themaHint = thema
        ? `Thema: "${thema}"${schluesselwoerter.length ? ` (relevante Begriffe: ${schluesselwoerter.join(", ")})` : ""}\n`
        : "";
      const prompt = `${sourceHint}${themaHint}Du bist ein WPR-Lernassistent. Generiere einen realistischen Übungsfall für Wirtschaftsprivatrecht (BGB) auf Deutsch${thema ? ` zum Thema "${thema}"` : ""}.

Der Fall soll:
- Einen klaren Sachverhalt haben (4-6 Sätze)
- Eine eindeutige Prüfungsfrage haben ("Hat A einen Anspruch auf X gegen B?")
- Im Gutachtenstil (Obersatz, Definition, Subsumtion, Ergebnis) lösbar sein
- Typisch für eine WPR-Klausur sein

Antworte NUR mit diesem JSON-Format, ohne weiteren Text:
{
  "sachverhalt": "Der vollständige Sachverhalt...",
  "frage": "Hat ... einen Anspruch auf ... gegen ...?",
  "thema": "z.B. Kaufvertrag §433 BGB",
  "relevante_normen": ["§433 BGB", "§280 BGB"],
  "hinweise": ["Tipp 1 zum Aufbau", "Tipp 2"]
}`;
      const raw = await callGemini(prompt);
      const data = extractJSON<Record<string, unknown>>(raw);
      return NextResponse.json(data);
    }

    if (action === "korrektur") {
      const { sachverhalt, frage, loesung, imageBase64, imageMimeType } = body as {
        sachverhalt: string;
        frage: string;
        loesung: string;
        imageBase64?: string;
        imageMimeType?: string;
      };
      if (!sachverhalt || !loesung) {
        return NextResponse.json({ error: "sachverhalt und loesung erforderlich" }, { status: 400 });
      }
      const prompt = `Du bist ein strenger aber fairer WPR-Korrektor. Bewerte die folgende Gutachtenstil-Lösung auf Deutsch.

Sachverhalt: ${sachverhalt}
Prüfungsfrage: ${frage}

Lösung des Studenten:
${loesung}

Bewerte nach diesen Kriterien des Gutachtenstils:
- Obersatz: Enthält die Lösung einen korrekten Obersatz (Anspruchsgrundlage)?
- Definition: Werden die relevanten Rechtsbegriffe korrekt definiert?
- Subsumtion: Werden die Tatbestandsmerkmale konkret auf den Sachverhalt angewendet?
- Ergebnis: Ist das Ergebnis logisch und korrekt formuliert?
- Normen: Werden die richtigen Gesetzesnormen zitiert?

Antworte NUR mit diesem JSON-Format, ohne weiteren Text:
{
  "punkte": 75,
  "note": "Gut",
  "gesamtfeedback": "Allgemeines Feedback zur Lösung...",
  "obersatz": { "ok": true, "anmerkung": "..." },
  "definition": { "ok": false, "anmerkung": "..." },
  "subsumtion": { "ok": true, "anmerkung": "..." },
  "ergebnis": { "ok": true, "anmerkung": "..." },
  "normen": { "ok": true, "anmerkung": "..." },
  "musterloesung": "Eine vollständige Musterlösung im Gutachtenstil..."
}`;
      const raw = imageBase64
        ? await callGeminiWithImage(
            prompt + "\n\nDie Lösung des Studenten ist als handschriftliches Foto beigefügt. Lies den Gutachtenstil und bewerte ihn.",
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
