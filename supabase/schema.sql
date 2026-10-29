-- «Выжить до пятницы»: общий рейтинг и список участников.
-- Выполните этот файл целиком в Supabase → SQL Editor → New query → Run.
-- Повторный запуск безопасен: данные не удаляются, обновляются только представления и функция.

-- Результаты законченных недель
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
create index if not exists scores_player_idx on public.scores (player_id, won desc, step desc, total desc);

-- Участники: имя, отдел, аватар и что игрок делает сейчас
create table if not exists public.players (
  player_id   uuid primary key,
  name        text not null check (char_length(name) between 1 and 24),
  dept        text not null default '' check (char_length(dept) <= 24),
  avatar      text not null default '' check (char_length(avatar) <= 16),
  prof        text not null default 'marketer' check (prof in ('marketer', 'accountant', 'dev', 'sales')),
  status      text not null default 'menu' check (status in ('menu', 'playing', 'finished')),
  step        smallint not null default 0 check (step between 0 and 15),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Доступ. Таблицы напрямую не читаются: так никто не узнает чужой player_id и не сможет писать от чужого имени.
-- Игроки только добавляют результаты, обновляют свою запись через touch_player и читают публичные представления.
alter table public.scores enable row level security;
alter table public.players enable row level security;
drop policy if exists "scores are readable" on public.scores;
drop policy if exists "anyone can add a score" on public.scores;
create policy "anyone can add a score" on public.scores for insert to anon with check (true);
revoke all on public.scores from anon;
grant insert on public.scores to anon;
revoke all on public.players from anon;

-- Обновление своей записи участника (вызывается из игры)
create or replace function public.touch_player(p_id uuid, p_name text, p_dept text, p_avatar text, p_prof text, p_status text, p_step int)
returns void language sql security definer set search_path = public as $$
  insert into players (player_id, name, dept, avatar, prof, status, step, updated_at)
  values (p_id, left(trim(p_name), 24), left(coalesce(trim(p_dept), ''), 24), left(coalesce(p_avatar, ''), 16),
          p_prof, p_status, greatest(0, least(15, coalesce(p_step, 0))), now())
  on conflict (player_id) do update set
    name = excluded.name, dept = excluded.dept, avatar = excluded.avatar, prof = excluded.prof,
    status = excluded.status, step = excluded.step, updated_at = now();
$$;
revoke all on function public.touch_player(uuid, text, text, text, text, text, int) from public;
grant execute on function public.touch_player(uuid, text, text, text, text, text, int) to anon;

-- Вместо player_id наружу отдаётся tag — SHA-256 от него. По нему игра узнаёт свою строку.
drop view if exists public.leaderboard;
create view public.leaderboard as
select distinct on (s.player_id)
  encode(sha256(s.player_id::text::bytea), 'hex') as tag,
  coalesce(p.name, s.name) as name, coalesce(p.dept, s.dept) as dept, coalesce(p.avatar, '') as avatar,
  s.prof, s.won, s.step, s.total, s.death, s.created_at
from public.scores s left join public.players p using (player_id)
order by s.player_id, s.won desc, s.step desc, s.total desc, s.created_at asc;

drop view if exists public.participants;
create view public.participants as
select
  encode(sha256(p.player_id::text::bytea), 'hex') as tag,
  p.name, p.dept, p.avatar, p.prof, p.status, p.step, p.created_at, p.updated_at,
  coalesce(g.games, 0) as games, coalesce(g.wins, 0) as wins,
  b.won as best_won, b.step as best_step, b.total as best_total
from public.players p
left join (select player_id, count(*) as games, count(*) filter (where won) as wins from public.scores group by player_id) g using (player_id)
left join lateral (select won, step, total from public.scores s where s.player_id = p.player_id
                   order by won desc, step desc, total desc limit 1) b on true;

grant select on public.leaderboard, public.participants to anon;
