# Exam-Slayer

KI-gestützte Lernapp für die Prüfungsvorbereitung an der TH Aschaffenburg — gamifiziert mit XP, Streak und KI-Korrektur.

## Fächer

| Fach | Inhalt | Kapitel |
|------|--------|---------|
| **WPR** | Wirtschaftsprivatrecht (BGB, Gutachtenstil) | 9 |
| **QM · WiMa** | Wirtschaftsmathematik (Funktionen, Differential- & Integralrechnung, Finanzmathematik) | 8 |
| **QM · Statistik** | Deskriptive Statistik, Regression, Zufallsvariablen, Verteilungen | 9 |

## Lernablauf

Jedes Kapitel folgt demselben Ablauf:

1. **Wissenscheck** — 4 KI-generierte Multiple-Choice-Fragen aus dem Skript
2. **Aufgabe lösen** — KI generiert eine Übungsaufgabe (mit LaTeX-Formeln für Mathe/Statistik)
3. **KI-Korrektur** — detailliertes Feedback + Musterlösung + XP-Vergabe

## Tech-Stack

- **Framework:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **KI:** Google Gemini Flash (`@google/generative-ai`)
- **Auth & DB:** Supabase (`@supabase/supabase-js`) — Email/Passwort
- **LaTeX:** KaTeX (WiMa + Statistik)

## Lokale Einrichtung

### 1. Repository klonen & Dependencies installieren

```bash
git clone <repo-url>
cd get-adri-studying
npm install
```

### 2. Umgebungsvariablen setzen

`.env.local` im Projektroot anlegen:

```env
# Supabase — Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # geheim halten, nie ins Git!

# Google Gemini
GEMINI_API_KEY=AIza...
```

### 3. Dev-Server starten

```bash
npm run dev
```

App läuft auf [http://localhost:3000](http://localhost:3000).

## Supabase einrichten

1. Projekt auf [supabase.com](https://supabase.com) erstellen
2. **Settings → API** → die drei Keys in `.env.local` eintragen (s. oben)
3. **Authentication → Providers → Email** — ist standardmäßig aktiviert, kein extra Schritt nötig
4. Datenbank-Schema ausführen (falls vorhanden: `supabase/schema.sql`)

## Skripte als PDF hinterlegen

Die KI nutzt die Vorlesungsskripte als Grundlage für Fragen und Aufgaben.
PDFs in `/public/scripts/` ablegen — Namenskonvention:

```
# Wirtschaftsmathematik
1_QM_WiMa_Einführung_Mitschrift.pdf
2_1_QM_WiMa_Grundlagen_Mitschrift.pdf
2_2_QM_WiMa_Gleichungen_Mitschrift.pdf
...

# Statistik
1_QM_Statistik_Gegenstand und Grundbegriffe_Mitschrift.pdf
2_1_QM_Statistik_Darstellung univariater Datensätze_Mitschrift.pdf
...

# WPR (beliebiger Name mit "wpr" am Anfang)
wpr-skript.pdf
```

> Ohne PDFs funktioniert die App trotzdem — die KI generiert dann allgemeine Fragen zum Thema.

## Auf Vercel deployen

```bash
git push origin main
```

Vercel erkennt das Next.js-Projekt automatisch. Umgebungsvariablen unter **Settings → Environment Variables** eintragen (dieselben wie in `.env.local`, außer `SUPABASE_SERVICE_ROLE_KEY` nur unter _Server_-Umgebung).

## Projektstruktur

```
app/
  page.tsx              # Dashboard
  law/                  # WPR
  qm/
    wima/               # Wirtschaftsmathematik
    statistik/          # Statistik
  lernplan/             # Kapitelübersicht
  login/                # Auth
  api/
    wpr/                # WPR KI-Route
    qm/                 # QM KI-Route (WiMa + Statistik)
    progress/           # Supabase XP-Sync

lib/
  lernplan.ts           # Kapitel-Definitionen (WPR, WiMa, Statistik)
  UserContext.tsx        # XP, Streak, Fortschritt pro Fach
  AuthContext.tsx        # Supabase Auth
  ai-client.ts          # Gemini-Wrapper
  gamification.ts        # XP/Level-Logik

components/
  Sidebar.tsx            # Navigation mit QM-Klapps-Menü
  AppShell.tsx           # Auth-Guard + Layout
  MultipleChoiceQuiz.tsx # Wiederverwendbare MC-Komponente
```
