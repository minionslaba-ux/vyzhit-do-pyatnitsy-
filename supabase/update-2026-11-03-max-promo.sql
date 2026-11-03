-- Посты о канале игры в MAX раз в 3 дня (tg-daily/promo.ts): отметка дня, чтобы повторный вызов tg-daily не задвоил пост.
-- Только для сервера (service role), RLS без политик.
create table if not exists public.max_promo_posts (
  day        date primary key,
  tg_groups  int not null default 0,
  vk_post_id bigint,
  created_at timestamptz not null default now()
);
alter table public.max_promo_posts enable row level security;
