"use client";

import Link from "next/link";
import { CheckCircle, Circle, Lock, ChevronRight, Scale, Calculator, BarChart2 } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { WPR_THEMEN, WIMA_THEMEN, STATISTIK_THEMEN, Thema } from "@/lib/lernplan";

type ThemaStatus = "abgeschlossen" | "aktuell" | "gesperrt";

function themaStatus(index: number, aktuellerIndex: number): ThemaStatus {
  if (index < aktuellerIndex) return "abgeschlossen";
  if (index === aktuellerIndex) return "aktuell";
  return "gesperrt";
}

function ThemaKarte({
  thema,
  index,
  status,
  sitzungenAktuell,
}: {
  thema: Thema;
  index: number;
  status: ThemaStatus;
  sitzungenAktuell: number;
}) {
  const isProbeklausur = thema.id.includes("probeklausur");
  const fortschrittProzent =
    status === "abgeschlossen"
      ? 100
      : status === "aktuell"
      ? Math.round((sitzungenAktuell / thema.sitzungenZumAbschluss) * 100)
      : 0;

  if (isProbeklausur) {
    return (
      <div
        className={`rounded-xl border-2 p-4 space-y-2 transition-all ${
          status === "abgeschlossen"
            ? "bg-yellow-50 border-yellow-300"
            : status === "aktuell"
            ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-sm"
            : "bg-slate-50 border-dashed border-slate-300 opacity-60"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0 text-lg">
            {status === "abgeschlossen" ? "✅" : status === "aktuell" ? "📋" : "🔒"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-mono">{String(index + 1).padStart(2, "0")}</span>
              <h3 className={`font-bold text-sm ${status === "gesperrt" ? "text-slate-400" : "text-amber-800"}`}>
                {thema.titel}
              </h3>
              {status === "aktuell" && (
                <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">Finale Prüfung</span>
              )}
              {status === "gesperrt" && (
                <span className="text-xs text-slate-400 px-1.5 py-0.5">— alle Kapitel abschließen</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{thema.beschreibung}</p>
            {status !== "gesperrt" && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>
                    {status === "abgeschlossen"
                      ? "Abgeschlossen"
                      : `${sitzungenAktuell} / ${thema.sitzungenZumAbschluss} Übungen`}
                  </span>
                  <span>{fortschrittProzent}%</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all bg-amber-500"
                    style={{ width: `${fortschrittProzent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 space-y-2 transition-all ${
        status === "abgeschlossen"
          ? "bg-emerald-50 border-emerald-200"
          : status === "aktuell"
          ? "bg-white border-indigo-300 shadow-sm ring-1 ring-indigo-100"
          : "bg-slate-50 border-slate-200 opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {status === "abgeschlossen" ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : status === "aktuell" ? (
            <Circle className="w-5 h-5 text-indigo-500 fill-indigo-100" />
          ) : (
            <Lock className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">{String(index + 1).padStart(2, "0")}</span>
            <h3 className={`font-semibold text-sm ${status === "gesperrt" ? "text-slate-400" : "text-slate-800"}`}>
              {thema.titel}
            </h3>
            {status === "aktuell" && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">aktuell</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{thema.beschreibung}</p>
          {status !== "gesperrt" && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>
                  {status === "abgeschlossen"
                    ? "Abgeschlossen"
                    : `${sitzungenAktuell} / ${thema.sitzungenZumAbschluss} Übungen`}
                </span>
                <span>{fortschrittProzent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    status === "abgeschlossen" ? "bg-emerald-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${fortschrittProzent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FachAbschnitt({
  titel,
  untertitel,
  farbe,
  icon,
  themen,
  aktuellerIndex,
  sitzungenAktuell,
  uebungsLink,
}: {
  titel: string;
  untertitel?: string;
  farbe: "indigo" | "emerald" | "violet";
  icon: React.ReactNode;
  themen: Thema[];
  aktuellerIndex: number;
  sitzungenAktuell: number;
  uebungsLink: string;
}) {
  const abgeschlossen = aktuellerIndex;
  const gesamt = themen.length;
  const fortschrittGesamt = Math.round((abgeschlossen / gesamt) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-${farbe}-100 flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{titel}</h2>
            <p className="text-xs text-slate-500">
              {untertitel ? `${untertitel} · ` : ""}{abgeschlossen} / {gesamt} Kapitel abgeschlossen
            </p>
          </div>
        </div>
        <Link
          href={uebungsLink}
          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-${farbe}-600 text-white hover:bg-${farbe}-700 transition-colors`}
        >
          Weiterüben
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className={`bg-${farbe}-500 h-2 rounded-full transition-all`}
          style={{ width: `${fortschrittGesamt}%` }}
        />
      </div>

      <div className="space-y-2">
        {themen.map((thema, i) => (
          <ThemaKarte
            key={thema.id}
            thema={thema}
            index={i}
            status={themaStatus(i, aktuellerIndex)}
            sitzungenAktuell={i === aktuellerIndex ? sitzungenAktuell : 0}
          />
        ))}
      </div>
    </div>
  );
}

export default function LernplanSeite() {
  const { wprFortschritt, wimaFortschritt, statistikFortschritt } = useUser();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lernplan</h1>
        <p className="text-slate-500 text-sm mt-1">
          Lerne Schritt für Schritt in der Reihenfolge deiner Vorlesungsunterlagen.
          Jedes Kapitel schaltet sich frei, wenn du genug Übungen gemacht hast.
        </p>
      </div>

      <FachAbschnitt
        titel="WPR"
        untertitel="Wirtschaftsprivatrecht"
        farbe="indigo"
        icon={<Scale className="w-4 h-4 text-indigo-600" />}
        themen={WPR_THEMEN}
        aktuellerIndex={wprFortschritt.themaIndex}
        sitzungenAktuell={wprFortschritt.sitzungenAktuell}
        uebungsLink="/law"
      />

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-slate-500" />
          <h2 className="font-bold text-slate-700">Quantitative Methoden</h2>
        </div>
        <FachAbschnitt
          titel="Wirtschaftsmathematik"
          farbe="emerald"
          icon={<Calculator className="w-4 h-4 text-emerald-600" />}
          themen={WIMA_THEMEN}
          aktuellerIndex={wimaFortschritt.themaIndex}
          sitzungenAktuell={wimaFortschritt.sitzungenAktuell}
          uebungsLink="/qm/wima"
        />
        <FachAbschnitt
          titel="Statistik"
          farbe="violet"
          icon={<BarChart2 className="w-4 h-4 text-violet-600" />}
          themen={STATISTIK_THEMEN}
          aktuellerIndex={statistikFortschritt.themaIndex}
          sitzungenAktuell={statistikFortschritt.sitzungenAktuell}
          uebungsLink="/qm/statistik"
        />
      </div>
    </div>
  );
}
