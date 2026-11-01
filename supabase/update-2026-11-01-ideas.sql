-- Идеи владельца из бота (/idea): ночной разбор Claude (scheduled task 03:17 МСК), отчёт — функция tg-notify.
create table if not exists public.dev_ideas (
  id bigserial primary key,
  tg_id bigint not null,
  text text not null check (length(text) between 2 and 3000),
  status text not null default 'new' check (status in ('new','in_progress','done','skipped','question')),
  reply text,
  commit text,
  created_at timestamptz not null default now(),
  done_at timestamptz
);
alter table public.dev_ideas enable row level security;
revoke all on public.dev_ideas from anon, authenticated;
