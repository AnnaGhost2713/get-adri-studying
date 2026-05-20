"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";

export type MCFrage = {
  frage: string;
  optionen: string[];
  richtig: number;
  erklaerung: string;
};

type Props = {
  fragen: MCFrage[];
  onAbgeschlossen: (score: number) => void;
};

export default function MultipleChoiceQuiz({ fragen, onAbgeschlossen }: Props) {
  const [aktuelleIndex, setAktuelleIndex] = useState(0);
  const [ausgewaehlt, setAusgewaehlt] = useState<number | null>(null);
  const [richtigeAntworten, setRichtigeAntworten] = useState(0);
  const [beantwortet, setBeantwortet] = useState(false);

  const aktuell = fragen[aktuelleIndex];
  const istLetzte = aktuelleIndex === fragen.length - 1;

  function antworten(index: number) {
    if (beantwortet) return;
    setAusgewaehlt(index);
    setBeantwortet(true);
    if (index === aktuell.richtig) {
      setRichtigeAntworten((v) => v + 1);
    }
  }

  function weiter() {
    if (istLetzte) {
      const finalScore = ausgewaehlt === aktuell.richtig ? richtigeAntworten : richtigeAntworten;
      onAbgeschlossen(finalScore);
    } else {
      setAktuelleIndex((i) => i + 1);
      setAusgewaehlt(null);
      setBeantwortet(false);
    }
  }

  function optionKlasse(index: number): string {
    if (!beantwortet) {
      return "border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer";
    }
    if (index === aktuell.richtig) return "border-emerald-400 bg-emerald-50";
    if (index === ausgewaehlt && ausgewaehlt !== aktuell.richtig)
      return "border-red-400 bg-red-50";
    return "border-slate-200 bg-slate-50 opacity-60";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Frage {aktuelleIndex + 1} von {fragen.length}</span>
        <span>{richtigeAntworten} richtig</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((aktuelleIndex) / fragen.length) * 100}%` }}
        />
      </div>

      <p className="font-medium text-slate-800 text-lg leading-snug">{aktuell.frage}</p>

      <div className="space-y-2">
        {aktuell.optionen.map((opt, i) => (
          <button
            key={i}
            onClick={() => antworten(i)}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${optionKlasse(i)}`}
          >
            <span className="font-semibold mr-2 text-slate-500">
              {["A", "B", "C", "D"][i]}.
            </span>
            {opt}
            {beantwortet && i === aktuell.richtig && (
              <CheckCircle className="inline ml-2 text-emerald-500 w-4 h-4" />
            )}
            {beantwortet && i === ausgewaehlt && i !== aktuell.richtig && (
              <XCircle className="inline ml-2 text-red-500 w-4 h-4" />
            )}
          </button>
        ))}
      </div>

      {beantwortet && (
        <div className={`rounded-lg p-3 text-sm ${ausgewaehlt === aktuell.richtig ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
          <strong>{ausgewaehlt === aktuell.richtig ? "Richtig!" : "Leider falsch."}</strong>{" "}
          {aktuell.erklaerung}
        </div>
      )}

      {beantwortet && (
        <button
          onClick={weiter}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          {istLetzte ? "Ergebnis anzeigen" : "Nächste Frage"}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
