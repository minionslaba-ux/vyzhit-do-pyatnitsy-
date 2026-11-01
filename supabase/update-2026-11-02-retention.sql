-- «Возвращаемость»: еженедельный турнир отделов с наградами (js/retention.js).
-- Выполнить после schema.sql и update-2026-10-31-push.sql в Supabase → SQL Editor. Повторный запуск безопасен.
--
-- Неделя турнира — по Москве: с понедельника 00:00 до воскресенья 23:59 (MSK = UTC+3, без перехода на летнее время).
-- Очки отдела: у каждого игрока отдела берётся лучший результат недели (карьера и неделя дня; закрытая неделя — её счёт,
-- проваленная — 10 очков за каждую пройденную карточку, как в dept_week), затем среднее по игрокам отдела.
-- Так «спам» неделями не помогает, а одного сильного игрока мало: в зачёт мест и наград — отделы, где играли хотя бы
-- 2 человека (DEPT_TOUR_MIN в функциях ниже). Отдел берётся из результата (scores.dept на момент игры) — сменить отдел
-- задним числом и «перейти» к победителю нельзя.
-- Награда игроку из отдела, занявшего 1–3 место прошлой недели: 15 / 10 / 5 у.е., один раз за неделю (таблица dept_rewards).

-- ====================== Таблица выданных наград ======================
create table if not exists public.dept_rewards (
  player_id  uuid not null,
  week       date not null,           -- понедельник недели турнира (по Москве)
  dept       text not null,
  place      smallint not null check (place between 1 and 3),
  amount     smallint not null check (amount in (5, 10, 15)),
  claimed_at timestamptz not null default now(),
  primary key (player_id, week)
);
alter table public.dept_rewards enable row level security;
revoke all on public.dept_rewards from anon, authenticated;

-- Начало недели турнира (понедельник 00:00 по Москве) со сдвигом: 0 — текущая, 1 — прошлая …
create or replace function public.dept_tour_start(p_offset int default 0) returns timestamptz
language sql stable set search_path = public as $$
  select (date_trunc('week', now() at time zone 'Europe/Moscow') - make_interval(weeks => greatest(0, least(coalesce(p_offset, 0), 8)))) at time zone 'Europe/Moscow'
$$;

-- Таблица турнира отделов: место, отдел, игроков, недель сыграно, очки (среднее лучших результатов), побед, в зачёте ли
create or replace function public.dept_tour(p_offset int default 0)
returns table (place int, dept text, players int, weeks int, score int, wins int, qualified boolean, week date)
language sql stable security definer set search_path = public as $$
  with w as (select public.dept_tour_start(p_offset) as a),
  s as (
    select coalesce(nullif(s.dept, ''), p.dept, '') as dept, s.player_id, s.won,
           case when s.won then s.total else s.step * 10 end as pts
    from scores s left join players p using (player_id), w
    where s.mode in ('career', 'daily') and s.created_at >= w.a and s.created_at < w.a + interval '7 days'
  ),
  best as (select dept, player_id, max(pts) as pts, count(*) as n, count(*) filter (where won) as wins from s where dept <> '' group by 1, 2),
  d as (
    select dept, count(*)::int as players, sum(n)::int as weeks, round(avg(pts))::int as score, sum(wins)::int as wins, count(*) >= 2 as qualified
    from best group by 1
  )
  select (row_number() over (order by qualified desc, score desc, players desc, dept))::int, dept, players, weeks, score, wins, qualified,
         ((select a from w) at time zone 'Europe/Moscow')::date
  from d order by 1 limit 50;
$$;
revoke all on function public.dept_tour(int) from public;
grant execute on function public.dept_tour(int) to anon, authenticated, service_role;

-- Отдел игрока на прошлой неделе (по его результатам) и награда за неё: для окна итогов в понедельник
create or replace function public.my_dept_reward(p_id uuid)
returns table (week date, dept text, place int, amount int, claimed boolean)
language plpgsql stable security definer set search_path = public as $$
declare v_from timestamptz := public.dept_tour_start(1); v_dept text; v_place int; v_q boolean;
begin
  if auth.uid() is null or auth.uid() <> p_id then return; end if;
  select coalesce(nullif(s.dept, ''), p.dept, '') into v_dept
  from scores s left join players p using (player_id)
  where s.player_id = p_id and s.mode in ('career', 'daily') and s.created_at >= v_from and s.created_at < v_from + interval '7 days'
    and coalesce(nullif(s.dept, ''), p.dept, '') <> ''
  order by s.created_at desc limit 1;
  if v_dept is null then return; end if;
  select t.place, t.qualified into v_place, v_q from public.dept_tour(1) t where t.dept = v_dept;
  return query select (v_from at time zone 'Europe/Moscow')::date, v_dept, v_place,
    case when v_q and v_place = 1 then 15 when v_q and v_place = 2 then 10 when v_q and v_place = 3 then 5 else 0 end,
    exists (select 1 from dept_rewards r where r.player_id = p_id and r.week = (v_from at time zone 'Europe/Moscow')::date);
end $$;
revoke all on function public.my_dept_reward(uuid) from public, anon;
grant execute on function public.my_dept_reward(uuid) to authenticated;

-- Забрать награду за прошлую неделю: возвращает у.е. (15 / 10 / 5), 0 — нет награды или уже получена.
-- Повторный вызов ничего не даст: первичный ключ (player_id, week).
create or replace function public.claim_dept_reward(p_id uuid) returns integer
language plpgsql security definer set search_path = public as $$
declare r record; v int;
begin
  perform public.require_player(p_id);
  select * into r from public.my_dept_reward(p_id) limit 1;
  if not found or coalesce(r.amount, 0) = 0 or r.claimed then return 0; end if;
  insert into dept_rewards (player_id, week, dept, place, amount) values (p_id, r.week, r.dept, r.place, r.amount)
  on conflict (player_id, week) do nothing returning amount into v;
  return coalesce(v, 0);
end $$;
revoke all on function public.claim_dept_reward(uuid) from public, anon;
grant execute on function public.claim_dept_reward(uuid) to authenticated;

-- ====================== Пуш в воскресенье 18:00 по Москве ======================
-- «Ваш отдел на N-м месте — осталось 6 часов»: тот же push-send, новый вид рассылки kind = 'tour'
-- (функция push-send должна быть развёрнута с правкой из этого обновления).
-- 18:00 MSK = 15:00 UTC, воскресенье. Чтобы включить, раскомментируйте и выполните:
--
-- select cron.schedule('push-tour', '0 15 * * 0', $$select net.http_post(url := 'https://auequuxfcwdshblqrwbd.supabase.co/functions/v1/push-send', headers := '{"Content-Type": "application/json"}'::jsonb, body := jsonb_build_object('key', (select cron_key from public.push_keys where id = 1), 'kind', 'tour'))$$);
--
-- Проверить: select * from cron.job where jobname = 'push-tour';   Выключить: select cron.unschedule('push-tour');
-- Пробный запуск вручную (придёт всем подписчикам с отделом, сыгравшим на этой неделе):
-- select net.http_post(url := 'https://auequuxfcwdshblqrwbd.supabase.co/functions/v1/push-send', headers := '{"Content-Type": "application/json"}'::jsonb, body := jsonb_build_object('key', (select cron_key from public.push_keys where id = 1), 'kind', 'tour'));
