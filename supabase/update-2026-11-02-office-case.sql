-- 2026-11-02: «Дело недели» для офисов — кооперативный детектив (js/officecase.js, data/office_cases.json).
-- Повторный запуск безопасен.
--
-- Каждую московскую неделю (пн 00:00 – вс 23:59) у офиса одно дело: номер = (id офиса * 7 + номер недели) % 30.
-- Подозреваемые — выдуманные персонажи из data/office_cases.json; виновный каждого дела хранится только здесь
-- (office_case_culprit), игра узнаёт его после закрытия дела.
-- Дело закрывается, когда проголосовали ≥ 60% участников офиса (минимум 2), или само — в конце недели.
-- Награда (выдаёт игра после ответа office_case_claim): +1 у.е. за голос, +5 у.е. за верный ответ; не больше одной награды в неделю.
--
--   office_case_votes     — голоса (офис, неделя, игрок, подозреваемый 0–4, rewarded)
--   office_case_closed    — закрытые дела: виновный, сколько голосовало, раскрыто ли (большинство указало на виновного)
--   office_case_state(p_id)            → jsonb: дело недели, мой голос, сколько проголосовало; после закрытия — кто как голосовал
--   office_case_vote(p_id, p_suspect)  → jsonb (то же, что state); голос можно менять, пока дело открыто
--   office_case_claim(p_id)            → int: сколько у.е. начислить (один раз)

create table if not exists public.office_case_votes (
  team_id   bigint not null references public.teams(id) on delete cascade,
  week      date not null,                       -- понедельник недели по Москве
  player_id uuid not null,
  suspect   smallint not null check (suspect between 0 and 4),
  voted_at  timestamptz not null default now(),
  rewarded  boolean not null default false,
  primary key (team_id, week, player_id)
);
create index if not exists office_case_votes_player_idx on public.office_case_votes (player_id, week);

create table if not exists public.office_case_closed (
  team_id   bigint not null references public.teams(id) on delete cascade,
  week      date not null,
  case_no   smallint not null,
  culprit   smallint not null,
  members   smallint not null,
  voters    smallint not null,
  solved    boolean not null,
  closed_at timestamptz not null default now(),
  primary key (team_id, week)
);

-- Напрямую таблицы не читаются и не пишутся — только через функции ниже
alter table public.office_case_votes enable row level security;
alter table public.office_case_closed enable row level security;
revoke all on public.office_case_votes, public.office_case_closed from anon, authenticated;

-- ---------- служебные функции (снаружи не вызываются) ----------
create or replace function public.office_case_week() returns date
language sql stable set search_path = public as $$
  select date_trunc('week', now() at time zone 'Europe/Moscow')::date
$$;
create or replace function public.office_case_no(p_team bigint, p_week date) returns int
language sql immutable set search_path = public as $$
  select ((p_team * 7 + (p_week - date '2024-01-01') / 7) % 30)::int
$$;
-- Виновный в деле № n (0…29) — порядок дел как в data/office_cases.json
create or replace function public.office_case_culprit(p_case int) returns smallint
language sql immutable set search_path = public as $$
  select (array[2,4,0,4,2,1,3,4,2,3,1,2,3,0,0,1,3,3,1,0,1,3,1,0,3,1,3,1,1,2]::smallint[])[p_case + 1]
$$;
-- Закрыть дело (если ещё не закрыто). Раскрыто — когда у виновного строго больше голосов, чем у любого другого
create or replace function public.office_case_close(p_team bigint, p_week date) returns void
language plpgsql security definer set search_path = public as $$
declare v_case int := public.office_case_no(p_team, p_week); v_cul smallint := public.office_case_culprit(v_case);
        v_n int; v_cn int; v_other int;
begin
  select count(*) into v_n from office_case_votes where team_id = p_team and week = p_week;
  if v_n = 0 then return; end if;
  select count(*) filter (where suspect = v_cul), coalesce(max(c) filter (where s <> v_cul), 0) into v_cn, v_other
    from (select suspect, suspect as s, count(*) over (partition by suspect) as c from office_case_votes where team_id = p_team and week = p_week) x;
  insert into office_case_closed (team_id, week, case_no, culprit, members, voters, solved)
    values (p_team, p_week, v_case, v_cul, (select count(*) from team_members where team_id = p_team), v_n, v_cn > v_other)
    on conflict (team_id, week) do nothing;
end $$;
-- Прошлые недели закрываются сами (конец недели), текущая — когда набралось 60% голосов (минимум 2)
create or replace function public.office_case_settle(p_team bigint) returns void
language plpgsql security definer set search_path = public as $$
declare w date; v_week date := public.office_case_week(); v_members int; v_voted int;
begin
  for w in select distinct v.week from office_case_votes v where v.team_id = p_team and v.week < v_week
           and not exists (select 1 from office_case_closed c where c.team_id = p_team and c.week = v.week) loop
    perform public.office_case_close(p_team, w);
  end loop;
  select count(*) into v_members from team_members where team_id = p_team;
  select count(*) into v_voted from office_case_votes where team_id = p_team and week = v_week;
  if v_voted >= greatest(2, ceil(0.6 * v_members)) then perform public.office_case_close(p_team, v_week); end if;
end $$;
revoke execute on function public.office_case_week(), public.office_case_no(bigint, date), public.office_case_culprit(int),
  public.office_case_close(bigint, date), public.office_case_settle(bigint) from public, anon, authenticated;

-- ---------- для игры ----------
create or replace function public.office_case_state(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_team bigint; v_week date := public.office_case_week(); v_members int; v_voted int; v_my smallint; v_rew boolean;
        v_slot int; c office_case_closed; r jsonb;
begin
  perform public.require_player(p_id);
  select tm.team_id into v_team from team_members tm where tm.player_id = p_id;
  if v_team is null then return jsonb_build_object('team', false); end if;
  perform public.office_case_settle(v_team);
  select count(*) into v_members from team_members where team_id = v_team;
  select count(*) into v_voted from office_case_votes where team_id = v_team and week = v_week;
  select suspect, rewarded into v_my, v_rew from office_case_votes where team_id = v_team and week = v_week and player_id = p_id;
  select n - 1 into v_slot from (select player_id, row_number() over (order by joined_at, player_id) as n from team_members where team_id = v_team) x where x.player_id = p_id;
  select * into c from office_case_closed where team_id = v_team and week = v_week;
  r := jsonb_build_object('team', true, 'week', v_week, 'week_no', (v_week - date '2024-01-01') / 7,
    'case_no', public.office_case_no(v_team, v_week), 'members', v_members, 'voted', v_voted,
    'need', greatest(2, ceil(0.6 * v_members))::int, 'my_vote', v_my, 'my_rewarded', coalesce(v_rew, false), 'my_slot', v_slot,
    'closed', c.team_id is not null, 'closes_at', ((v_week + 7)::timestamp at time zone 'Europe/Moscow'),
    'solved_total', (select count(*) from office_case_closed where team_id = v_team and solved),
    'cases_total', (select count(*) from office_case_closed where team_id = v_team));
  if c.team_id is not null then
    r := r || jsonb_build_object('culprit', c.culprit, 'solved', c.solved,
      'tally', (select jsonb_agg((select count(*) from office_case_votes v where v.team_id = v_team and v.week = v_week and v.suspect = s) order by s) from generate_series(0, 4) s),
      'voters', (select coalesce(jsonb_agg(jsonb_build_object('name', p.name, 'avatar', p.avatar, 'suspect', v.suspect,
                   'right', v.suspect = c.culprit, 'is_me', v.player_id = p_id) order by (v.suspect = c.culprit) desc, v.voted_at), '[]'::jsonb)
                 from office_case_votes v join players p on p.player_id = v.player_id where v.team_id = v_team and v.week = v_week));
  end if;
  return r;
end $$;

create or replace function public.office_case_vote(p_id uuid, p_suspect int) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_team bigint; v_week date := public.office_case_week();
begin
  perform public.require_player(p_id);
  select tm.team_id into v_team from team_members tm where tm.player_id = p_id;
  if v_team is null then raise exception 'Сначала создайте офис или вступите в него'; end if;
  if p_suspect is null or p_suspect not between 0 and 4 then raise exception 'Такого подозреваемого нет'; end if;
  if (select count(*) from team_members where team_id = v_team) < 2 then
    raise exception 'Расследовать в одиночку нельзя — позовите в офис хотя бы одного коллегу';
  end if;
  perform public.office_case_settle(v_team);
  if exists (select 1 from office_case_closed where team_id = v_team and week = v_week) then
    raise exception 'Дело уже закрыто — новое будет в понедельник';
  end if;
  insert into office_case_votes (team_id, week, player_id, suspect) values (v_team, v_week, p_id, p_suspect)
    on conflict (team_id, week, player_id) do update set suspect = excluded.suspect, voted_at = now();
  perform public.office_case_settle(v_team);
  return public.office_case_state(p_id);
end $$;

-- Награда за закрытые дела (последние 8 недель): +1 за голос, +5 за верный; одна награда на неделю, даже если игрок сменил офис
create or replace function public.office_case_claim(p_id uuid) returns int
language plpgsql security definer set search_path = public as $$
declare t bigint; v_sum int;
begin
  perform public.require_player(p_id);
  for t in select distinct v.team_id from office_case_votes v where v.player_id = p_id and not v.rewarded loop
    perform public.office_case_settle(t);
  end loop;
  with paid as (
    update office_case_votes v set rewarded = true
      from office_case_closed c
      where v.player_id = p_id and not v.rewarded and c.team_id = v.team_id and c.week = v.week
        and v.week > public.office_case_week() - 56
      returning v.week, (v.suspect = c.culprit) as ok
  ), per_week as (
    select p.week, max(case when p.ok then 6 else 1 end) as amount from paid p
      where not exists (select 1 from office_case_votes o where o.player_id = p_id and o.week = p.week and o.rewarded)  -- снимок до update
      group by p.week
  )
  select coalesce(sum(amount), 0)::int into v_sum from per_week;
  return v_sum;
end $$;

revoke execute on function public.office_case_state(uuid), public.office_case_vote(uuid, int), public.office_case_claim(uuid) from public;
grant execute on function public.office_case_state(uuid), public.office_case_vote(uuid, int), public.office_case_claim(uuid) to anon, authenticated;
