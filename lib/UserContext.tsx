"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { addXP as addXPUtil, LEVEL_XP } from "@/lib/gamification";
import { WPR_THEMEN, MATHE_THEMEN } from "@/lib/lernplan";

type ThemaFortschritt = {
  themaIndex: number;
  sitzungenAktuell: number;
};

type UserContextType = {
  xp: number;
  streak: number;
  level: number;
  wprFortschritt: ThemaFortschritt;
  matheFortschritt: ThemaFortschritt;
  addXP: (amount: number) => void;
  sitzungAbgeschlossen: (fach: "wpr" | "mathe") => void;
  themaAendern: (fach: "wpr" | "mathe", index: number) => void;
  setStreak: (s: number) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = "exam-slayer:user";
const USER_ID_KEY = "exam-slayer:user-id";

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
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function berechneStreak(letzterAktivTag: string | undefined, aktuellerStreak: number): number {
  if (!letzterAktivTag) return 0;
  const heute = heutigesDatum();
  const gestern = new Date();
  gestern.setDate(gestern.getDate() - 1);
  const gesternsStr = gestern.toISOString().slice(0, 10);

  if (letzterAktivTag === heute) return aktuellerStreak;
  if (letzterAktivTag === gesternsStr) return aktuellerStreak; // Streak läuft noch
  return 0; // Streak unterbrochen
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState<number>(0);
  const [streak, setStreakState] = useState<number>(0);
  const [userId, setUserId] = useState<string>("");
  const [wprFortschritt, setWprFortschritt] = useState<ThemaFortschritt>({ themaIndex: 0, sitzungenAktuell: 0 });
  const [matheFortschritt, setMatheFortschritt] = useState<ThemaFortschritt>({ themaIndex: 0, sitzungenAktuell: 0 });

  // Initialisierung aus localStorage
  useEffect(() => {
    try {
      const id = resolveUserId();
      setUserId(id);

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setXp(parsed.xp ?? 0);

        // Streak mit Datumslogik prüfen
        const berechneterStreak = berechneStreak(parsed.letzterAktivTag, parsed.streak ?? 0);
        setStreakState(berechneterStreak);

        setWprFortschritt(parsed.wprFortschritt ?? { themaIndex: 0, sitzungenAktuell: 0 });
        setMatheFortschritt(parsed.matheFortschritt ?? { themaIndex: 0, sitzungenAktuell: 0 });
      }

      // Supabase-Sync (optional)
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
    } catch {
      // localStorage nicht verfügbar
    }
  }, []);

  // Persistenz bei Änderungen
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
          matheFortschritt,
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
  }, [xp, streak, wprFortschritt, matheFortschritt, userId]);

  function addXP(amount: number) {
    const { xp: newXp } = addXPUtil(xp, amount);
    setXp(newXp);
  }

  function sitzungAbgeschlossen(fach: "wpr" | "mathe") {
    // Streak aktualisieren
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

    // Thema-Fortschritt vorankommen
    if (fach === "wpr") {
      setWprFortschritt((prev) => {
        const thema = WPR_THEMEN[prev.themaIndex];
        const neueSitzungen = prev.sitzungenAktuell + 1;
        if (neueSitzungen >= thema.sitzungenZumAbschluss && prev.themaIndex < WPR_THEMEN.length - 1) {
          return { themaIndex: prev.themaIndex + 1, sitzungenAktuell: 0 };
        }
        return { ...prev, sitzungenAktuell: neueSitzungen };
      });
    } else {
      setMatheFortschritt((prev) => {
        const thema = MATHE_THEMEN[prev.themaIndex];
        const neueSitzungen = prev.sitzungenAktuell + 1;
        if (neueSitzungen >= thema.sitzungenZumAbschluss && prev.themaIndex < MATHE_THEMEN.length - 1) {
          return { themaIndex: prev.themaIndex + 1, sitzungenAktuell: 0 };
        }
        return { ...prev, sitzungenAktuell: neueSitzungen };
      });
    }
  }

  function themaAendern(fach: "wpr" | "mathe", index: number) {
    if (fach === "wpr") {
      setWprFortschritt({ themaIndex: Math.min(index, WPR_THEMEN.length - 1), sitzungenAktuell: 0 });
    } else {
      setMatheFortschritt({ themaIndex: Math.min(index, MATHE_THEMEN.length - 1), sitzungenAktuell: 0 });
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
        matheFortschritt,
        addXP,
        sitzungAbgeschlossen,
        themaAendern,
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
