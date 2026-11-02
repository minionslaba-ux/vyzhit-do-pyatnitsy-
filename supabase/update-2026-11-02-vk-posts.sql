-- Автопостинг в группу ВКонтакте (tg-daily/vk.ts): одна запись на день по Москве — второй пост в тот же день не уходит.
create table if not exists public.vk_posts (
  day date primary key,
  post_id bigint,
  created_at timestamptz not null default now()
);
alter table public.vk_posts enable row level security;  -- политик нет: читает и пишет только сервер (service_role)
revoke all on public.vk_posts from anon, authenticated;
