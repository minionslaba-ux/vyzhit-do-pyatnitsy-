-- 2026-11-01: «Лента» офиса, реакции и подарки за у.е. (ещё НЕ применено — проверить и выполнить вручную).
-- Supabase → SQL Editor → New query → вставить всё → Run. Повторный запуск безопасен.
--
-- Что создаёт:
--   players.feed_off                — игрок скрыл себя из ленты (set_feed_off)
--   feed_latest(p_id, p_limit, p_before) — лента за 7 дней: события игроков из белого списка + реакции и подарки
--   reactions                      — бесплатные реакции 👍😂😢🔥: одна на запись от игрока (react, reactions_for)
--   gifts                          — платные подарки ☕🍩🌹🍾🏆💎 (send_gift, claim_gifts, gifts_received). У.е. списываются в игре
--                                    со счёта карьеры отправителя; получателю у.е. не переводятся (нет смысла фармить твинками)
--   messages.gift / gift_to, direct_messages.gift — подарок в чате или личке показывается большим пузырём
--   get_messages, dm_thread         — пересозданы: те же колонки + подарок
--   push_notify + триггер gift_push — пуш получателю подарка (функция push-event, kind = 'gift')
--   merge_player                    — переносит ещё и подарки и реакции; триггер на удаление игрока чистит их
--   players.prof_custom, set_prof_custom, report_title, is_bad_title — своя профессия с модерацией; participants,
--                                    leaderboard, daily_leaderboard отдают prof_custom (новая колонка в конце)

-- ====================== Лента ======================
alter table public.players add column if not exists feed_off boolean not null default false;

-- Не показывать меня в ленте (гость — по своему секретному id, зарегистрированный — только с токеном)
create or replace function public.set_feed_off(p_id uuid, p_off boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if public.is_registered(p_id) then perform public.require_player(p_id); end if;
  update players set feed_off = coalesce(p_off, false) where player_id = p_id;
end $$;

-- Какие события попадают в ленту (белый список). Тексты собирает игра на русском или английском
create or replace function public.feed_ok(p_kind text, p_mode text, p_won boolean, p_detail text) returns boolean
language sql immutable set search_path = public as $$
  select case p_kind
    when 'week_end'     then (p_won and p_mode in ('career', 'daily')) or (p_won = false and p_mode = 'career')  -- неделя закрыта / уволили
    when 'fired'        then true                                                                               -- уволили (с названием компании)
    when 'rank_up'      then p_detail ~ '^\d{1,2}$'                                                              -- повышение: номер должности
    when 'new_record'   then p_detail ~ '^\d{1,3}$'                                                              -- новый личный рекорд недели
    when 'hero_buy'     then coalesce(substring(p_detail from ':(\d{1,4})$')::int >= 40, false)                -- крупная покупка (машина, мотоцикл, лодка…)
    when 'pet_adopt'    then true
    when 'cert_end'     then p_detail ~ ':1$'                                                                    -- аттестация сдана
    when 'streak_claim'  then case when p_detail ~ '^\d{1,4}:' then split_part(p_detail, ':', 1)::int % 7 = 0 else false end                    -- серия 7, 14, 21… дней
    when 'break_record' then true                                                                               -- рекорд в мини-игре
    else false end
$$;

-- ====================== Реакции и подарки ======================
create table if not exists public.reactions (
  item_kind  text not null check (item_kind in ('feed', 'msg', 'dm')),
  item_id    bigint not null,
  player_id  uuid not null,
  emoji      text not null check (emoji in ('👍', '😂', '😢', '🔥')),
  created_at timestamptz not null default now(),
  primary key (item_kind, item_id, player_id)          -- одна реакция от игрока на запись
);
create index if not exists reactions_player_time_idx on public.reactions (player_id, created_at);

create table if not exists public.gifts (
  id          bigint generated always as identity primary key,
  from_player uuid not null,
  to_player   uuid not null,
  gift        text not null check (gift in ('coffee', 'donut', 'rose', 'champagne', 'trophy', 'diamond')),
  price       smallint not null check (price between 1 and 25),
  ref_kind    text not null default 'profile' check (ref_kind in ('feed', 'msg', 'dm', 'profile')),
  ref_id      bigint,
  created_at  timestamptz not null default now(),
  claimed_at  timestamptz,                             -- получатель увидел подарок в игре (и его герой порадовался)
  check (from_player <> to_player)
);
create index if not exists gifts_to_idx on public.gifts (to_player, claimed_at);
create index if not exists gifts_from_time_idx on public.gifts (from_player, created_at);
create index if not exists gifts_ref_idx on public.gifts (ref_kind, ref_id);

-- Напрямую таблицы не читаются и не пишутся — только через функции ниже
alter table public.reactions enable row level security;
alter table public.gifts enable row level security;
revoke all on public.reactions, public.gifts from anon, authenticated;

-- Лента за 7 дней. Имена и аватары — те же, что уже видны в рейтинге и «Участниках»; игроки с feed_off не показываются.
-- Одно событие одного вида от игрока в час (кто сыграл десять недель подряд, не забьёт всю ленту).
-- Проигранная неделя карьеры не дублирует событие fired (новая версия игры пишет оба).
create or replace function public.feed_latest(p_id uuid, p_limit int default 30, p_before bigint default null)
returns table (item_id bigint, kind text, mode text, won boolean, step smallint, detail text, created_at timestamptz,
               name text, avatar text, short_id text, is_me boolean, reactions jsonb, my_react text, gifts int)
language sql stable security definer set search_path = public as $$
  with ev as (
    select e.id, e.kind, e.mode, e.won, e.step, e.detail, e.created_at, e.player_id,
           row_number() over (partition by e.player_id, e.kind, coalesce(e.won, true), date_trunc('hour', e.created_at) order by e.id desc) as rn
    from events e join players p on p.player_id = e.player_id
    where e.kind in ('week_end', 'fired', 'rank_up', 'new_record', 'hero_buy', 'pet_adopt', 'cert_end', 'streak_claim', 'break_record')
      and e.created_at > now() - interval '7 days'
      and not p.feed_off
      and public.feed_ok(e.kind, e.mode, e.won, e.detail)
  ), pick as (
    select ev.* from ev
    where ev.rn = 1 and (p_before is null or ev.id < p_before)
      and not (ev.kind = 'week_end' and ev.won = false and exists (
        select 1 from events f where f.player_id = ev.player_id and f.kind = 'fired'
          and f.created_at between ev.created_at - interval '1 minute' and ev.created_at + interval '1 minute'))
    order by ev.id desc
    limit least(greatest(coalesce(p_limit, 30), 1), 60)
  )
  select k.id, k.kind, k.mode, k.won, k.step, k.detail, k.created_at,
    pl.name, pl.avatar, public.short_id(k.player_id), k.player_id = p_id,
    coalesce((select jsonb_object_agg(x.emoji, x.n) from (select r.emoji, count(*)::int as n from reactions r
              where r.item_kind = 'feed' and r.item_id = k.id group by r.emoji) x), '{}'::jsonb),
    (select r.emoji from reactions r where r.item_kind = 'feed' and r.item_id = k.id and r.player_id = p_id),
    (select count(*)::int from gifts g where g.ref_kind = 'feed' and g.ref_id = k.id)
  from pick k join players pl on pl.player_id = k.player_id
  order by k.id desc;
$$;

-- Подарок в чате / личке: большой пузырь «🎁 Лёва → Нина: 🍾». Скрыть и пожаловаться — как на обычное сообщение
alter table public.messages add column if not exists gift text, add column if not exists gift_to uuid;
alter table public.direct_messages add column if not exists gift text;

create or replace function public.gift_price(g text) returns int language sql immutable as $$
  select case g when 'coffee' then 1 when 'donut' then 2 when 'rose' then 3 when 'champagne' then 5 when 'trophy' then 10 when 'diamond' then 25 end
$$;
create or replace function public.gift_emoji(g text) returns text language sql immutable as $$
  select case g when 'coffee' then '☕' when 'donut' then '🍩' when 'rose' then '🌹' when 'champagne' then '🍾' when 'trophy' then '🏆' when 'diamond' then '💎' end
$$;

-- Чья это запись и видна ли она игроку: лента — событие из белого списка, чат — общий или своего офиса, личка — своя переписка.
-- null — записи нет или она не видна
create or replace function public.item_owner(p_id uuid, p_kind text, p_item bigint) returns uuid
language plpgsql stable security definer set search_path = public as $$
declare v uuid; v_team bigint;
begin
  if p_kind = 'feed' then
    select e.player_id into v from events e join players p on p.player_id = e.player_id
      where e.id = p_item and not p.feed_off and e.created_at > now() - interval '8 days' and public.feed_ok(e.kind, e.mode, e.won, e.detail);
  elsif p_kind = 'msg' then
    select tm.team_id into v_team from team_members tm where tm.player_id = p_id;
    select m.player_id into v from messages m where m.id = p_item and not m.hidden and (m.channel = 'global' or m.channel = 'team:' || v_team);
  elsif p_kind = 'dm' then
    select case when d.from_player = p_id then d.to_player else d.from_player end into v
      from direct_messages d where d.id = p_item and (d.from_player = p_id or d.to_player = p_id);
    -- в личке реагируют на сообщение собеседника, подарок уходит собеседнику
  end if;
  return v;
end $$;

-- Реакция: та же ещё раз (или null) — снять; другая — заменить. Возвращает итоговую реакцию игрока
create or replace function public.react(p_id uuid, p_kind text, p_item bigint, p_emoji text) returns text
language plpgsql security definer set search_path = public as $$
begin
  perform public.require_player(p_id);
  if p_emoji is not null and p_emoji not in ('👍', '😂', '😢', '🔥') then raise exception 'Такой реакции нет'; end if;
  if public.item_owner(p_id, p_kind, p_item) is null then raise exception 'Запись не найдена'; end if;
  if (select count(*) from reactions r where r.player_id = p_id and r.created_at > now() - interval '1 minute') >= 40 then
    raise exception 'Не так быстро: подождите минутку';
  end if;
  if p_emoji is null or exists (select 1 from reactions r where r.item_kind = p_kind and r.item_id = p_item and r.player_id = p_id and r.emoji = p_emoji) then
    delete from reactions r where r.item_kind = p_kind and r.item_id = p_item and r.player_id = p_id;
    return null;
  end if;
  insert into reactions (item_kind, item_id, player_id, emoji) values (p_kind, p_item, p_id, p_emoji)
    on conflict (item_kind, item_id, player_id) do update set emoji = excluded.emoji, created_at = now();
  return p_emoji;
end $$;

-- Реакции и число подарков для списка записей (чат, личка, лента). Подарки — строкой с emoji '🎁'
create or replace function public.reactions_for(p_id uuid, p_kind text, p_ids bigint[])
returns table (item_id bigint, emoji text, n int, mine boolean)
language plpgsql stable security definer set search_path = public as $$
declare v_ids bigint[];
begin
  if p_kind not in ('feed', 'msg', 'dm') then return; end if;
  if p_kind <> 'feed' then perform public.require_player(p_id); end if;
  v_ids := (select array_agg(x) from (select unnest(p_ids) as x limit 100) s);
  if p_kind <> 'feed' then  -- чужие чаты и переписки не раскрываем
    v_ids := (select array_agg(x) from unnest(v_ids) as x where public.item_owner(p_id, p_kind, x) is not null);
  end if;
  return query
    select r.item_id, r.emoji, count(*)::int, bool_or(r.player_id = p_id)
    from reactions r where r.item_kind = p_kind and r.item_id = any(v_ids) group by r.item_id, r.emoji
    union all
    select g.ref_id, '🎁'::text, count(*)::int, bool_or(g.from_player = p_id)
    from gifts g where g.ref_kind = p_kind and g.ref_id = any(v_ids) group by g.ref_id;
end $$;

-- Подарить. Получатель — автор записи (лента, чат, личка) или игрок по короткому ID (profile).
-- Себе нельзя; не больше 30 подарков в час от игрока и 10 в час одному получателю.
-- В ленте и чате подарок появляется сообщением-пузырём (лента → общий чат, чат → тот же чат), в личке — сообщением в переписке.
create or replace function public.send_gift(p_id uuid, p_to text, p_gift text, p_ref_kind text, p_ref_id bigint) returns text
language plpgsql security definer set search_path = public as $$
declare v_to uuid; v_name text; v_price int := public.gift_price(p_gift); v_ch text; v_kind text := coalesce(p_ref_kind, 'profile');
begin
  perform public.require_player(p_id);
  if not exists (select 1 from players where player_id = p_id) then raise exception 'Сначала войдите в игру'; end if;
  if v_price is null then raise exception 'Такого подарка нет'; end if;
  if v_kind not in ('feed', 'msg', 'dm', 'profile') then raise exception 'Неизвестно, к чему подарок'; end if;
  if v_kind = 'profile' then
    select pl.player_id into v_to from players pl where public.short_id(pl.player_id) = upper(trim(p_to)) limit 1;
  else
    v_to := public.item_owner(p_id, v_kind, p_ref_id);
  end if;
  if v_to is null then raise exception 'Получатель не найден'; end if;
  if v_to = p_id then raise exception 'Себе дарить нельзя — порадуйте коллегу'; end if;
  if (select count(*) from gifts g where g.from_player = p_id and g.created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Слишком много подарков за час — щедрость тоже должна отдыхать';
  end if;
  if (select count(*) from gifts g where g.from_player = p_id and g.to_player = v_to and g.created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Этому игроку вы уже много подарили за час';
  end if;
  select pl.name into v_name from players pl where pl.player_id = v_to;
  insert into gifts (from_player, to_player, gift, price, ref_kind, ref_id) values (p_id, v_to, p_gift, v_price, v_kind, case when v_kind = 'profile' then null else p_ref_id end);
  if v_kind in ('feed', 'msg') then
    v_ch := case when v_kind = 'msg' then (select m.channel from messages m where m.id = p_ref_id) else 'global' end;
    insert into messages (channel, player_id, text, gift, gift_to)
      values (coalesce(v_ch, 'global'), p_id, '🎁 → ' || left(coalesce(v_name, 'Игрок'), 24) || ': ' || public.gift_emoji(p_gift), p_gift, v_to);
  elsif v_kind = 'dm' then
    insert into direct_messages (from_player, to_player, text, gift) values (p_id, v_to, '🎁 ' || public.gift_emoji(p_gift), p_gift);
  end if;
  return coalesce(v_name, 'Игрок');
end $$;

-- Новые подарки мне: игра показывает «Вам подарок от …», радует героя и отмечает их полученными (один раз)
create or replace function public.claim_gifts(p_id uuid) returns table (gift_id bigint, gift_code text, from_name text, from_avatar text, sent_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if public.is_registered(p_id) then perform public.require_player(p_id); end if;
  return query
    with c as (update gifts g set claimed_at = now() where g.to_player = p_id and g.claimed_at is null returning g.id, g.gift, g.from_player, g.created_at)
    select c.id, c.gift, coalesce(p.name, 'Игрок'), coalesce(p.avatar, ''), c.created_at
    from c left join players p on p.player_id = c.from_player order by c.id limit 50;
end $$;

-- Полка «Подарки» в профиле: сколько каких подарков и от кого последний
create or replace function public.gifts_received(p_id uuid) returns table (gift_code text, n int, last_from text, last_at timestamptz)
language sql stable security definer set search_path = public as $$
  select g.gift, count(*)::int, (array_agg(coalesce(p.name, 'Игрок') order by g.id desc))[1], max(g.created_at)
  from gifts g left join players p on p.player_id = g.from_player
  where g.to_player = p_id and (p_id = auth.uid() or not public.is_registered(p_id))
  group by g.gift;
$$;

-- ====================== Чат и личка: подарок в сообщении ======================
drop function if exists public.get_messages(uuid, text);
create function public.get_messages(p_id uuid, p_channel text)
returns table (msg_id bigint, name text, avatar text, short_id text, dept text, msg text, sent_at timestamptz, mine boolean, can_hide boolean, gift text, gift_to text)
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
    select m.id, coalesce(pl.name, 'Игрок'), coalesce(pl.avatar, ''), public.short_id(m.player_id), coalesce(pl.dept, ''), m.text, m.created_at, m.player_id = p_id,
      m.player_id = p_id or exists (select 1 from teams t where 'team:' || t.id = v_ch and t.owner = p_id),
      m.gift, case when m.gift_to is null then null else coalesce(gp.name, 'Игрок') end
    from messages m left join players pl on pl.player_id = m.player_id left join players gp on gp.player_id = m.gift_to
    where m.channel = v_ch and not m.hidden order by m.id desc limit 60;
end $$;

drop function if exists public.dm_thread(uuid, text);
create function public.dm_thread(p_id uuid, p_with text) returns table (msg_id bigint, mine boolean, msg text, sent_at timestamptz, gift text)
language plpgsql security definer set search_path = public as $$
declare v_with uuid;
begin
  perform public.require_player(p_id);
  select pl.player_id into v_with from players pl where public.short_id(pl.player_id) = upper(trim(p_with)) limit 1;
  if v_with is null then return; end if;
  update direct_messages set read_at = now() where to_player = p_id and from_player = v_with and read_at is null;
  return query select d.id, d.from_player = p_id, d.text, d.created_at, d.gift from direct_messages d
    where (d.from_player = p_id and d.to_player = v_with) or (d.from_player = v_with and d.to_player = p_id)
    order by d.id desc limit 60;
end $$;

-- ====================== Пуш о подарке ======================
-- Та же функция push_notify: для подарков — kind 'gift'. Подарок в личке не дублируем: о нём уже скажет пуш о сообщении
create or replace function public.push_notify() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_argv[0] = 'gift' then
    if new.ref_kind = 'dm' then return new; end if;
  end if;
  if exists (select 1 from push_subs where player_id = new.to_player) then
    perform net.http_post(
      url := 'https://auequuxfcwdshblqrwbd.supabase.co/functions/v1/push-event',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object('key', (select cron_key from push_keys where id = 1), 'kind', tg_argv[0], 'id', new.id));
  end if;
  return new;
end $$;
revoke all on function public.push_notify() from public, anon, authenticated;
drop trigger if exists gift_push on public.gifts;
create trigger gift_push after insert on public.gifts for each row execute function public.push_notify('gift');

-- ====================== Перенос гостя в аккаунт и удаление ======================
-- То же, что в schema.sql, плюс подарки и реакции
create or replace function public.merge_player(p_from uuid, p_to uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or auth.uid() <> p_to then raise exception 'Нужен вход по почте'; end if;
  if p_from = p_to then return; end if;
  update scores set player_id = p_to where player_id = p_from;
  update suggestions set player_id = p_to where player_id = p_from;
  update messages set player_id = p_to where player_id = p_from;
  update direct_messages set from_player = p_to where from_player = p_from;
  update direct_messages set to_player = p_to where to_player = p_from;
  update invites set to_player = p_to where to_player = p_from;
  update invites set from_player = p_to where from_player = p_from;
  update teams set owner = p_to where owner = p_from;
  delete from gifts where (from_player = p_from and to_player = p_to) or (from_player = p_to and to_player = p_from);
  update gifts set from_player = p_to where from_player = p_from;
  update gifts set to_player = p_to where to_player = p_from;
  delete from reactions r where r.player_id = p_from
    and exists (select 1 from reactions x where x.player_id = p_to and x.item_kind = r.item_kind and x.item_id = r.item_id);
  update reactions set player_id = p_to where player_id = p_from;
  if exists (select 1 from team_members where player_id = p_to) then delete from team_members where player_id = p_from;
  else update team_members set player_id = p_to where player_id = p_from; end if;
  if exists (select 1 from players where player_id = p_to) then delete from players where player_id = p_from;
  else update players set player_id = p_to where player_id = p_from; end if;
end $$;

-- Игрока удалили (purge_player при удалении аккаунта) — его подарки и реакции тоже
create or replace function public.purge_social() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from gifts where from_player = old.player_id or to_player = old.player_id;
  delete from reactions where player_id = old.player_id;
  return old;
end $$;
revoke all on function public.purge_social() from public, anon, authenticated;
drop trigger if exists players_purge_social on public.players;
create trigger players_purge_social after delete on public.players for each row execute function public.purge_social();

-- ====================== Своя профессия (prof_custom) ======================
-- Игрок пишет название профессии сам (prefs.profCustom в игре). Видно другим в «Участниках», рейтинге и «Сейчас в игре».
-- Модерация: мат и оскорбления (рус. и англ.), ссылки, почта, телефоны (5+ цифр) — название не принимается.
-- Три жалобы от разных игроков — название стирается.
alter table public.players add column if not exists prof_custom text check (char_length(prof_custom) <= 28);

create or replace function public.is_bad_title(t text) returns boolean language sql immutable set search_path = public as $$
  select t is not null and (
    public.is_rude(t)
    or translate(lower(t), 'aeopcxyk3ёz', 'аеорсхукзез') ~ (
      '(^|[^а-яё])(х[уy][йеёияю]|пи[зс]д|[её]б[аеиоуыл]|[её]п[аот]н|бля|муд[аоие]к|сук[аи]|сучк|г[оа]ндон|залуп|пид[оа]р|педик|шлюх|долбо|дебил|идиот|урод|чмо|даун|ублюд|мраз|твар|гнид|жоп|срак|дерьм|говн)')
    or lower(t) ~ '(f+u+c+k|sh[i1]t|b[i1]tch|cunt|n[i1]gg|wh[o0]re|slut|dick|cock(?!tail)|puss(y|ies)|fag|retard|idiot|moron|asshole|bastard|motherf|wank)'
    or lower(t) ~ '(https?:|www\.|\.(ru|com|net|org|io|me|рф|su|xyz|top)(\W|$)|t\.me|@|telegram|vk\.com|whats ?app)'
    or char_length(regexp_replace(t, '\D', '', 'g')) >= 5
  )
$$;

-- Сохранить своё название профессии. Возвращает принятое название; null — пусто или не прошло модерацию (тогда стирается)
create or replace function public.set_prof_custom(p_id uuid, p_title text) returns text
language plpgsql security definer set search_path = public as $$
declare v text := left(btrim(regexp_replace(regexp_replace(regexp_replace(coalesce(p_title, ''), '<[^>]*>', '', 'g'), '[<>"`\\]', '', 'g'), '\s+', ' ', 'g')), 28);
begin
  if public.is_registered(p_id) then perform public.require_player(p_id); end if;
  if v = '' or public.is_bad_title(v) then v := null; end if;
  update players set prof_custom = v where player_id = p_id;
  if v is not null then delete from title_reports where target = p_id; end if;
  return v;
end $$;

create table if not exists public.title_reports (
  target     uuid not null,
  reporter   uuid not null,
  created_at timestamptz not null default now(),
  primary key (target, reporter)
);
alter table public.title_reports enable row level security;
revoke all on public.title_reports from anon, authenticated;

-- Пожаловаться на название профессии игрока (по короткому ID): после трёх жалоб оно стирается
create or replace function public.report_title(p_id uuid, p_short text) returns void
language plpgsql security definer set search_path = public as $$
declare v uuid;
begin
  perform public.require_player(p_id);
  select pl.player_id into v from players pl where public.short_id(pl.player_id) = upper(trim(p_short)) and pl.prof_custom is not null limit 1;
  if v is null or v = p_id then return; end if;
  insert into title_reports (target, reporter) values (v, p_id) on conflict do nothing;
  if (select count(*) from title_reports r where r.target = v) >= 3 then
    update players set prof_custom = null where player_id = v;
    delete from title_reports where target = v;
  end if;
end $$;

-- Представления для «Участников», «Сейчас в игре» и рейтинга: те же колонки + prof_custom в конце
create or replace view public.participants as
select
  encode(sha256(p.player_id::text::bytea), 'hex') as tag, upper(left(encode(sha256(p.player_id::text::bytea), 'hex'), 6)) as short_id,
  p.name, p.dept, p.avatar, p.prof, p.status, p.step, p.created_at, p.updated_at,
  coalesce(g.games, 0) as games, coalesce(g.wins, 0) as wins,
  b.won as best_won, b.step as best_step, b.total as best_total,
  p.desk, p.rank, p.prof_custom
from public.players p
left join (select player_id, count(*) as games, count(*) filter (where won) as wins from public.scores group by player_id) g using (player_id)
left join lateral (select won, step, total from public.scores s where s.player_id = p.player_id
                   order by won desc, step desc, total desc limit 1) b on true;

create or replace view public.leaderboard as
select distinct on (s.player_id)
  encode(sha256(s.player_id::text::bytea), 'hex') as tag,
  coalesce(p.name, s.name) as name, coalesce(p.dept, s.dept) as dept, coalesce(p.avatar, '') as avatar,
  s.prof, s.won, s.step, s.total, s.death, s.created_at, p.prof_custom
from public.scores s left join public.players p using (player_id)
where s.mode = 'career'
order by s.player_id, s.won desc, s.step desc, s.total desc, s.created_at asc;

create or replace view public.daily_leaderboard as
select distinct on (s.day, s.player_id)
  s.day, encode(sha256(s.player_id::text::bytea), 'hex') as tag,
  coalesce(p.name, s.name) as name, coalesce(p.dept, s.dept) as dept, coalesce(p.avatar, '') as avatar,
  s.won, s.step, s.total, s.death, s.created_at, p.prof_custom
from public.scores s left join public.players p using (player_id)
where s.mode = 'daily' and s.day is not null
order by s.day, s.player_id, s.created_at asc;
grant select on public.participants, public.leaderboard, public.daily_leaderboard to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.participants, public.leaderboard, public.daily_leaderboard from anon, authenticated;

-- ====================== Доступы ======================
do $$
declare f text;
begin
  foreach f in array array['set_feed_off(uuid,boolean)', 'feed_latest(uuid,integer,bigint)', 'react(uuid,text,bigint,text)', 'reactions_for(uuid,text,bigint[])',
    'send_gift(uuid,text,text,text,bigint)', 'claim_gifts(uuid)', 'set_prof_custom(uuid,text)', 'report_title(uuid,text)', 'gifts_received(uuid)', 'get_messages(uuid,text)', 'dm_thread(uuid,text)', 'merge_player(uuid,uuid)'] loop
    execute format('revoke all on function public.%s from public', f);
    execute format('grant execute on function public.%s to anon, authenticated', f);
  end loop;
end $$;
-- служебные — только для функций выше
revoke all on function public.item_owner(uuid,text,bigint) from public, anon, authenticated;
revoke all on function public.feed_ok(text,text,boolean,text) from public, anon, authenticated;

notify pgrst, 'reload schema';

-- Проверка: должны вернуться 11 строк
select routine_name from information_schema.routines where routine_schema = 'public' and routine_name in
  ('set_feed_off', 'feed_latest', 'react', 'reactions_for', 'send_gift', 'claim_gifts', 'gifts_received', 'item_owner', 'feed_ok', 'set_prof_custom', 'report_title');
