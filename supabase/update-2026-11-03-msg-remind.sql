-- Напоминания в мессенджерах, где нет веб-пушей: уведомления мини-приложения ВК и сообщения бота MAX.
-- Включает/выключает игрок в игре (Edge Function msg-remind проверяет подпись площадки), раз в день шлёт tg-daily (remind.ts).
-- Только для сервера (service role), RLS без политик.
create table if not exists public.msg_remind (
  via        text not null check (via in ('vk', 'max')),
  uid        bigint not null,            -- vk_user_id / user_id в MAX
  player_id  uuid,                       -- аккаунт игры (если вошёл)
  lang       text not null default 'ru',
  enabled    boolean not null default true,
  last_sent  date,
  sent       int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (via, uid)
);
create index if not exists msg_remind_due_idx on public.msg_remind (via, last_sent) where enabled;
alter table public.msg_remind enable row level security;
