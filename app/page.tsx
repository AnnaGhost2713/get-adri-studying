"use client";

import Link from "next/link";
import { Scale, Calculator, Flame, Star, ChevronRight, Trophy, BookOpen } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { getAktuellesThema } from "@/lib/lernplan";

const MOTIVATIONS = [
  "Jeder gelöste Fall bringt dich der Prüfung näher. Los geht's!",
  "Kleine Schritte jeden Tag – das ist der Weg zum Erfolg.",
  "Dein zukünftiges Ich wird dir danken. Fang jetzt an!",
  "Schwierigkeit ist ein Zeichen dafür, dass du wächst.",
  "Die Prüfung kommt. Die Vorbereitung liegt in deinen Händen.",
  "Gut ist der Feind von fertig. Fang einfach an!",
  "Heute Lernen, morgen Bestehen.",
];

function taglicheMotivation() {
  return MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];
}

function HeutigeAufgabeKarte({
  href,
  farbe,
  icon,
  fach,
  themaIndex,
  themaName,
  sitzungenAktuell,
  sitzungenZiel,
  buttonKlasse,
}: {
  href: string;
  farbe: "indigo" | "emerald";
  icon: React.ReactNode;
  fach: string;
  themaIndex: number;
  themaName: string;
  sitzungenAktuell: number;
  sitzungenZiel: number;
  buttonKlasse: string;
}) {
  const prozent = Math.min(100, Math.round((sitzungenAktuell / sitzungenZiel) * 100));
  const fertig = sitzungenAktuell >= sitzungenZiel;

  return (
    <div className={`rounded-xl bg-white border ${fertig ? "border-emerald-200" : `border-${farbe}-100`} p-4 space-y-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg bg-${farbe}-100 flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <p className="text-xs text-slate-500">{fach} · Kapitel {themaIndex + 1}</p>
            <p className="font-semibold text-sm text-slate-800">{themaName}</p>
          </div>
        </div>
        {fertig && (
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
            Kapitel fast fertig!
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{sitzungenAktuell} / {sitzungenZiel} Übungen</span>
          <span>{prozent}%</span>
        </div>
        <div className={`w-full bg-${farbe}-100 rounded-full h-1.5`}>
          <div
            className={`bg-${farbe}-500 h-1.5 rounded-full transition-all`}
            style={{ width: `${prozent}%` }}
          />
        </div>
      </div>
      <Link
        href={href}
        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold transition-colors ${buttonKlasse}`}
      >
        {fertig ? "Nächstes Kapitel starten" : "Jetzt üben"}
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { xp, streak, level, wprFortschritt, matheFortschritt } = useUser();
  const xpBisNaechstesLevel = 500 - (xp % 500);
  const fortschrittProzent = Math.min(100, Math.floor(((xp % 500) / 500) * 100));

  const wprThema = getAktuellesThema("wpr", wprFortschritt.themaIndex);
  const matheThema = getAktuellesThema("mathe", matheFortschritt.themaIndex);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Begrüßungs-Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hallo, Adri! 👋</h1>
            <p className="text-indigo-200 text-sm mt-1">{taglicheMotivation()}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{level}</div>
            <div className="text-indigo-300 text-xs">Level</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-indigo-200">
            <span>{xp} XP gesamt</span>
            <span>noch {xpBisNaechstesLevel} XP bis Level {level + 1}</span>
          </div>
          <div className="w-full bg-indigo-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${fortschrittProzent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white border border-slate-200 p-4 text-center">
          <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-800">{streak}</div>
          <div className="text-xs text-slate-500">Tage in Folge</div>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 text-center">
          <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-800">{xp}</div>
          <div className="text-xs text-slate-500">XP gesamt</div>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 p-4 text-center">
          <Trophy className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <div className="text-xl font-bold text-slate-800">{level}</div>
          <div className="text-xs text-slate-500">Level</div>
        </div>
      </div>

      {/* Heute üben */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-600" />
            Heute üben
          </h2>
          <Link href="/lernplan" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
            Lernplan ansehen <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <HeutigeAufgabeKarte
            href="/law"
            farbe="indigo"
            icon={<Scale className="w-3.5 h-3.5 text-indigo-600" />}
            fach="WPR"
            themaIndex={wprFortschritt.themaIndex}
            themaName={wprThema.titel}
            sitzungenAktuell={wprFortschritt.sitzungenAktuell}
            sitzungenZiel={wprThema.sitzungenZumAbschluss}
            buttonKlasse="bg-indigo-600 hover:bg-indigo-700"
          />
          <HeutigeAufgabeKarte
            href="/math"
            farbe="emerald"
            icon={<Calculator className="w-3.5 h-3.5 text-emerald-600" />}
            fach="Mathe"
            themaIndex={matheFortschritt.themaIndex}
            themaName={matheThema.titel}
            sitzungenAktuell={matheFortschritt.sitzungenAktuell}
            sitzungenZiel={matheThema.sitzungenZumAbschluss}
            buttonKlasse="bg-emerald-600 hover:bg-emerald-700"
          />
        </div>
      </div>

      {/* Info-Tipp */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <strong>Tipp:</strong> Lade deine WPR- und Mathe-Skripte als PDF in{" "}
        <code className="bg-amber-100 px-1 rounded">/public/scripts</code> hoch – die KI nutzt sie dann als Grundlage für Fragen und Fälle.
      </div>
    </div>
  );
}
