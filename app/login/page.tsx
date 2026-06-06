"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function LoginSeite() {
  const { signIn, signUp, resetPassword } = useAuth();
  const router = useRouter();

  const [modus, setModus] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");
  const [passwortSichtbar, setPasswortSichtbar] = useState(false);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [info, setInfo] = useState("");

  function modusWechseln(neuerModus: "login" | "signup" | "reset") {
    setModus(neuerModus);
    setFehler("");
    setInfo("");
  }

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");
    setInfo("");
    setLaden(true);

    if (modus === "login") {
      const { error } = await signIn(email, passwort);
      if (error) {
        setFehler(error);
      } else {
        router.push("/");
      }
    } else if (modus === "signup") {
      const { error } = await signUp(email, passwort);
      if (error) {
        setFehler(error);
      } else {
        setInfo("Konto erstellt! Bitte E-Mail bestätigen, dann einloggen.");
        modusWechseln("login");
      }
    } else {
      const { error } = await resetPassword(email);
      if (error) {
        setFehler(error);
      } else {
        setInfo("Link gesendet! Schau in dein E-Mail-Postfach.");
      }
    }

    setLaden(false);
  }

  const titelText = {
    login: "Meld dich an, um weiterzumachen.",
    signup: "Neues Konto erstellen.",
    reset: "Passwort zurücksetzen.",
  }[modus];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Exam-Slayer</h1>
          <p className="text-slate-500 text-sm">{titelText}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          {/* Tab-Wechsel (nur Login/Registrieren) */}
          {modus !== "reset" && (
            <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
              <button
                onClick={() => modusWechseln("login")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  modus === "login" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Einloggen
              </button>
              <button
                onClick={() => modusWechseln("signup")}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  modus === "signup" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Registrieren
              </button>
            </div>
          )}

          <form onSubmit={absenden} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">E-Mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="du@beispiel.de"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {modus !== "reset" && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Passwort</label>
                <div className="relative">
                  <input
                    type={passwortSichtbar ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwort}
                    onChange={(e) => setPasswort(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswortSichtbar(!passwortSichtbar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {passwortSichtbar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {modus === "login" && (
                  <button
                    type="button"
                    onClick={() => modusWechseln("reset")}
                    className="mt-1.5 text-xs text-indigo-500 hover:text-indigo-700 hover:underline"
                  >
                    Passwort vergessen?
                  </button>
                )}
              </div>
            )}

            {fehler && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">{fehler}</div>
            )}
            {info && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">{info}</div>
            )}

            <button
              type="submit"
              disabled={laden}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {laden && <Loader2 className="w-4 h-4 animate-spin" />}
              {modus === "login" && "Einloggen"}
              {modus === "signup" && "Konto erstellen"}
              {modus === "reset" && "Reset-Link senden"}
            </button>

            {modus === "reset" && (
              <button
                type="button"
                onClick={() => modusWechseln("login")}
                className="w-full text-xs text-slate-500 hover:text-slate-700 hover:underline"
              >
                Zurück zum Einloggen
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
