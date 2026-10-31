-- Пуш-уведомления браузера (уже применено в проекте Supabase). Функции push-subscribe / push-send — ещё НЕ развёрнуты.
create table if not exists public.push_subs (
  endpoint   text primary key check (endpoint ~ '^https://' and char_length(endpoint) < 1000),
  p256dh     text not null,
  auth       text not null,
  player_id  uuid,
  lang       text default 'ru',
  created_at timestamptz not null default now(),
  last_sent  timestamptz,
  sent       integer not null default 0
);
alter table public.push_subs enable row level security;
revoke all on public.push_subs from anon, authenticated;

create table if not exists public.push_keys (
  id       smallint primary key default 1 check (id = 1),
  pub      text not null,
  priv     text not null,
  cron_key text not null default encode(gen_random_bytes(24), 'hex')
);
alter table public.push_keys enable row level security;
revoke all on public.push_keys from anon, authenticated;
