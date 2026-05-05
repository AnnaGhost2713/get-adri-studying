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
