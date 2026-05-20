create table if not exists public.user_progress (
  user_id text primary key,
  xp integer not null default 0,
  streak integer not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.set_user_progress_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_user_progress_updated_at on public.user_progress;
create trigger trg_set_user_progress_updated_at
before update on public.user_progress
for each row
execute function public.set_user_progress_updated_at();

-- Speichert abgeschlossene Lernsessions
create table if not exists public.session_history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.user_progress(user_id) on delete cascade,
  fach text not null check (fach in ('wpr', 'mathe')),
  quiz_score integer not null default 0,   -- Anzahl richtige MC-Antworten
  quiz_gesamt integer not null default 4,  -- Anzahl MC-Fragen gesamt
  aufgabe_punkte integer not null default 0, -- 0-100 Punkte für Lösung
  xp_verdient integer not null default 0,
  thema text,
  erstellt_am timestamptz not null default now()
);

create index if not exists idx_session_history_user_id on public.session_history(user_id);
create index if not exists idx_session_history_fach on public.session_history(fach);
