"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  Clock3,
  History,
} from "lucide-react";
import { FehlerbuchEintrag, Lernfach, useUser } from "@/lib/UserContext";

const FACH_LABEL: Record<Lernfach, string> = {
  wpr: "WPR",
  wima: "Wirtschaftsmathematik",
  statistik: "Statistik",
};

const FACH_LINK: Record<Lernfach, string> = {
  wpr: "/law",
  wima: "/qm/wima",
  statistik: "/qm/statistik",
};

function istFaellig(eintrag: FehlerbuchEintrag): boolean {
  return new Date(eintrag.naechsteWiederholungAm).getTime() <= Date.now();
}

function datumLabel(iso: string): string {
  const datum = new Date(iso);
  const heute = new Date();
  const morgen = new Date();
  morgen.setDate(morgen.getDate() + 1);

  if (datum.toDateString() === heute.toDateString()) return "heute";
  if (datum.toDateString() === morgen.toDateString()) return "morgen";
  return datum.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
}

function WiederholungsKarte({ eintrag }: { eintrag: FehlerbuchEintrag }) {
  const faellig = istFaellig(eintrag);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-indigo-600">{FACH_LABEL[eintrag.fach]}</span>
            {faellig && !eintrag.gemeistert && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                jetzt wiederholen
              </span>
            )}
            {eintrag.gemeistert && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                gemeistert
              </span>
            )}
          </div>
          <h2 className="mt-1 font-semibold text-slate-800">{eintrag.themaTitel}</h2>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-800">{eintrag.mastery}%</div>
          <div className="text-xs text-slate-400">Mastery</div>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            eintrag.mastery >= 80
              ? "bg-emerald-500"
              : eintrag.mastery >= 60
              ? "bg-amber-500"
              : "bg-red-500"
          }`}
          style={{ width: `${eintrag.mastery}%` }}
        />
      </div>

      {eintrag.fehler.length > 0 && (
        <div className="space-y-1.5">
          {eintrag.fehler.slice(0, 3).map((fehler, index) => (
            <div key={`${fehler}-${index}`} className="flex items-start gap-2 text-sm text-slate-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <span>{fehler}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          {eintrag.gemeistert
            ? `${eintrag.erfolgreicheWiederholungen} erfolgreiche Wiederholungen`
            : `Nächste Wiederholung ${datumLabel(eintrag.naechsteWiederholungAm)}`}
        </div>
        <Link
          href={`${FACH_LINK[eintrag.fach]}?review=${encodeURIComponent(eintrag.themaId)}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Wiederholen
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function FehlerbuchSeite() {
  const { fehlerbuch, lernversuche } = useUser();
  const sortiert = [...fehlerbuch].sort((a, b) => {
    if (a.gemeistert !== b.gemeistert) return a.gemeistert ? 1 : -1;
    if (istFaellig(a) !== istFaellig(b)) return istFaellig(a) ? -1 : 1;
    return a.mastery - b.mastery;
  });
  const offen = sortiert.filter((eintrag) => !eintrag.gemeistert);
  const faellig = offen.filter(istFaellig);
  const empfohlen = faellig[0] ?? offen[0];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-slate-800">Persönliches Fehlerbuch</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Schwache Themen werden automatisch erkannt und im passenden Abstand wiederholt.
        </p>
      </div>

      {empfohlen && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-200">
                Empfohlene Wiederholung
              </p>
              <h2 className="mt-1 text-lg font-bold">{empfohlen.themaTitel}</h2>
              <p className="mt-1 text-sm text-indigo-100">
                {FACH_LABEL[empfohlen.fach]} · {empfohlen.mastery}% Mastery · zuletzt {empfohlen.letztePunktzahl}/100
              </p>
            </div>
            <BookOpenCheck className="h-8 w-8 shrink-0 text-indigo-200" />
          </div>
          <Link
            href={`${FACH_LINK[empfohlen.fach]}?review=${encodeURIComponent(empfohlen.themaId)}`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Adaptive Übung starten
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-xl font-bold text-amber-600">{faellig.length}</div>
          <div className="text-xs text-slate-500">heute fällig</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-xl font-bold text-indigo-600">{offen.length}</div>
          <div className="text-xs text-slate-500">offene Themen</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <div className="text-xl font-bold text-emerald-600">
            {fehlerbuch.filter((eintrag) => eintrag.gemeistert).length}
          </div>
          <div className="text-xs text-slate-500">gemeistert</div>
        </div>
      </div>

      {sortiert.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <h2 className="mt-3 font-semibold text-slate-800">Noch keine Fehler gespeichert</h2>
          <p className="mt-1 text-sm text-slate-500">
            Nach deiner nächsten korrigierten Aufgabe erscheinen schwache Themen automatisch hier.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-800">Deine Themen</h2>
          {sortiert.map((eintrag) => (
            <WiederholungsKarte key={eintrag.id} eintrag={eintrag} />
          ))}
        </div>
      )}

      {lernversuche.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-800">Letzte Versuche</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {lernversuche.slice(0, 5).map((versuch, index) => (
              <div
                key={versuch.id}
                className={`flex items-center justify-between gap-3 p-3 ${
                  index > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{versuch.themaTitel}</p>
                  <p className="text-xs text-slate-400">
                    {FACH_LABEL[versuch.fach]}
                    {versuch.istWiederholung ? " · Wiederholung" : ""}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    versuch.punkte >= 75
                      ? "text-emerald-600"
                      : versuch.punkte >= 50
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
                >
                  {versuch.punkte}/100
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
