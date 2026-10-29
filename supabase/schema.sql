-- «Выжить до пятницы»: общий рейтинг офиса.
-- Выполните этот файл целиком в Supabase → SQL Editor → New query → Run.

create table if not exists public.scores (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  player_id   uuid not null,
  name        text not null check (char_length(name) between 1 and 24),
  dept        text not null default '' check (char_length(dept) <= 24),
  prof        text not null check (prof in ('marketer', 'accountant', 'dev', 'sales')),
  won         boolean not null,
  step        smallint not null check (step between 0 and 15),
  total       smallint not null check (total between 0 and 400),
  psyche      smallint not null check (psyche between 0 and 100),
  energy      smallint not null check (energy between 0 and 100),
  boss        smallint not null check (boss between 0 and 100),
  colleagues  smallint not null check (colleagues between 0 and 100),
  death       text check (death in ('psyche', 'energy', 'boss', 'colleagues'))
);

-- Лучшая неделя каждого игрока: победа выше поражения, дальше — кто дольше продержался и с каким счётом
create or replace view public.leaderboard with (security_invoker = true) as
select distinct on (player_id) *
from public.scores
order by player_id, won desc, step desc, total desc, created_at asc;

create index if not exists scores_player_idx on public.scores (player_id, won desc, step desc, total desc);

-- Доступ: читать и добавлять результаты может любой игрок, менять и удалять — никто
alter table public.scores enable row level security;
drop policy if exists "scores are readable" on public.scores;
create policy "scores are readable" on public.scores for select to anon using (true);
drop policy if exists "anyone can add a score" on public.scores;
create policy "anyone can add a score" on public.scores for insert to anon with check (true);

grant select, insert on public.scores to anon;
grant select on public.leaderboard to anon;
