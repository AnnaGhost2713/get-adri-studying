"use client";

import { useState, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { BarChart2, Trophy, RotateCcw, Loader2, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import LoesungsEingabe from "@/components/LoesungsEingabe";
import { useUser } from "@/lib/UserContext";
import { getAktuellesThema } from "@/lib/lernplan";

type Schritt = "start" | "laden" | "aufgabe" | "korrigieren" | "korrektur";

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

type Aufgabe = {
  aufgabe_text: string;
  aufgabe_latex?: string;
  thema: string;
  schwierigkeit: string;
  hinweise: string[];
};

type Korrektur = {
  korrekt: boolean;
  punkte: number;
  feedback: string;
  fehler: string[];
  musterloesung: string;
  musterloesung_latex?: string;
};

export default function StatistikSeite() {
  const { addXP, sitzungAbgeschlossen, statistikFortschritt } = useUser();
  const aktuellesThema = getAktuellesThema("statistik", statistikFortschritt.themaIndex);

  const [schritt, setSchritt] = useState<Schritt>("start");
  const [aktuelleAufgabe, setAktuelleAufgabe] = useState<Aufgabe | null>(null);
  const [loesung, setLoesung] = useState("");
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [fotoMimeType, setFotoMimeType] = useState<string | null>(null);
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
    (statistikFortschritt.sitzungenAktuell / aktuellesThema.sitzungenZumAbschluss) * 100
  );

  const istProbeklausur = aktuellesThema.titel === "Probeklausur";

  async function aufgabeStarten() {
    setFehler("");
    setSchritt("laden");
    try {
      const res = await fetch("/api/qm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "aufgabe",
          subfach: "statistik",
          thema: aktuellesThema.titel,
          pdfPraefix: aktuellesThema.pdfPraefix,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAktuelleAufgabe(data as Aufgabe);
      setLoesung("");
      setHinweiseSichtbar(false);
      setSchritt("aufgabe");
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler beim Laden");
      setSchritt("start");
    }
  }

  async function loesungAbgeben() {
    if (!aktuelleAufgabe || (!loesung.trim() && !fotoBase64)) return;
    setFehler("");
    setSchritt("korrigieren");
    try {
      const res = await fetch("/api/qm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "korrektur",
          subfach: "statistik",
          aufgabe: aktuelleAufgabe.aufgabe_text,
          loesung,
          imageBase64: fotoBase64 ?? undefined,
          imageMimeType: fotoMimeType ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const k = data as Korrektur;
      setKorrektur(k);

      const loesungsBonus = Math.round((k.punkte / 100) * 30);
      const gesamt = 15 + loesungsBonus;
      setVerdienteXP(gesamt);
      addXP(gesamt);
      sitzungAbgeschlossen("statistik");
      setSchritt("korrektur");
    } catch (e) {
      setFehler(e instanceof Error ? e.message : "Fehler bei der Korrektur");
      setSchritt("aufgabe");
    }
  }

  function neueUebung() {
    setSchritt("start");
    setAktuelleAufgabe(null);
    setLoesung("");
    setFotoBase64(null);
    setFotoMimeType(null);
    setKorrektur(null);
    setFehler("");
    setVerdienteXP(0);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
          <BarChart2 className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">Quantitative Methoden</p>
          <h1 className="text-2xl font-bold text-slate-800">Statistik</h1>
        </div>
      </div>

      <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-violet-500 font-medium uppercase tracking-wide">
              {istProbeklausur ? "Abschluss" : `Kapitel ${statistikFortschritt.themaIndex + 1}`}
            </p>
            <p className="font-semibold text-violet-900">{aktuellesThema.titel}</p>
            <p className="text-xs text-violet-600 mt-0.5">{aktuellesThema.beschreibung}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-violet-700">{statistikFortschritt.sitzungenAktuell}</p>
            <p className="text-xs text-violet-500">/ {aktuellesThema.sitzungenZumAbschluss} Übungen</p>
          </div>
        </div>
        <div className="w-full bg-violet-200 rounded-full h-1.5">
          <div
            className="bg-violet-600 h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(fortschrittProzent, 100)}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {aktuellesThema.schluesselwoerter.slice(0, 4).map((k) => (
            <span key={k} className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">
              {k}
            </span>
          ))}
        </div>
      </div>

      {fehler && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{fehler}</div>
      )}

      {schritt === "start" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-4">
          <div className="text-5xl">{istProbeklausur ? "📋" : "📊"}</div>
          <h2 className="text-xl font-semibold text-slate-800">
            {istProbeklausur ? "Bereit für die Probeklausur?" : "Bereit für eine Statistik-Aufgabe?"}
          </h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {istProbeklausur
              ? "Klausur-ähnliche Aufgaben mit mehreren Teilaufgaben aus allen Themen — basierend auf echten Übungsklausuren."
              : <><strong>{aktuellesThema.titel}</strong> — KI generiert eine Rechenaufgabe, du löst sie, KI korrigiert.</>
            }
          </p>
          <button
            onClick={aufgabeStarten}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
          >
            {istProbeklausur ? "Aufgabe generieren" : "Aufgabe starten"} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {schritt === "laden" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
          <p className="text-slate-600">Aufgabe wird generiert...</p>
        </div>
      )}

      {schritt === "aufgabe" && aktuelleAufgabe && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-slate-800">Aufgabe</h2>
              <div className="flex gap-1.5 shrink-0">
                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                  {aktuelleAufgabe.thema}
                </span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {aktuelleAufgabe.schwierigkeit}
                </span>
              </div>
            </div>
            {aktuelleAufgabe.aufgabe_latex ? (
              <div className="text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: aufgabeHTML }} />
            ) : (
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{aktuelleAufgabe.aufgabe_text}</p>
            )}
            {aktuelleAufgabe.hinweise?.length > 0 && (
              <div>
                <button
                  onClick={() => setHinweiseSichtbar(!hinweiseSichtbar)}
                  className="text-xs text-violet-600 hover:underline"
                >
                  {hinweiseSichtbar ? "Hinweise ausblenden" : "Hinweise anzeigen"}
                </button>
                {hinweiseSichtbar && (
                  <ul className="mt-2 space-y-1">
                    {aktuelleAufgabe.hinweise.map((h, i) => (
                      <li key={i} className="text-xs text-slate-500 flex gap-1.5">
                        <span className="text-violet-400">→</span>{h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3">
            <h2 className="font-semibold text-slate-800">Deine Lösung</h2>
            <p className="text-xs text-slate-500">Zeige deinen Rechenweg — tippe ihn ein oder fotografiere dein Papier.</p>
            <LoesungsEingabe
              textWert={loesung}
              onTextChange={setLoesung}
              fotoBase64={fotoBase64}
              onFotoChange={(b64, mime) => { setFotoBase64(b64); setFotoMimeType(mime); }}
              textPlaceholder={"Gegeben: ...\nGesucht: ...\nRechnung:\n  Schritt 1: ...\nErgebnis: ..."}
              akzentFarbe="violet"
            />
            <button
              onClick={loesungAbgeben}
              disabled={!loesung.trim() && !fotoBase64}
              className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 disabled:opacity-40 transition-colors"
            >
              Lösung abgeben
            </button>
          </div>
        </div>
      )}

      {schritt === "korrigieren" && (
        <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
          <p className="text-slate-600">KI überprüft deine Lösung...</p>
        </div>
      )}

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
              <summary className="p-3 text-sm font-medium text-slate-700 cursor-pointer">Musterlösung anzeigen</summary>
              <div className="p-3 pt-0">
                {korrektur.musterloesung_latex ? (
                  <div className="text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: musterHTML }} />
                ) : (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{korrektur.musterloesung}</p>
                )}
              </div>
            </details>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white text-center space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-yellow-300" />
            <p className="font-bold text-xl">+{verdienteXP} XP verdient!</p>
            <p className="text-violet-100 text-sm">Aufgabe: {korrektur.punkte}/100 Punkte</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={neueUebung}
              className="flex items-center justify-center gap-2 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
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
