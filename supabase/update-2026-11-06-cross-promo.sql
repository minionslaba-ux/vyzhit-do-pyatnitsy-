-- Перекрёстный обмен игроками: раз в день пост о другой игре владельца в группах Telegram и канале MAX (tg-daily/cross.ts,
-- тексты — data/bot/cross_promo.json). Отметка дня — чтобы повторный вызов tg-daily не задвоил пост. Только сервер (RLS без политик).
create table if not exists public.cross_promo_posts (
  day        date not null,
  slug       text not null,
  tg_groups  int not null default 0,
  max_chats  int not null default 0,
  created_at timestamptz not null default now(),
  primary key (day, slug)
);
alter table public.cross_promo_posts enable row level security;
