-- Покупки на Пикабу Играх («Выжить до пятницы», страница survivefriday.com/pikabu/): одна покупка — одна строка.
-- Пишет только функция pikabu-verify (service_role) после проверки подписи ключом PIKABU_SECRET; игрокам доступа нет.
create table if not exists public.pikabu_purchases (
  purchase_id text primary key,
  product_id  text not null,
  player_id   text not null default '',
  consumable  boolean not null default false,
  test        boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.pikabu_purchases enable row level security;
revoke all on public.pikabu_purchases from anon, authenticated;
