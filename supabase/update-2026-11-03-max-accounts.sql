-- Вход через мини-приложение MAX (tg-login, max_init): аккаунт MAX ↔ пользователь Supabase Auth, как tg_accounts / vk_accounts.
create table if not exists public.max_accounts (
  max_id     bigint primary key,
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  name       text,
  username   text,
  created_at timestamptz not null default now()
);
alter table public.max_accounts enable row level security;  -- только сервер (service role)
