"use client";

import { useState } from "react";
import { Scale, BookOpen, CheckCircle, XCircle, Trophy, RotateCcw, Loader2, ChevronRight } from "lucide-react";
import MultipleChoiceQuiz, { MCFrage } from "@/components/MultipleChoiceQuiz";
import { useUser } from "@/lib/UserContext";
import { getAktuellesThema } from "@/lib/lernplan";

type Schritt = "start" | "quiz_laden" | "quiz" | "fall_laden" | "fall" | "korrigieren" | "korrektur";

type Fall = {
  sachverhalt: string;
  frage: string;
  thema: string;
  relevante_normen: string[];
  hinweise: string[];
};

type Korrektur = {
  punkte: number;
  note: string;
  gesamtfeedback: string;
  obersatz: { ok: boolean; anmerkung: string };
  definition: { ok: boolean; anmerkung: string };
  subsumtion: { ok: boolean; anmerkung: string };
  ergebnis: { ok: boolean; anmerkung: string };
  normen: { ok: boolean; anmerkung: string };
  musterloesung: string;
};

const GUTACHTEN_PLACEHOLDER = `Obersatz: [Name] könnte gegen [Name] einen Anspruch auf ... gemäß § ... BGB haben.

Definition: Ein/e ... liegt vor, wenn ...

Subsumtion: Hier hat [Name] ... . Damit sind die Voraussetzungen erfüllt / nicht erfüllt, weil ...

Ergebnis: [Name] hat / hat keinen Anspruch auf ... gegen [Name].`;

export default function WPRSeite() {
  const { addXP, sitzungAbgeschlossen, wprFortschritt } = useUser();
  const aktuellesThema = getAktuellesThema("wpr", wprFortschritt.themaIndex);

  const [schritt, setSchritt] = useState<Schritt>("start");
  const [fragen, setFragen] = useState<MCFrage[]>([]);
  const [quizScore, setQuizScore] = useState(0);
  const [aktuellerFall, setAktuellerFall] = useState<Fall | null>(null);
  const [loesung, setLoesung] = useState("");
  const [korrektur, setKorrektur] = useState<Korrektur | null>(null);
  const [fehler, setFehler] = useState("");
  const [verdienteXP, setVerdienteXP] = useState(0);
  const [hinweiseSichtbar, setHinweiseSichtbar] = useState(false);

  async function uebungStarten() {
    setFehler("");
    setSchritt("quiz_laden");
    try {
      const res = await fetch("/api/wpr", {
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
      ladeFall();
      setFragen(data.questions as MCFrage[]);
      setSchritt("quiz");
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler beim Laden des Quiz");
      setSchritt("start");
    }
  }

  async function ladeFall() {
    try {
      const res = await fetch("/api/wpr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fall",
          thema: aktuellesThema.titel,
          schluesselwoerter: aktuellesThema.schluesselwoerter,
          pdfPraefix: aktuellesThema.pdfPraefix,
        }),
      });
      const data = await res.json();
      if (res.ok) setAktuellerFall(data as Fall);
    } catch {
      // Fall wird später erneut versucht
    }
  }

  async function quizAbgeschlossen(score: number) {
    setQuizScore(score);
    if (!aktuellerFall) {
      setSchritt("fall_laden");
      try {
        const res = await fetch("/api/wpr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "fall",
            thema: aktuellesThema.titel,
            schluesselwoerter: aktuellesThema.schluesselwoerter,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAktuellerFall(data as Fall);
      } catch (e) {
        setFehler(e instanceof Error ? e.message : "Fehler beim Laden des Falls");
        setSchritt("start");
        return;
      }
    }
    setLoesung("");
    setHinweiseSichtbar(false);
    setSchritt("fall");
  }

  async function loesungAbgeben() {
    if (!aktuellerFall || !loesung.trim()) return;
    setFehler("");
    setSchritt("korrigieren");
    try {
      const res = await fetch("/api/wpr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "korrektur",
          sachverhalt: aktuellerFall.sachverhalt,
          frage: aktuellerFall.frage,
          loesung,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const k = data as Korrektur;
      setKorrektur(k);

      const quizBonus = Math.round((quizScore / Math.max(fragen.length, 1)) * 20);
      const loesungsBonus = Math.round((k.punkte / 100) * 30);
      const gesamt = 50 + quizBonus + loesungsBonus;
      setVerdienteXP(gesamt);
      addXP(gesamt);
      sitzungAbgeschlossen("wpr");
      setSchritt("korrektur");
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler bei der Korrektur");
      setSchritt("fall");
    }
  }

  function neueUebung() {
    setSchritt("start");
    setFragen([]);
    setQuizScore(0);
    setAktuellerFall(null);
    setLoesung("");
    setKorrektur(null);
    setFehler("");
    setVerdienteXP(0);
  }

  const fortschrittProzent = Math.round(
    (wprFortschritt.sitzungenAktuell / aktuellesThema.sitzungenZumAbschluss) * 100
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Scale className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Wirtschaftsprivatrecht</h1>
          <p className="text-sm text-slate-500">Gutachtenstil · BGB · Falltraining</p>
        </div>
      </div>

      {/* Aktuelles Thema-Banner */}
      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">
              Aktuelles Thema · Kapitel {wprFortschritt.themaIndex + 1}
            </p>
            <p className="font-semibold text-indigo-900">{aktuellesThema.titel}</p>
            <p className="text-xs text-indigo-600 mt-0.5">{aktuellesThema.beschreibung}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-indigo-700">{wprFortschritt.sitzungenAktuell}</p>
            <p className="text-xs text-indigo-500">/ {aktuellesThema.sitzungenZumAbschluss} Übungen</p>
          </div>
        </div>
        <div className="w-full bg-indigo-200 rounded-full h-1.5">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all"
            style={{ width: `${fortschrittProzent}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {aktuellesThema.schluesselwoerter.slice(0, 4).map((k) => (
            <span key={k} className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
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
          <div className="text-5xl">⚖️</div>
          <h2 className="text-xl font-semibold text-slate-800">Bereit für eine WPR-Übung?</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Heute: <strong>{aktuellesThema.titel}</strong>. Zuerst 4 MC-Fragen, dann ein Fall im Gutachtenstil.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Wissenscheck</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5" /> Fall lösen</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> XP verdienen</span>
          </div>
          <button
            onClick={uebungStarten}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Übung starten
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* LADEN */}
      {(schritt === "quiz_laden" || schritt === "fall_laden") && (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-600">
            {schritt === "quiz_laden" ? "Quiz wird generiert..." : "Fall wird geladen..."}
          </p>
        </div>
      )}

      {/* QUIZ */}
      {schritt === "quiz" && fragen.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold">
            <BookOpen className="w-4 h-4" />
            Wissenscheck: {aktuellesThema.titel}
          </div>
          <MultipleChoiceQuiz fragen={fragen} onAbgeschlossen={quizAbgeschlossen} />
        </div>
      )}

      {/* FALL LÖSEN */}
      {schritt === "fall" && aktuellerFall && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-slate-800">Sachverhalt</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                {aktuellerFall.thema}
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed">{aktuellerFall.sachverhalt}</p>
            <div className="border-t pt-3">
              <p className="font-medium text-slate-800">{aktuellerFall.frage}</p>
            </div>
            {aktuellerFall.relevante_normen?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {aktuellerFall.relevante_normen.map((n) => (
                  <span key={n} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {n}
                  </span>
                ))}
              </div>
            )}
            {aktuellerFall.hinweise?.length > 0 && (
              <div>
                <button
                  onClick={() => setHinweiseSichtbar(!hinweiseSichtbar)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  {hinweiseSichtbar ? "Hinweise ausblenden" : "Hinweise anzeigen"}
                </button>
                {hinweiseSichtbar && (
                  <ul className="mt-2 space-y-1">
                    {aktuellerFall.hinweise.map((h, i) => (
                      <li key={i} className="text-xs text-slate-500 flex gap-1.5">
                        <span className="text-indigo-400">→</span>{h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3">
            <h2 className="font-semibold text-slate-800">Deine Lösung im Gutachtenstil</h2>
            <p className="text-xs text-slate-500">Obersatz → Definition → Subsumtion → Ergebnis</p>
            <textarea
              className="w-full min-h-64 rounded-xl border border-slate-200 p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder={GUTACHTEN_PLACEHOLDER}
              value={loesung}
              onChange={(e) => setLoesung(e.target.value)}
            />
            <button
              onClick={loesungAbgeben}
              disabled={!loesung.trim()}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors"
            >
              Lösung abgeben
            </button>
          </div>
        </div>
      )}

      {/* KORRIGIEREN */}
      {schritt === "korrigieren" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-slate-600">KI korrigiert deine Lösung...</p>
        </div>
      )}

      {/* KORREKTUR */}
      {schritt === "korrektur" && korrektur && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">KI-Korrektur</h2>
              <div className="text-right">
                <div className={`text-2xl font-bold ${korrektur.punkte >= 70 ? "text-emerald-600" : korrektur.punkte >= 50 ? "text-amber-600" : "text-red-600"}`}>
                  {korrektur.punkte}/100
                </div>
                <div className="text-xs text-slate-500">{korrektur.note}</div>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">{korrektur.gesamtfeedback}</p>

            <div className="grid grid-cols-1 gap-2">
              {(
                [
                  { label: "Obersatz", data: korrektur.obersatz },
                  { label: "Definition", data: korrektur.definition },
                  { label: "Subsumtion", data: korrektur.subsumtion },
                  { label: "Ergebnis", data: korrektur.ergebnis },
                  { label: "Normen", data: korrektur.normen },
                ] as { label: string; data: { ok: boolean; anmerkung: string } }[]
              ).map(({ label, data }) => (
                <div key={label} className={`flex items-start gap-2 p-3 rounded-lg text-sm ${data.ok ? "bg-emerald-50" : "bg-red-50"}`}>
                  {data.ok ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="font-medium">{label}:</span>{" "}
                    <span className={data.ok ? "text-emerald-800" : "text-red-800"}>{data.anmerkung}</span>
                  </div>
                </div>
              ))}
            </div>

            {korrektur.musterloesung && (
              <details className="border border-slate-200 rounded-lg">
                <summary className="p-3 text-sm font-medium text-slate-700 cursor-pointer">
                  Musterlösung anzeigen
                </summary>
                <div className="p-3 pt-0">
                  <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {korrektur.musterloesung}
                  </p>
                </div>
              </details>
            )}
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white text-center space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-yellow-300" />
            <p className="font-bold text-xl">+{verdienteXP} XP verdient!</p>
            <p className="text-indigo-200 text-sm">
              Quiz: {quizScore}/{fragen.length} richtig · Lösung: {korrektur.punkte}/100 Punkte
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={neueUebung}
              className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Noch ein Fall
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
