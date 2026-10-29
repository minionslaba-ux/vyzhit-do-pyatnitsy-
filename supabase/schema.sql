-- «Выжить до пятницы»: рейтинг, участники, неделя дня, отделы и карточки от коллег.
-- Выполните этот файл целиком в Supabase → SQL Editor → New query → Run.
-- Повторный запуск безопасен: данные не удаляются, обновляются только колонки, представления и доступы.

-- Результаты недель (mode: career — карьера, daily — неделя дня, pack — брендированная неделя)
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
alter table public.scores add column if not exists mode text not null default 'career';
alter table public.scores add column if not exists day date;
alter table public.scores add column if not exists overheat boolean not null default false;
alter table public.scores drop constraint if exists scores_mode_check;
alter table public.scores add constraint scores_mode_check check (mode in ('career', 'daily', 'pack'));
create index if not exists scores_player_idx on public.scores (player_id, won desc, step desc, total desc);
create index if not exists scores_daily_idx on public.scores (mode, day, player_id, created_at);

-- Участники
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

-- Карточки, которые предлагают коллеги. Модерация: Table Editor → suggestions → status = 'approved'
create table if not exists public.suggestions (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  player_id     uuid not null,
  author        text not null check (char_length(author) between 1 and 24),
  who           text not null default 'Коллега' check (char_length(who) between 1 and 24),
  text          text not null check (char_length(text) between 10 and 240),
  left_label    text not null check (char_length(left_label) between 1 and 60),
  right_label   text not null check (char_length(right_label) between 1 and 60),
  left_effects  jsonb not null default '{}',
  right_effects jsonb not null default '{}',
  status        text not null default 'new' check (status in ('new', 'approved', 'rejected'))
);

-- Доступ. Таблицы напрямую не читаются: так никто не узнает чужой player_id и не сможет писать от чужого имени.
alter table public.scores enable row level security;
alter table public.players enable row level security;
alter table public.suggestions enable row level security;
drop policy if exists "scores are readable" on public.scores;
drop policy if exists "anyone can add a score" on public.scores;
create policy "anyone can add a score" on public.scores for insert to anon with check (true);
drop policy if exists "anyone can suggest" on public.suggestions;
create policy "anyone can suggest" on public.suggestions for insert to anon with check (status = 'new');
revoke all on public.scores, public.players, public.suggestions from anon;
grant insert on public.scores, public.suggestions to anon;

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
-- Рейтинг карьеры: лучшая неделя каждого игрока
drop view if exists public.leaderboard;
create view public.leaderboard as
select distinct on (s.player_id)
  encode(sha256(s.player_id::text::bytea), 'hex') as tag,
  coalesce(p.name, s.name) as name, coalesce(p.dept, s.dept) as dept, coalesce(p.avatar, '') as avatar,
  s.prof, s.won, s.step, s.total, s.death, s.created_at
from public.scores s left join public.players p using (player_id)
where s.mode = 'career'
order by s.player_id, s.won desc, s.step desc, s.total desc, s.created_at asc;

-- Неделя дня: в зачёт идёт первая попытка игрока за день
drop view if exists public.daily_leaderboard;
create view public.daily_leaderboard as
select distinct on (s.day, s.player_id)
  s.day, encode(sha256(s.player_id::text::bytea), 'hex') as tag,
  coalesce(p.name, s.name) as name, coalesce(p.dept, s.dept) as dept, coalesce(p.avatar, '') as avatar,
  s.won, s.step, s.total, s.death, s.created_at
from public.scores s left join public.players p using (player_id)
where s.mode = 'daily' and s.day is not null
order by s.day, s.player_id, s.created_at asc;

-- Отдел против отдела: средний результат недель за текущую календарную неделю (с понедельника)
-- Очки недели: закрытая неделя — её счёт, проваленная — 10 очков за каждую пройденную карточку
drop view if exists public.dept_week;
create view public.dept_week as
select coalesce(nullif(p.dept, ''), s.dept) as dept,
  count(distinct s.player_id) as players, count(*) as weeks,
  round(avg(case when s.won then s.total else s.step * 10 end)) as avg_score,
  round(100.0 * avg(case when s.won then 1 else 0 end)) as win_rate
from public.scores s left join public.players p using (player_id)
where s.mode in ('career', 'daily') and s.created_at >= date_trunc('week', now())
  and coalesce(nullif(p.dept, ''), s.dept) <> ''
group by 1;

-- Участники
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

-- Одобренные карточки от коллег
drop view if exists public.approved_cards;
create view public.approved_cards as
select id, author, who, text, left_label, right_label, left_effects, right_effects
from public.suggestions where status = 'approved';

grant select on public.leaderboard, public.daily_leaderboard, public.dept_week, public.participants, public.approved_cards to anon;

-- Обновить кэш схемы API, чтобы новые представления и функция сразу стали доступны (иначе бывает ошибка 404)
notify pgrst, 'reload schema';

-- Проверка: должны вернуться 6 строк
select 'view' as type, table_name as name from information_schema.views
where table_schema = 'public' and table_name in ('leaderboard', 'daily_leaderboard', 'dept_week', 'participants', 'approved_cards')
union all
select 'function', routine_name from information_schema.routines where routine_schema = 'public' and routine_name = 'touch_player';
