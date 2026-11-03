-- Облачное сохранение прогресса (js/cloud.js) и вход в свой аккаунт кодом с другого устройства/площадки (tg-login: action link_code, code).
-- Правила VK Mini Apps 2.3.8: прогресс должен совпадать между версиями (компьютер/телефон).

-- 1) Прогресс: одна запись на аккаунт. score — насколько далеко карьера (уровень, неделя), чтобы выбрать, чья версия новее.
create table if not exists public.player_saves (
  player_id  uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  score      bigint not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.player_saves enable row level security;  -- только через функции ниже

create or replace function public.save_progress(p_data jsonb, p_score bigint)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare t timestamptz := now();
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' then raise exception 'bad data'; end if;
  if octet_length(p_data::text) > 400000 then raise exception 'too big'; end if;
  insert into player_saves (player_id, data, score, updated_at) values (auth.uid(), p_data, greatest(0, coalesce(p_score, 0)), t)
  on conflict (player_id) do update set data = excluded.data, score = excluded.score, updated_at = t;
  return t;
end $$;

create or replace function public.load_progress()
returns table (data jsonb, score bigint, updated_at timestamptz) language sql security definer set search_path = public stable as $$
  select s.data, s.score, s.updated_at from player_saves s where s.player_id = auth.uid();
$$;

revoke all on function public.save_progress(jsonb, bigint) from public, anon;
revoke all on function public.load_progress() from public, anon;
grant execute on function public.save_progress(jsonb, bigint) to authenticated;
grant execute on function public.load_progress() to authenticated;

-- 2) Коды входа: 8 символов, 10 минут, одноразовые. Пишет и читает только сервер (tg-login, service role).
create table if not exists public.link_codes (
  code       text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  used_at    timestamptz
);
create index if not exists link_codes_user_idx on public.link_codes (user_id, created_at desc);
alter table public.link_codes enable row level security;
