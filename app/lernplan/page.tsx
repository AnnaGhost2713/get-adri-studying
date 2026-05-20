"use client";

import Link from "next/link";
import { CheckCircle, Circle, Lock, ChevronRight, Scale, Calculator } from "lucide-react";
import { useUser } from "@/lib/UserContext";
import { WPR_THEMEN, MATHE_THEMEN, Thema } from "@/lib/lernplan";

type ThemaStatus = "abgeschlossen" | "aktuell" | "gesperrt";

function themaStatus(index: number, aktuellerIndex: number, sitzungenAktuell: number, thema: Thema): ThemaStatus {
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
  const fortschrittProzent =
    status === "abgeschlossen"
      ? 100
      : status === "aktuell"
      ? Math.round((sitzungenAktuell / thema.sitzungenZumAbschluss) * 100)
      : 0;

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
  farbe,
  icon,
  themen,
  aktuellerIndex,
  sitzungenAktuell,
  uebungsLink,
}: {
  titel: string;
  farbe: "indigo" | "emerald";
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
            <p className="text-xs text-slate-500">{abgeschlossen} / {gesamt} Kapitel abgeschlossen</p>
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
            status={themaStatus(i, aktuellerIndex, sitzungenAktuell, thema)}
            sitzungenAktuell={i === aktuellerIndex ? sitzungenAktuell : 0}
          />
        ))}
      </div>
    </div>
  );
}

export default function LernplanSeite() {
  const { wprFortschritt, matheFortschritt } = useUser();

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
        titel="Wirtschaftsprivatrecht"
        farbe="indigo"
        icon={<Scale className="w-4 h-4 text-indigo-600" />}
        themen={WPR_THEMEN}
        aktuellerIndex={wprFortschritt.themaIndex}
        sitzungenAktuell={wprFortschritt.sitzungenAktuell}
        uebungsLink="/law"
      />

      <FachAbschnitt
        titel="Mathematik"
        farbe="emerald"
        icon={<Calculator className="w-4 h-4 text-emerald-600" />}
        themen={MATHE_THEMEN}
        aktuellerIndex={matheFortschritt.themaIndex}
        sitzungenAktuell={matheFortschritt.sitzungenAktuell}
        uebungsLink="/math"
      />
    </div>
  );
}
