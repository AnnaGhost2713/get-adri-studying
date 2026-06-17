# Exam-Slayer

A study app built for Adri to prepare for exams at TH Aschaffenburg. The AI generates exercises directly from lecture slides, corrects solutions, and gives detailed feedback.

## What it does

- Generates practice problems per chapter using the actual lecture PDFs as context
- AI correction with feedback and a model solution after each submission
- Type your solution or upload a photo of handwritten work
- LaTeX rendering for formulas (WiMa + Statistik)
- XP and streak for every completed exercise
- Login with email/password — Anna and Adri have separate progress

## Subjects & chapters

| Subject | Chapters |
|---------|----------|
| Wirtschaftsprivatrecht (WPR) | 9 — BGB, Gutachtenstil case analysis |
| QM · Wirtschaftsmathematik | 8 + Probeklausur — Differential/Integral calculus, finance math |
| QM · Statistik | 9 + Probeklausur — Descriptive stats, regression, distributions |

The **Probeklausur** chapter unlocks after all regular chapters are done. It generates multi-part exam-style problems based on the real practice exams (Übungsklausuren) with solutions.

## Setup

### 1. Clone & install

```bash
git clone https://github.com/AnnaGhost2713/get-adri-studying.git
cd get-adri-studying
npm install
```

### 2. Create `.env.local`

```env
# Supabase — Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # server-side only, never commit this

# Google Gemini — aistudio.google.com
GEMINI_API_KEY=AIza...
```

### 3. Run

```bash
npm run dev
```

→ [http://localhost:3000](http://localhost:3000)

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. **Settings → API** → copy the keys into `.env.local`
3. **Authentication → Providers → Email** → disable "Confirm email" (otherwise every signup needs an email confirmation, which is annoying locally)
4. **Authentication → URL Configuration → Redirect URLs** → add your Vercel URL: `https://your-app.vercel.app/auth/reset`

## Adding lecture PDFs

The AI uses the lecture slides as context for generating problems. PDFs go in `/public/scripts/` in the correct subfolder:

```
public/scripts/
  mathe/
    wima/
      1_QM_WiMa_Einführung_Mitschrift.pdf
      2_1_QM_WiMa_Grundlagen_Mitschrift.pdf
      1_Übungsklausur_QM_WiMa.pdf          ← picked up by Probeklausur chapter
      1_Übungsklausur_QM_WiMa_Kurzlösung.pdf
      ...
    statistik/
      1_QM_Statistik_Gegenstand...pdf
      1_Übungsklausur_QM_Statistik.pdf     ← picked up by Probeklausur chapter
      ...
  wpr/
      wpr-skript.pdf                       ← not yet split by chapter
```

The file name must start with the `pdfPraefix` defined in `lib/lernplan.ts` for the AI to find it. Exam files (containing `Übungsklausur`) are matched automatically by the Probeklausur chapter.

The app works without PDFs — the AI falls back to general knowledge for the topic.

## Deploy (Vercel)

```bash
git push origin main
```

Vercel detects Next.js automatically. Add the same environment variables under **Settings → Environment Variables**. Set `SUPABASE_SERVICE_ROLE_KEY` to **Production** only, not Preview.

## Project structure

```
app/
  page.tsx              # Dashboard (3 subjects)
  law/                  # WPR — Gutachtenstil case training
  qm/
    wima/               # Wirtschaftsmathematik
    statistik/          # Statistik
  lernplan/             # Chapter overview with progress
  login/                # Login, signup, forgot password
  auth/reset/           # Password reset (after email link)
  api/
    wpr/                # WPR — quiz, case, correction
    qm/                 # WiMa + Statistik — exercise, correction
    progress/           # XP sync with Supabase

lib/
  lernplan.ts           # Chapter definitions for all three subjects
  UserContext.tsx       # XP, streak, progress (localStorage + Supabase)
  AuthContext.tsx       # Login, signup, password reset
  supabase-client.ts    # Supabase client (lazy init, browser)
  ai-client.ts          # Gemini wrapper incl. image analysis for photo uploads
  pdf-utils.ts          # PDF reading for API routes (searches correct subfolder per subject)

components/
  AppShell.tsx          # Auth guard + layout (sidebar toggle)
  Sidebar.tsx           # Navigation with collapsible QM section
  MultipleChoiceQuiz.tsx
  LoesungsEingabe.tsx   # Answer input — type or upload a photo
```

## License

MIT — do whatever you want with it.
