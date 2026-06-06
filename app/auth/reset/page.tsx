"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, BookOpen, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function PasswortResetSeite() {
  const { updatePassword } = useAuth();
  const router = useRouter();

  const [passwort, setPasswort] = useState("");
  const [passwortWdh, setPasswortWdh] = useState("");
  const [sichtbar, setSichtbar] = useState(false);
  const [laden, setLaden] = useState(false);
  const [fehler, setFehler] = useState("");
  const [fertig, setFertig] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setFehler("");

    if (passwort !== passwortWdh) {
      setFehler("Die Passwörter stimmen nicht überein.");
      return;
    }
    if (passwort.length < 6) {
      setFehler("Passwort muss mindestens 6 Zeichen haben.");
      return;
    }

    setLaden(true);
    const { error } = await updatePassword(passwort);
    setLaden(false);

    if (error) {
      setFehler(error);
    } else {
      setFertig(true);
      setTimeout(() => router.push("/"), 2500);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Exam-Slayer</h1>
          <p className="text-slate-500 text-sm">Neues Passwort festlegen.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {fertig ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-semibold text-slate-800">Passwort geändert!</p>
              <p className="text-sm text-slate-500">Du wirst gleich weitergeleitet...</p>
            </div>
          ) : (
            <form onSubmit={absenden} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Neues Passwort</label>
                <div className="relative">
                  <input
                    type={sichtbar ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwort}
                    onChange={(e) => setPasswort(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <button
                    type="button"
                    onClick={() => setSichtbar(!sichtbar)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {sichtbar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Passwort wiederholen</label>
                <input
                  type={sichtbar ? "text" : "password"}
                  required
                  value={passwortWdh}
                  onChange={(e) => setPasswortWdh(e.target.value)}
                  placeholder="Nochmal eingeben"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              {fehler && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">{fehler}</div>
              )}

              <button
                type="submit"
                disabled={laden}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {laden && <Loader2 className="w-4 h-4 animate-spin" />}
                Passwort speichern
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
