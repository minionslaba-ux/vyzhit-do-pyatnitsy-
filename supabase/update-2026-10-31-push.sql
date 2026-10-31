-- Пуш-уведомления браузера (уже применено в проекте Supabase). Функции push-subscribe и push-send развёрнуты.
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

-- Расписание рассылки (UTC): 06:40, 10:40, 16:40 = 09:40, 13:40, 19:40 по Москве. Ключ запуска берётся из закрытой таблицы.
select cron.schedule('push-morning', '40 6 * * *', $$select net.http_post(url := 'https://auequuxfcwdshblqrwbd.supabase.co/functions/v1/push-send', headers := '{"Content-Type": "application/json"}'::jsonb, body := jsonb_build_object('key', (select cron_key from public.push_keys where id = 1)))$$);
select cron.schedule('push-day', '40 10 * * *', $$select net.http_post(url := 'https://auequuxfcwdshblqrwbd.supabase.co/functions/v1/push-send', headers := '{"Content-Type": "application/json"}'::jsonb, body := jsonb_build_object('key', (select cron_key from public.push_keys where id = 1)))$$);
select cron.schedule('push-evening', '40 16 * * *', $$select net.http_post(url := 'https://auequuxfcwdshblqrwbd.supabase.co/functions/v1/push-send', headers := '{"Content-Type": "application/json"}'::jsonb, body := jsonb_build_object('key', (select cron_key from public.push_keys where id = 1)))$$);
