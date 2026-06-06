# Exam-Slayer

Eine Lernapp für Adri, gebaut zur Prüfungsvorbereitung an der TH Aschaffenburg. Die KI generiert Fragen und Aufgaben direkt aus den Vorlesungsskripten, korrigiert Lösungen und gibt konkretes Feedback.

## Was die App kann

- Multiple-Choice-Quiz pro Kapitel (KI-generiert aus den Skripten)
- Rechen- und Fallaufgaben mit KI-Korrektur und Musterlösung
- Lösungen tippen oder Foto einer handschriftlichen Lösung hochladen
- LaTeX-Rendering für Formeln (WiMa + Statistik)
- XP und Streak für jede abgeschlossene Übung
- Login mit Email/Passwort 

## Fächer & Kapitel

| Fach | Kapitel |
|------|---------|
| Wirtschaftsprivatrecht (WPR) | 9 — BGB, Gutachtenstil |
| QM · Wirtschaftsmathematik | 8 — Differential-/Integralrechnung, Finanzmathematik |
| QM · Statistik | 9 — Lage-/Streumaße, Regression, Verteilungen |

## Einrichtung

### 1. Klonen & installieren

```bash
git clone https://github.com/AnnaGhost2713/get-adri-studying.git
cd get-adri-studying
npm install
```

### 2. `.env.local` anlegen

```env
# Supabase — Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   

# Google Gemini — aistudio.google.com
GEMINI_API_KEY=AIza...
```

### 3. Starten

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

## Supabase einrichten

1. Projekt auf [supabase.com](https://supabase.com) erstellen
2. **Settings → API** → die Keys aus `.env.local` eintragen
3. **Authentication → Providers → Email** → "Confirm email" deaktivieren (sonst braucht jede Registrierung eine Bestätigungsmail, was lokal umständlich ist)
4. Unter **Authentication → URL Configuration → Redirect URLs** die Vercel-URL eintragen: `https://deine-app.vercel.app/auth/reset`

## Skripte hinterlegen

Die KI nutzt die Vorlesungsskripte als Grundlage. PDFs kommen in `/public/scripts/`.

Die Dateinamen müssen zum `pdfPraefix` in `lib/lernplan.ts` passen — die App sucht nach Dateien, die mit dem Präfix beginnen:

```
# Wirtschaftsmathematik
1_QM_WiMa_Einführung_Mitschrift.pdf       → pdfPraefix: "1_QM_WiMa"
2_1_QM_WiMa_Grundlagen_Mitschrift.pdf     → pdfPraefix: "2_1_QM_WiMa"

# Statistik
1_QM_Statistik_Gegenstand...pdf           → pdfPraefix: "1_QM_Statistik"

# WPR (noch nicht nach Kapiteln geclustert)
wpr-skript.pdf                            → pdfPraefix: "wpr"
```

Ohne PDFs funktioniert die App trotzdem — die KI generiert dann allgemeine Fragen zum Thema.

## Deployment (Vercel)

```bash
git push origin main
```

Vercel erkennt Next.js automatisch. Umgebungsvariablen unter **Settings → Environment Variables** eintragen — dieselben wie in `.env.local`. `SUPABASE_SERVICE_ROLE_KEY` nur für die _Production_-Umgebung setzen, nicht im Preview.

## Projektstruktur

```
app/
  page.tsx              # Dashboard (3 Fächer)
  law/                  # WPR — Falltraining im Gutachtenstil
  qm/
    wima/               # Wirtschaftsmathematik
    statistik/          # Statistik
  lernplan/             # Kapitelübersicht mit Fortschritt
  login/                # Login, Registrierung, Passwort vergessen
  auth/reset/           # Passwort zurücksetzen (nach E-Mail-Link)
  api/
    wpr/                # WPR — Quiz, Fall, Korrektur
    qm/                 # WiMa + Statistik — Quiz, Aufgabe, Korrektur
    progress/           # XP-Sync mit Supabase

lib/
  lernplan.ts           # Kapitel-Definitionen für alle drei Fächer
  UserContext.tsx       # XP, Streak, Fortschritt (localStorage + Supabase)
  AuthContext.tsx       # Login, Registrierung, Passwort-Reset
  supabase-client.ts    # Supabase-Client (lazy init, browser)
  ai-client.ts          # Gemini-Wrapper inkl. Bildanalyse für Fotos
  pdf-utils.ts          # PDF-Lesefunktionen für die API-Routen

components/
  AppShell.tsx          # Auth-Guard + Layout (Sidebar ein/aus)
  Sidebar.tsx           # Navigation mit aufklappbarem QM-Bereich
  MultipleChoiceQuiz.tsx
  LoesungsEingabe.tsx   # Eingabe tippen oder Foto hochladen
```

## Lizenz

MIT — mach damit was du willst :D 
