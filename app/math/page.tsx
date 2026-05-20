"use client";

import { useMemo, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Calculator, BookOpen, Trophy, RotateCcw, Loader2, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import MultipleChoiceQuiz, { MCFrage } from "@/components/MultipleChoiceQuiz";
import { useUser } from "@/lib/UserContext";
import { getAktuellesThema } from "@/lib/lernplan";

type Schritt = "start" | "quiz_laden" | "quiz" | "aufgabe_laden" | "aufgabe" | "korrigieren" | "korrektur";

type Aufgabe = {
  aufgabe_text: string;
  aufgabe_latex: string;
  thema: string;
  schwierigkeit: string;
  hinweise: string[];
};

type Korrektur = {
  korrekt: boolean;
  punkte: number;
  feedback: string;
  fehler: string[];
  musterloesung_text: string;
  musterloesung_latex: string;
};

function renderLatex(text: string): string {
  return text
    .replace(/\$\$(.+?)\$\$/gs, (_, inner) => {
      try {
        return katex.renderToString(inner.trim(), { throwOnError: false, displayMode: true });
      } catch {
        return inner;
      }
    })
    .replace(/\$(.+?)\$/g, (_, inner) => {
      try {
        return katex.renderToString(inner.trim(), { throwOnError: false, displayMode: false });
      } catch {
        return inner;
      }
    });
}

export default function MatheSeite() {
  const { addXP, sitzungAbgeschlossen, matheFortschritt } = useUser();
  const aktuellesThema = getAktuellesThema("mathe", matheFortschritt.themaIndex);

  const [schritt, setSchritt] = useState<Schritt>("start");
  const [fragen, setFragen] = useState<MCFrage[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [aktuelleAufgabe, setAktuelleAufgabe] = useState<Aufgabe | null>(null);
  const [loesung, setLoesung] = useState("");
  const [korrektur, setKorrektur] = useState<Korrektur | null>(null);
  const [fehler, setFehler] = useState("");
  const [verdienteXP, setVerdienteXP] = useState(0);
  const [hinweiseSichtbar, setHinweiseSichtbar] = useState(false);

  const aufgabeHTML = useMemo(() => {
    if (!aktuelleAufgabe?.aufgabe_latex) return "";
    return renderLatex(aktuelleAufgabe.aufgabe_latex);
  }, [aktuelleAufgabe]);

  const musterHTML = useMemo(() => {
    if (!korrektur?.musterloesung_latex) return "";
    return renderLatex(korrektur.musterloesung_latex);
  }, [korrektur]);

  const fortschrittProzent = Math.round(
    (matheFortschritt.sitzungenAktuell / aktuellesThema.sitzungenZumAbschluss) * 100
  );

  async function uebungStarten() {
    setFehler("");
    setSchritt("quiz_laden");
    try {
      const res = await fetch("/api/mathe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "quiz",
          thema: aktuellesThema.titel,
          pdfPraefix: aktuellesThema.pdfPraefix,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      ladeAufgabe();
      setFragen(data.questions as MCFrage[]);
      setSchritt("quiz");
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler beim Laden");
      setSchritt("start");
    }
  }

  async function ladeAufgabe() {
    try {
      const res = await fetch("/api/mathe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "aufgabe",
          thema: aktuellesThema.titel,
          pdfPraefix: aktuellesThema.pdfPraefix,
        }),
      });
      const data = await res.json();
      if (res.ok) setAktuelleAufgabe(data as Aufgabe);
    } catch {
      // Wird später erneut versucht
    }
  }

  async function quizAbgeschlossen(score: number) {
    setQuizScore(score);
    if (!aktuelleAufgabe) {
      setSchritt("aufgabe_laden");
      try {
        const res = await fetch("/api/mathe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "aufgabe",
            thema: aktuellesThema.titel,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAktuelleAufgabe(data as Aufgabe);
      } catch (e) {
        setFehler(e instanceof Error ? e.message : "Fehler beim Laden der Aufgabe");
        setSchritt("start");
        return;
      }
    }
    setLoesung("");
    setHinweiseSichtbar(false);
    setSchritt("aufgabe");
  }

  async function loesungAbgeben() {
    if (!aktuelleAufgabe || !loesung.trim()) return;
    setFehler("");
    setSchritt("korrigieren");
    try {
      const res = await fetch("/api/mathe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "korrektur",
          aufgabe: aktuelleAufgabe.aufgabe_text,
          loesung,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const k = data as Korrektur;
      setKorrektur(k);

      const quizBonus = Math.round((quizScore / Math.max(fragen.length, 1)) * 10);
      const loesungsBonus = Math.round((k.punkte / 100) * 20);
      const gesamt = 15 + quizBonus + loesungsBonus;
      setVerdienteXP(gesamt);
      addXP(gesamt);
      sitzungAbgeschlossen("mathe");
      setSchritt("korrektur");
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler bei der Korrektur");
      setSchritt("aufgabe");
    }
  }

  function neueUebung() {
    setSchritt("start");
    setFragen([]);
    setQuizScore(0);
    setAktuelleAufgabe(null);
    setLoesung("");
    setKorrektur(null);
    setFehler("");
    setVerdienteXP(0);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Calculator className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mathematik</h1>
          <p className="text-sm text-slate-500">Theorie · Aufgaben · KI-Korrektur</p>
        </div>
      </div>

      {/* Aktuelles Thema-Banner */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-500 font-medium uppercase tracking-wide">
              Aktuelles Thema · Kapitel {matheFortschritt.themaIndex + 1}
            </p>
            <p className="font-semibold text-emerald-900">{aktuellesThema.titel}</p>
            <p className="text-xs text-emerald-600 mt-0.5">{aktuellesThema.beschreibung}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-emerald-700">{matheFortschritt.sitzungenAktuell}</p>
            <p className="text-xs text-emerald-500">/ {aktuellesThema.sitzungenZumAbschluss} Übungen</p>
          </div>
        </div>
        <div className="w-full bg-emerald-200 rounded-full h-1.5">
          <div
            className="bg-emerald-600 h-1.5 rounded-full transition-all"
            style={{ width: `${fortschrittProzent}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {aktuellesThema.schluesselwoerter.slice(0, 4).map((k) => (
            <span key={k} className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
              {k}
            </span>
          ))}
        </div>
      </div>

      {fehler && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {fehler}
        </div>
      )}

      {/* START */}
      {schritt === "start" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-4">
          <div className="text-5xl">📐</div>
          <h2 className="text-xl font-semibold text-slate-800">Bereit für eine Mathe-Übung?</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Heute: <strong>{aktuellesThema.titel}</strong>. Zuerst Theorie-Check, dann eine Aufgabe mit KI-Korrektur.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Wissenscheck</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1"><Calculator className="w-3.5 h-3.5" /> Aufgabe lösen</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> XP verdienen</span>
          </div>
          <button
            onClick={uebungStarten}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Übung starten
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LADEN */}
      {(schritt === "quiz_laden" || schritt === "aufgabe_laden") && (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-slate-600">
            {schritt === "quiz_laden" ? "Quiz wird generiert..." : "Aufgabe wird geladen..."}
          </p>
        </div>
      )}

      {/* QUIZ */}
      {schritt === "quiz" && fragen.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <BookOpen className="w-4 h-4" />
            Wissenscheck: {aktuellesThema.titel}
          </div>
          <MultipleChoiceQuiz fragen={fragen} onAbgeschlossen={quizAbgeschlossen} />
        </div>
      )}

      {/* AUFGABE LÖSEN */}
      {schritt === "aufgabe" && aktuelleAufgabe && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-slate-800">Aufgabe</h2>
              <div className="flex gap-1.5 shrink-0">
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  {aktuelleAufgabe.thema}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {aktuelleAufgabe.schwierigkeit}
                </span>
              </div>
            </div>

            {aktuelleAufgabe.aufgabe_latex ? (
              <div
                className="text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: aufgabeHTML }}
              />
            ) : (
              <p className="text-slate-700 leading-relaxed">{aktuelleAufgabe.aufgabe_text}</p>
            )}

            {aktuelleAufgabe.hinweise?.length > 0 && (
              <div>
                <button
                  onClick={() => setHinweiseSichtbar(!hinweiseSichtbar)}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  {hinweiseSichtbar ? "Hinweise ausblenden" : "Hinweise anzeigen"}
                </button>
                {hinweiseSichtbar && (
                  <ul className="mt-2 space-y-1">
                    {aktuelleAufgabe.hinweise.map((h, i) => (
                      <li key={i} className="text-xs text-slate-500 flex gap-1.5">
                        <span className="text-emerald-400">→</span>{h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3">
            <h2 className="font-semibold text-slate-800">Deine Lösung</h2>
            <p className="text-xs text-slate-500">Zeige deinen Rechenweg Schritt für Schritt.</p>
            <textarea
              className="w-full min-h-48 rounded-xl border border-slate-200 p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-300 font-mono"
              placeholder={"Schritt 1: ...\nSchritt 2: ...\nErgebnis: ..."}
              value={loesung}
              onChange={(e) => setLoesung(e.target.value)}
            />
            <button
              onClick={loesungAbgeben}
              disabled={!loesung.trim()}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-40 transition-colors"
            >
              Lösung abgeben
            </button>
          </div>
        </div>
      )}

      {/* KORRIGIEREN */}
      {schritt === "korrigieren" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-slate-600">KI überprüft deine Lösung...</p>
        </div>
      )}

      {/* KORREKTUR */}
      {schritt === "korrektur" && korrektur && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">KI-Korrektur</h2>
              <div className="flex items-center gap-2">
                {korrektur.korrekt ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-2xl font-bold ${korrektur.punkte >= 70 ? "text-emerald-600" : korrektur.punkte >= 50 ? "text-amber-600" : "text-red-600"}`}>
                  {korrektur.punkte}/100
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{korrektur.feedback}</p>

            {korrektur.fehler?.length > 0 && (
              <div className="space-y-1">
                {korrektur.fehler.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-lg p-2">
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            )}

            <details className="border border-slate-200 rounded-lg">
              <summary className="p-3 text-sm font-medium text-slate-700 cursor-pointer">
                Musterlösung anzeigen
              </summary>
              <div className="p-3 pt-0 space-y-2">
                {korrektur.musterloesung_latex ? (
                  <div
                    className="text-sm text-slate-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: musterHTML }}
                  />
                ) : (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{korrektur.musterloesung_text}</p>
                )}
              </div>
            </details>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white text-center space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-yellow-300" />
            <p className="font-bold text-xl">+{verdienteXP} XP verdient!</p>
            <p className="text-emerald-100 text-sm">
              Quiz: {quizScore}/{fragen.length} richtig · Aufgabe: {korrektur.punkte}/100 Punkte
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={neueUebung}
              className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Noch eine Aufgabe
            </button>
            <a
              href="/lernplan"
              className="flex items-center justify-center gap-2 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Lernplan ansehen
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
