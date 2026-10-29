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
alter table public.scores add constraint scores_mode_check check (mode in ('career', 'daily', 'pack', 'tour'));
alter table public.scores add column if not exists tour_id bigint;
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

-- Проверки доступа. Зарегистрированный игрок — это пользователь Supabase Auth с тем же id.
-- Всё, что делается от его имени, требует его токен (auth.uid() = player_id).
create or replace function public.is_registered(p uuid) returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (select 1 from auth.users u where u.id = p);
$$;
create or replace function public.require_player(p_id uuid) returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Эта функция доступна после регистрации: войдите по почте'; end if;
  if auth.uid() <> p_id then raise exception 'Нет доступа: войдите по почте ещё раз'; end if;
end $$;

-- Доступ. Таблицы напрямую не читаются: так никто не узнает чужой player_id и не сможет писать от чужого имени.
alter table public.scores enable row level security;
alter table public.players enable row level security;
alter table public.suggestions enable row level security;
drop policy if exists "scores are readable" on public.scores;
drop policy if exists "anyone can add a score" on public.scores;
drop policy if exists "guests add own scores" on public.scores;
drop policy if exists "users add own scores" on public.scores;
-- гость пишет результат только за гостевой id, зарегистрированный — только за себя
create policy "guests add own scores" on public.scores for insert to anon with check (not public.is_registered(player_id));
create policy "users add own scores" on public.scores for insert to authenticated with check (player_id = auth.uid());
drop policy if exists "anyone can suggest" on public.suggestions;
drop policy if exists "users suggest" on public.suggestions;
-- предлагать карточки могут только зарегистрированные
create policy "users suggest" on public.suggestions for insert to authenticated with check (status = 'new' and player_id = auth.uid());
revoke all on public.scores, public.players, public.suggestions from anon, authenticated;
grant insert on public.scores to anon, authenticated;
grant insert on public.suggestions to authenticated;
grant execute on function public.is_registered(uuid) to anon, authenticated;

-- Обновление своей записи участника (вызывается из игры)
drop function if exists public.touch_player(uuid, text, text, text, text, text, int);
create function public.touch_player(p_id uuid, p_name text, p_dept text, p_avatar text, p_prof text, p_status text, p_step int)
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.is_registered(p_id) then perform public.require_player(p_id); end if;
  insert into players (player_id, name, dept, avatar, prof, status, step, updated_at)
  values (p_id, left(trim(p_name), 24), left(coalesce(trim(p_dept), ''), 24), left(coalesce(p_avatar, ''), 16),
          p_prof, p_status, greatest(0, least(15, coalesce(p_step, 0))), now())
  on conflict (player_id) do update set
    name = excluded.name, dept = excluded.dept, avatar = excluded.avatar, prof = excluded.prof,
    status = excluded.status, step = excluded.step, updated_at = now();
end $$;
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
  encode(sha256(p.player_id::text::bytea), 'hex') as tag, upper(left(encode(sha256(p.player_id::text::bytea), 'hex'), 6)) as short_id,
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

grant select on public.leaderboard, public.daily_leaderboard, public.dept_week, public.participants, public.approved_cards to anon, authenticated;

-- ====================== Офисы, приглашения и чаты ======================
-- Короткий ID игрока: первые 6 символов SHA-256 от player_id (его видно в игре)
create or replace function public.short_id(p uuid) returns text language sql immutable as $$
  select upper(left(encode(sha256(p::text::bytea), 'hex'), 6))
$$;

create table if not exists public.teams (
  id          bigint generated always as identity primary key,
  code        text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  name        text not null check (char_length(name) between 2 and 32),
  owner       uuid not null,
  created_at  timestamptz not null default now()
);
create table if not exists public.team_members (
  player_id   uuid primary key,  -- один офис на игрока
  team_id     bigint not null references public.teams(id) on delete cascade,
  joined_at   timestamptz not null default now()
);
create table if not exists public.invites (
  id          bigint generated always as identity primary key,
  team_id     bigint not null references public.teams(id) on delete cascade,
  from_player uuid not null,
  to_player   uuid not null,
  status      text not null default 'new' check (status in ('new', 'accepted', 'declined')),
  created_at  timestamptz not null default now()
);
create table if not exists public.messages (
  id          bigint generated always as identity primary key,
  channel     text not null,  -- 'global' или 'team:<id офиса>'
  player_id   uuid not null,
  text        text not null check (char_length(text) between 1 and 300),
  created_at  timestamptz not null default now()
);
create index if not exists messages_channel_idx on public.messages (channel, id desc);
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.invites enable row level security;
alter table public.messages enable row level security;
revoke all on public.teams, public.team_members, public.invites, public.messages from anon, authenticated;

-- Всё про офисы и чаты — только через функции ниже: они проверяют, кто что может
create or replace function public.create_team(p_id uuid, p_name text) returns text
language plpgsql security definer set search_path = public as $$
declare v_code text; v_team bigint;
begin
  perform public.require_player(p_id);
  if not exists (select 1 from players where player_id = p_id) then raise exception 'Сначала войдите в игру'; end if;
  loop
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from teams where code = v_code);
  end loop;
  insert into teams (code, name, owner) values (v_code, left(trim(p_name), 32), p_id) returning id into v_team;
  insert into team_members (player_id, team_id) values (p_id, v_team)
    on conflict (player_id) do update set team_id = excluded.team_id, joined_at = now();
  return v_code;
end $$;

create or replace function public.join_team(p_id uuid, p_code text) returns text
language plpgsql security definer set search_path = public as $$
declare v_team bigint; v_name text;
begin
  perform public.require_player(p_id);
  if not exists (select 1 from players where player_id = p_id) then raise exception 'Сначала войдите в игру'; end if;
  select t.id, t.name into v_team, v_name from teams t where t.code = upper(trim(p_code));
  if v_team is null then raise exception 'Офис с таким кодом не найден'; end if;
  insert into team_members (player_id, team_id) values (p_id, v_team)
    on conflict (player_id) do update set team_id = excluded.team_id, joined_at = now();
  return v_name;
end $$;

create or replace function public.leave_team(p_id uuid) returns void
language sql security definer set search_path = public as $$
  delete from team_members where player_id = p_id and p_id = auth.uid();
$$;

create or replace function public.my_team(p_id uuid) returns table (code text, name text, is_owner boolean)
language sql security definer set search_path = public as $$
  select t.code, t.name, t.owner = p_id from team_members m join teams t on t.id = m.team_id where m.player_id = p_id and p_id = auth.uid();
$$;

create or replace function public.team_members_list(p_id uuid)
returns table (name text, dept text, avatar text, short_id text, status text, step smallint, updated_at timestamptz, is_owner boolean, is_me boolean)
language sql security definer set search_path = public as $$
  select p.name, p.dept, p.avatar, public.short_id(p.player_id), p.status, p.step, p.updated_at, t.owner = p.player_id, p.player_id = p_id
  from team_members me
  join team_members m on m.team_id = me.team_id
  join teams t on t.id = m.team_id
  join players p on p.player_id = m.player_id
  where me.player_id = p_id and p_id = auth.uid()
  order by p.updated_at desc;
$$;

create or replace function public.invite_player(p_id uuid, p_short text) returns text
language plpgsql security definer set search_path = public as $$
declare v_team bigint; v_to uuid; v_name text;
begin
  perform public.require_player(p_id);
  select tm.team_id into v_team from team_members tm where tm.player_id = p_id;
  if v_team is null then raise exception 'Сначала создайте офис или вступите в него'; end if;
  select pl.player_id, pl.name into v_to, v_name from players pl where public.short_id(pl.player_id) = upper(trim(p_short)) limit 1;
  if v_to is null then raise exception 'Игрок с таким ID не найден'; end if;
  if exists (select 1 from team_members tm where tm.player_id = v_to and tm.team_id = v_team) then raise exception 'Этот игрок уже в вашем офисе'; end if;
  if exists (select 1 from invites i where i.to_player = v_to and i.team_id = v_team and i.status = 'new') then raise exception 'Приглашение уже отправлено'; end if;
  insert into invites (team_id, from_player, to_player) values (v_team, p_id, v_to);
  return v_name;
end $$;

create or replace function public.my_invites(p_id uuid) returns table (invite_id bigint, team_name text, code text, from_name text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select i.id, t.name, t.code, coalesce(f.name, 'Игрок'), i.created_at
  from invites i join teams t on t.id = i.team_id left join players f on f.player_id = i.from_player
  where i.to_player = p_id and p_id = auth.uid() and i.status = 'new' order by i.created_at desc;
$$;

create or replace function public.answer_invite(p_id uuid, p_invite bigint, p_accept boolean) returns text
language plpgsql security definer set search_path = public as $$
declare v_team bigint;
begin
  perform public.require_player(p_id);
  select i.team_id into v_team from invites i where i.id = p_invite and i.to_player = p_id and i.status = 'new';
  if v_team is null then raise exception 'Приглашение не найдено'; end if;
  update invites set status = case when p_accept then 'accepted' else 'declined' end where id = p_invite;
  if p_accept then
    insert into team_members (player_id, team_id) values (p_id, v_team)
      on conflict (player_id) do update set team_id = excluded.team_id, joined_at = now();
  end if;
  return (select t.name from teams t where t.id = v_team);
end $$;

create or replace function public.post_message(p_id uuid, p_channel text, p_text text) returns void
language plpgsql security definer set search_path = public as $$
declare v_ch text; v_team bigint;
begin
  perform public.require_player(p_id);
  if not exists (select 1 from players where player_id = p_id) then raise exception 'Сначала войдите в игру'; end if;
  if p_channel = 'global' then v_ch := 'global';
  elsif p_channel = 'team' then
    select tm.team_id into v_team from team_members tm where tm.player_id = p_id;
    if v_team is null then raise exception 'Вы пока не состоите в офисе'; end if;
    v_ch := 'team:' || v_team;
  else raise exception 'Неизвестный чат'; end if;
  if exists (select 1 from messages m where m.player_id = p_id and m.created_at > now() - interval '2 seconds') then
    raise exception 'Не так быстро: подождите пару секунд';
  end if;
  insert into messages (channel, player_id, text) values (v_ch, p_id, left(trim(p_text), 300));
end $$;

create or replace function public.get_messages(p_id uuid, p_channel text)
returns table (msg_id bigint, name text, avatar text, short_id text, dept text, msg text, sent_at timestamptz, mine boolean)
language plpgsql security definer set search_path = public as $$
declare v_ch text; v_team bigint;
begin
  perform public.require_player(p_id);
  if p_channel = 'global' then v_ch := 'global';
  else
    select tm.team_id into v_team from team_members tm where tm.player_id = p_id;
    if v_team is null then return; end if;
    v_ch := 'team:' || v_team;
  end if;
  return query
    select m.id, coalesce(pl.name, 'Игрок'), coalesce(pl.avatar, ''), public.short_id(m.player_id), coalesce(pl.dept, ''), m.text, m.created_at, m.player_id = p_id
    from messages m left join players pl on pl.player_id = m.player_id
    where m.channel = v_ch order by m.id desc limit 60;
end $$;

-- Профиль для входа с другого устройства
create or replace function public.get_profile(p_id uuid) returns table (name text, dept text, avatar text)
language sql security definer set search_path = public as $$
  select pl.name, pl.dept, pl.avatar from players pl where pl.player_id = p_id;
$$;

-- Перенос гостевого прогресса в аккаунт после входа по почте (только сам владелец аккаунта)
create or replace function public.merge_player(p_from uuid, p_to uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.uid() <> p_to then raise exception 'Нужен вход по почте'; end if;
  if p_from = p_to then return; end if;
  update scores set player_id = p_to where player_id = p_from;
  update suggestions set player_id = p_to where player_id = p_from;
  update messages set player_id = p_to where player_id = p_from;
  update invites set to_player = p_to where to_player = p_from;
  update invites set from_player = p_to where from_player = p_from;
  update teams set owner = p_to where owner = p_from;
  if exists (select 1 from team_members where player_id = p_to) then delete from team_members where player_id = p_from;
  else update team_members set player_id = p_to where player_id = p_from; end if;
  if exists (select 1 from players where player_id = p_to) then delete from players where player_id = p_from;
  else update players set player_id = p_to where player_id = p_from; end if;
end $$;

-- ====================== Приглашения в игру (рефералы) ======================
-- Кто по чьей ссылке пришёл: один пригласивший на игрока, себя пригласить нельзя
create table if not exists public.referrals (
  player_id   uuid primary key,
  ref_player  uuid not null,
  created_at  timestamptz not null default now()
);
alter table public.referrals enable row level security;
revoke all on public.referrals from anon, authenticated;

create or replace function public.claim_referral(p_id uuid, p_ref text) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_ref uuid;
begin
  if public.is_registered(p_id) then perform public.require_player(p_id); end if;
  if not exists (select 1 from players where player_id = p_id) then return false; end if;
  select pl.player_id into v_ref from players pl where public.short_id(pl.player_id) = upper(trim(p_ref)) limit 1;
  if v_ref is null or v_ref = p_id then return false; end if;
  insert into referrals (player_id, ref_player) values (p_id, v_ref) on conflict (player_id) do nothing;
  return found;
end $$;

-- Сколько игроков пришло по ссылкам игрока (только число)
create or replace function public.referral_count(p_id uuid) returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::int from referrals where ref_player = p_id;
$$;

-- ====================== Турнир офиса ======================
-- Создатель офиса назначает время старта; все участники играют одну и ту же неделю (seed), в зачёт — первая попытка
create table if not exists public.tournaments (
  id          bigint generated always as identity primary key,
  team_id     bigint not null references public.teams(id) on delete cascade,
  starts_at   timestamptz not null,
  seed        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists tournaments_team_idx on public.tournaments (team_id, id desc);
alter table public.tournaments enable row level security;
revoke all on public.tournaments from anon, authenticated;

create or replace function public.set_tournament(p_id uuid, p_starts timestamptz) returns text
language plpgsql security definer set search_path = public as $$
declare v_team bigint; v_seed text;
begin
  perform public.require_player(p_id);
  select t.id into v_team from teams t join team_members m on m.team_id = t.id where m.player_id = p_id and t.owner = p_id;
  if v_team is null then raise exception 'Назначать турнир может только создатель офиса'; end if;
  if p_starts < now() - interval '1 minute' then raise exception 'Время старта уже прошло'; end if;
  v_seed := md5(random()::text || clock_timestamp()::text);
  insert into tournaments (team_id, starts_at, seed) values (v_team, p_starts, v_seed);
  return v_seed;
end $$;

-- Текущий (последний) турнир офиса игрока
create or replace function public.my_tournament(p_id uuid) returns table (tour_id bigint, starts_at timestamptz, seed text, team_name text, code text, is_owner boolean)
language sql security definer set search_path = public as $$
  select tr.id, tr.starts_at, tr.seed, t.name, t.code, t.owner = p_id
  from team_members m join teams t on t.id = m.team_id join tournaments tr on tr.team_id = t.id
  where m.player_id = p_id and p_id = auth.uid()
  order by tr.id desc limit 1;
$$;

-- Таблица турнира по коду офиса — для экрана итогов на проекторе (код знают только свои)
create or replace function public.tournament_board(p_code text)
returns table (team_name text, starts_at timestamptz, name text, avatar text, dept text, won boolean, step smallint, total smallint, death text, overheat boolean, played_at timestamptz)
language sql stable security definer set search_path = public as $$
  with tr as (
    select tr.id, tr.starts_at, t.name from tournaments tr join teams t on t.id = tr.team_id
    where t.code = upper(trim(p_code)) order by tr.id desc limit 1
  ), first as (
    select distinct on (s.player_id) s.* from scores s, tr where s.mode = 'tour' and s.tour_id = tr.id order by s.player_id, s.created_at asc
  )
  select tr.name, tr.starts_at, coalesce(p.name, f.name), coalesce(p.avatar, ''), coalesce(p.dept, f.dept), f.won, f.step, f.total, f.death, f.overheat, f.created_at
  from tr left join first f on true left join players p on p.player_id = f.player_id
  order by f.won desc nulls last, f.step desc nulls last, f.total desc nulls last;
$$;

do $$
declare f text;
begin
  foreach f in array array['create_team(uuid,text)', 'join_team(uuid,text)', 'leave_team(uuid)', 'my_team(uuid)', 'team_members_list(uuid)',
    'invite_player(uuid,text)', 'my_invites(uuid)', 'answer_invite(uuid,bigint,boolean)', 'post_message(uuid,text,text)',
    'get_messages(uuid,text)', 'get_profile(uuid)', 'merge_player(uuid,uuid)', 'touch_player(uuid,text,text,text,text,text,int)', 'require_player(uuid)', 'claim_referral(uuid,text)', 'referral_count(uuid)',
    'set_tournament(uuid,timestamptz)', 'my_tournament(uuid)', 'tournament_board(text)'] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
end $$;

-- Обновить кэш схемы API, чтобы новые представления и функции сразу стали доступны (иначе бывает ошибка 404)
notify pgrst, 'reload schema';

-- Проверка: должны вернуться 23 строки
select 'view' as type, table_name as name from information_schema.views
where table_schema = 'public' and table_name in ('leaderboard', 'daily_leaderboard', 'dept_week', 'participants', 'approved_cards')
union all
select 'function', routine_name from information_schema.routines where routine_schema = 'public' and routine_name in
  ('touch_player', 'short_id', 'create_team', 'join_team', 'leave_team', 'my_team', 'team_members_list', 'invite_player',
   'my_invites', 'answer_invite', 'post_message', 'get_messages', 'get_profile', 'claim_referral', 'referral_count', 'set_tournament', 'my_tournament', 'tournament_board');
