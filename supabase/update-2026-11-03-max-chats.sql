-- Каналы и чаты MAX, куда добавлен бот игры (команда /maxsetup в боте Telegram забирает события bot_added из MAX API).
-- В каналы ежедневно уходит тот же пост, что в группу ВК (tg-daily/max.ts). Только для сервера (service role).
create table if not exists public.max_chats (
  chat_id    bigint primary key,
  is_channel boolean not null default false,
  title      text,
  enabled    boolean not null default true,
  added_at   timestamptz not null default now(),
  last_post  timestamptz
);
alter table public.max_chats enable row level security;
