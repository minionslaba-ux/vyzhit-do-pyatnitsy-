-- Покупки у.е. через Робокассу. Строку создаёт robokassa-pay (игрок вошёл в аккаунт), оплату подтверждает robokassa-result
-- (Result URL, подпись Паролем №2), игра забирает оплаченные у.е. на счёт карьеры через claim_purchases.
create table if not exists public.purchases (
  inv_id     bigint generated always as identity primary key,   -- номер счёта InvId в Робокассе
  player_id  uuid not null,
  ue         integer not null check (ue between 1 and 500),
  rub        integer not null check (rub > 0),
  status     text not null default 'new' check (status in ('new', 'paid')),
  created_at timestamptz not null default now(),
  paid_at    timestamptz,
  claimed_at timestamptz
);
create index if not exists purchases_player_idx on public.purchases (player_id, status, claimed_at);
alter table public.purchases enable row level security;  -- напрямую ни anon, ни authenticated не читают и не пишут

-- Игрок забирает оплаченные, ещё не зачисленные у.е. (один раз: claimed_at)
create or replace function public.claim_purchases() returns integer
language plpgsql security definer set search_path = public as $$
declare v integer;
begin
  if auth.uid() is null then return 0; end if;
  with c as (update purchases set claimed_at = now() where player_id = auth.uid() and status = 'paid' and claimed_at is null returning ue)
  select coalesce(sum(ue), 0) into v from c;
  return v;
end $$;
revoke all on function public.claim_purchases() from public, anon;
grant execute on function public.claim_purchases() to authenticated;
