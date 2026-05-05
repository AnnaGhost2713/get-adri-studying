"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { addXP as addXPUtil, MATH_XP, LAW_XP, LEVEL_XP } from "@/lib/gamification";

type UserContextType = {
  xp: number;
  streak: number;
  level: number;
  addXP: (amount: number) => void;
  addMathXP: () => void;
  addLawXP: () => void;
  setStreak: (s: number) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXp] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [userId, setUserId] = useState<string>("");

  function resolveLocalUserId() {
    const existing = localStorage.getItem("exam-slayer:user-id");
    if (existing) return existing;
    const generated = `local-${crypto.randomUUID()}`;
    localStorage.setItem("exam-slayer:user-id", generated);
    return generated;
  }

  useEffect(() => {
    try {
      const id = resolveLocalUserId();
      setUserId(id);

      const raw = localStorage.getItem("exam-slayer:user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setXp(parsed.xp || 0);
        setStreak(parsed.streak || 0);
      }

      fetch(`/api/progress?userId=${encodeURIComponent(id)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.progress) {
            setXp(typeof data.progress.xp === "number" ? data.progress.xp : 0);
            setStreak(typeof data.progress.streak === "number" ? data.progress.streak : 0);
          }
        })
        .catch(() => {
          // local fallback only
        });
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("exam-slayer:user", JSON.stringify({ xp, streak }));

      if (userId) {
        fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, xp, streak }),
        }).catch(() => {
          // local fallback only
        });
      }
    } catch (e) {
      // ignore
    }
  }, [xp, streak, userId]);

  function addXP(amount: number) {
    const { xp: newXp } = addXPUtil(xp, amount);
    setXp(newXp);
  }

  function addMathXP() {
    addXP(MATH_XP);
  }

  function addLawXP() {
    addXP(LAW_XP);
  }

  const level = Math.floor(xp / LEVEL_XP);

  return (
    <UserContext.Provider value={{ xp, streak, level, addXP, addMathXP, addLawXP, setStreak }}>
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
