"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { addXP as addXPUtil, LEVEL_XP } from "@/lib/gamification";
import { WPR_THEMEN, WIMA_THEMEN, STATISTIK_THEMEN } from "@/lib/lernplan";
import { useAuth } from "@/lib/AuthContext";

type ThemaFortschritt = {
  themaIndex: number;
  sitzungenAktuell: number;
};

export type Lernfach = "wpr" | "wima" | "statistik";

export type Lernversuch = {
  id: string;
  fach: Lernfach;
  themaId: string;
  themaTitel: string;
  punkte: number;
  fehler: string[];
  feedback: string;
  aufgabe: string;
  istWiederholung: boolean;
  erstelltAm: string;
};

export type FehlerbuchEintrag = {
  id: string;
  fach: Lernfach;
  themaId: string;
  themaTitel: string;
  letztePunktzahl: number;
  mastery: number;
  fehler: string[];
  feedback: string;
  versuche: number;
  erfolgreicheWiederholungen: number;
  zuletztGeuebtAm: string;
  naechsteWiederholungAm: string;
  gemeistert: boolean;
};

export type LernversuchEingabe = Omit<Lernversuch, "id" | "erstelltAm">;

type UserContextType = {
  xp: number;
  streak: number;
  level: number;
  wprFortschritt: ThemaFortschritt;
  wimaFortschritt: ThemaFortschritt;
  statistikFortschritt: ThemaFortschritt;
  lernversuche: Lernversuch[];
  fehlerbuch: FehlerbuchEintrag[];
  addXP: (amount: number) => void;
  sitzungAbgeschlossen: (fach: Lernfach, zaehltZumKapitel?: boolean) => void;
  themaAendern: (fach: Lernfach, index: number) => void;
  lernversuchSpeichern: (versuch: LernversuchEingabe) => void;
  setStreak: (s: number) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "exam-slayer:user";
const USER_ID_KEY = "exam-slayer:user-id";
const REVIEW_INTERVALLE = [0, 1, 3, 7, 14, 30];

function resolveUserId(): string {
  try {
    const existing = localStorage.getItem(USER_ID_KEY);
    if (existing) return existing;
    const generated = `local-${crypto.randomUUID()}`;
    localStorage.setItem(USER_ID_KEY, generated);
    return generated;
  } catch {
    return "local-fallback";
  }
}

function heutigesDatum(): string {
  return new Date().toISOString().slice(0, 10);
}

function berechneStreak(letzterAktivTag: string | undefined, aktuellerStreak: number): number {
  if (!letzterAktivTag) return 0;
  const heute = heutigesDatum();
  const gestern = new Date();
  gestern.setDate(gestern.getDate() - 1);
  const gesternsStr = gestern.toISOString().slice(0, 10);

  if (letzterAktivTag === heute) return aktuellerStreak;
  if (letzterAktivTag === gesternsStr) return aktuellerStreak;
  return 0;
}

function datumInTagen(tage: number): string {
  const datum = new Date();
  datum.setDate(datum.getDate() + tage);
  return datum.toISOString();
}

function aktualisiereFehlerbuch(
  eintraege: FehlerbuchEintrag[],
  versuch: Lernversuch
): FehlerbuchEintrag[] {
  const index = eintraege.findIndex(
    (eintrag) => eintrag.fach === versuch.fach && eintrag.themaId === versuch.themaId
  );
  const vorhanden = index >= 0 ? eintraege[index] : null;
  const sollGespeichertWerden = Boolean(vorhanden) || versuch.punkte < 85 || versuch.fehler.length > 0;

  if (!sollGespeichertWerden) return eintraege;

  const bestanden = versuch.punkte >= 75;
  const wiederholungen = bestanden ? (vorhanden?.erfolgreicheWiederholungen ?? 0) + 1 : 0;
  const mastery = vorhanden
    ? Math.round(vorhanden.mastery * 0.4 + versuch.punkte * 0.6)
    : versuch.punkte;
  const intervall = bestanden
    ? REVIEW_INTERVALLE[Math.min(wiederholungen, REVIEW_INTERVALLE.length - 1)]
    : 0;
  const fehler = versuch.fehler.length > 0 ? versuch.fehler : vorhanden?.fehler ?? [];
  const eintrag: FehlerbuchEintrag = {
    id: vorhanden?.id ?? `${versuch.fach}:${versuch.themaId}`,
    fach: versuch.fach,
    themaId: versuch.themaId,
    themaTitel: versuch.themaTitel,
    letztePunktzahl: versuch.punkte,
    mastery,
    fehler,
    feedback: versuch.feedback || vorhanden?.feedback || "",
    versuche: (vorhanden?.versuche ?? 0) + 1,
    erfolgreicheWiederholungen: wiederholungen,
    zuletztGeuebtAm: versuch.erstelltAm,
    naechsteWiederholungAm: datumInTagen(intervall),
    gemeistert: wiederholungen >= 3 && mastery >= 80,
  };

  if (index < 0) return [eintrag, ...eintraege];
  return eintraege.map((alt, i) => (i === index ? eintrag : alt));
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [xp, setXp] = useState<number>(0);
  const [streak, setStreakState] = useState<number>(0);
  const [userId, setUserId] = useState<string>("");
  const [wprFortschritt, setWprFortschritt] = useState<ThemaFortschritt>({ themaIndex: 0, sitzungenAktuell: 0 });
  const [wimaFortschritt, setWimaFortschritt] = useState<ThemaFortschritt>({ themaIndex: 0, sitzungenAktuell: 0 });
  const [statistikFortschritt, setStatistikFortschritt] = useState<ThemaFortschritt>({ themaIndex: 0, sitzungenAktuell: 0 });
  const [lernversuche, setLernversuche] = useState<Lernversuch[]>([]);
  const [fehlerbuch, setFehlerbuch] = useState<FehlerbuchEintrag[]>([]);

  useEffect(() => {
    try {
      const id = user?.id ?? resolveUserId();
      setUserId(id);

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setXp(parsed.xp ?? 0);
        const berechneterStreak = berechneStreak(parsed.letzterAktivTag, parsed.streak ?? 0);
        setStreakState(berechneterStreak);
        setWprFortschritt(parsed.wprFortschritt ?? { themaIndex: 0, sitzungenAktuell: 0 });
        // migrate old "matheFortschritt" key → wimaFortschritt
        setWimaFortschritt(parsed.wimaFortschritt ?? parsed.matheFortschritt ?? { themaIndex: 0, sitzungenAktuell: 0 });
        setStatistikFortschritt(parsed.statistikFortschritt ?? { themaIndex: 0, sitzungenAktuell: 0 });
        setLernversuche(parsed.lernversuche ?? []);
        setFehlerbuch(parsed.fehlerbuch ?? []);
      }

      fetch(`/api/progress?userId=${encodeURIComponent(id)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.progress) {
            setXp(typeof data.progress.xp === "number" ? data.progress.xp : 0);
            const s = berechneStreak(data.progress.letzter_aktiv_tag, data.progress.streak ?? 0);
            setStreakState(typeof data.progress.streak === "number" ? s : 0);
          }
        })
        .catch(() => {});

      if (session?.access_token) {
        fetch("/api/review", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.lernversuche?.length) setLernversuche(data.lernversuche);
            if (data?.fehlerbuch?.length) setFehlerbuch(data.fehlerbuch);
          })
          .catch(() => {});
      }
    } catch {
      // localStorage nicht verfügbar
    }
  }, [session?.access_token, user?.id]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      const heute = heutigesDatum();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...prev,
          xp,
          streak,
          letzterAktivTag: prev.letzterAktivTag ?? heute,
          wprFortschritt,
          wimaFortschritt,
          statistikFortschritt,
          lernversuche,
          fehlerbuch,
        })
      );

      if (userId) {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, xp, streak }),
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, [xp, streak, wprFortschritt, wimaFortschritt, statistikFortschritt, lernversuche, fehlerbuch, userId]);

  function addXP(amount: number) {
    const { xp: newXp } = addXPUtil(xp, amount);
    setXp(newXp);
  }

  function sitzungAbgeschlossen(fach: Lernfach, zaehltZumKapitel = true) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      const heute = heutigesDatum();

      if (prev.letzterAktivTag !== heute) {
        const neuerStreak = berechneStreak(prev.letzterAktivTag, streak) + 1;
        setStreakState(neuerStreak);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...prev, letzterAktivTag: heute, streak: neuerStreak })
        );
      }
    } catch {
      // ignore
    }

    if (!zaehltZumKapitel) return;

    if (fach === "wpr") {
      setWprFortschritt((prev) => {
        const thema = WPR_THEMEN[prev.themaIndex];
        const neueSitzungen = prev.sitzungenAktuell + 1;
        if (neueSitzungen >= thema.sitzungenZumAbschluss && prev.themaIndex < WPR_THEMEN.length - 1) {
          return { themaIndex: prev.themaIndex + 1, sitzungenAktuell: 0 };
        }
        return { ...prev, sitzungenAktuell: neueSitzungen };
      });
    } else if (fach === "wima") {
      setWimaFortschritt((prev) => {
        const thema = WIMA_THEMEN[prev.themaIndex];
        const neueSitzungen = prev.sitzungenAktuell + 1;
        if (neueSitzungen >= thema.sitzungenZumAbschluss && prev.themaIndex < WIMA_THEMEN.length - 1) {
          return { themaIndex: prev.themaIndex + 1, sitzungenAktuell: 0 };
        }
        return { ...prev, sitzungenAktuell: neueSitzungen };
      });
    } else {
      setStatistikFortschritt((prev) => {
        const thema = STATISTIK_THEMEN[prev.themaIndex];
        const neueSitzungen = prev.sitzungenAktuell + 1;
        if (neueSitzungen >= thema.sitzungenZumAbschluss && prev.themaIndex < STATISTIK_THEMEN.length - 1) {
          return { themaIndex: prev.themaIndex + 1, sitzungenAktuell: 0 };
        }
        return { ...prev, sitzungenAktuell: neueSitzungen };
      });
    }
  }

  function themaAendern(fach: Lernfach, index: number) {
    if (fach === "wpr") {
      setWprFortschritt({ themaIndex: Math.min(index, WPR_THEMEN.length - 1), sitzungenAktuell: 0 });
    } else if (fach === "wima") {
      setWimaFortschritt({ themaIndex: Math.min(index, WIMA_THEMEN.length - 1), sitzungenAktuell: 0 });
    } else {
      setStatistikFortschritt({ themaIndex: Math.min(index, STATISTIK_THEMEN.length - 1), sitzungenAktuell: 0 });
    }
  }

  function lernversuchSpeichern(eingabe: LernversuchEingabe) {
    const versuch: Lernversuch = {
      ...eingabe,
      id: crypto.randomUUID(),
      erstelltAm: new Date().toISOString(),
    };

    setLernversuche((aktuell) => [versuch, ...aktuell].slice(0, 100));
    setFehlerbuch((aktuell) => aktualisiereFehlerbuch(aktuell, versuch));

    if (session?.access_token) {
      fetch("/api/review", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(versuch),
      }).catch(() => {});
    }
  }

  const level = Math.floor(xp / LEVEL_XP);

  return (
    <UserContext.Provider
      value={{
        xp,
        streak,
        level,
        wprFortschritt,
        wimaFortschritt,
        statistikFortschritt,
        lernversuche,
        fehlerbuch,
        addXP,
        sitzungAbgeschlossen,
        themaAendern,
        lernversuchSpeichern,
        setStreak: setStreakState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}

export default UserContext;
