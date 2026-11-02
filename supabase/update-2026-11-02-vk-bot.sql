-- Бот в сообщениях группы ВК (supabase/functions/vk-bot): когда человеку последний раз показывали меню на непонятное сообщение
-- (не чаще раза в 12 часов — чтобы бот не вмешивался в переписку с живыми людьми). Только сервер.
create table if not exists public.vk_bot_seen (
  user_id bigint primary key,
  last_menu timestamptz not null default now()
);
alter table public.vk_bot_seen enable row level security;
revoke all on public.vk_bot_seen from anon, authenticated;
