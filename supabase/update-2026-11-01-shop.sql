-- Магазин: Стартовый набор и «Кофе разработчикам» за рубли, бонус +50% к первому пополнению.
-- Выполнить после update-2026-10-31-robokassa.sql. Обратная совместимость: старая claim_purchases() по-прежнему
-- возвращает число у.е., но забирает только обычные пополнения (product is null) — Стартовый набор она не тронет,
-- чтобы старый клиент из кеша не «съел» набор без питомца, темы и подсказок. Новый клиент вызывает claim_purchases2().

-- product — что куплено: null — обычное пополнение у.е., 'starter' — Стартовый набор (один раз на аккаунт),
-- 'coffee' — «Кофе разработчикам» (значок «Меценат» + 10 у.е., можно много раз)
alter table public.purchases add column if not exists product text;
-- bonus — подарочные у.е. сверх оплаченных (+50% к первому пополнению), зачисляются вместе с ue
alter table public.purchases add column if not exists bonus integer not null default 0;
alter table public.purchases drop constraint if exists purchases_product_check;
alter table public.purchases add constraint purchases_product_check check (product is null or product in ('starter', 'coffee'));
alter table public.purchases drop constraint if exists purchases_bonus_check;
alter table public.purchases add constraint purchases_bonus_check check (bonus between 0 and 250);
-- Второй Стартовый набор robokassa-pay не продаёт (проверяет оплаченные). Если два счёта оплатили одновременно —
-- зачисляются оба: игрок заплатил дважды и получает у.е. дважды (питомец и тема по купону — один раз, это решает клиент).
create index if not exists purchases_product_idx on public.purchases (player_id, product) where product is not null;

-- Старая функция: только обычные пополнения, у.е. + бонус
create or replace function public.claim_purchases() returns integer
language plpgsql security definer set search_path = public as $$
declare v integer;
begin
  if auth.uid() is null then return 0; end if;
  with c as (update purchases set claimed_at = now()
             where player_id = auth.uid() and status = 'paid' and claimed_at is null and product is null
             returning ue + bonus as n)
  select coalesce(sum(n), 0) into v from c;
  return v;
end $$;
revoke all on function public.claim_purchases() from public, anon;
grant execute on function public.claim_purchases() to authenticated;

-- Новая функция: все оплаченные и ещё не зачисленные покупки списком [{inv, ue, bonus, product}]
create or replace function public.claim_purchases2() returns json
language plpgsql security definer set search_path = public as $$
declare v json;
begin
  if auth.uid() is null then return '[]'::json; end if;
  with c as (update purchases set claimed_at = now()
             where player_id = auth.uid() and status = 'paid' and claimed_at is null
             returning inv_id, ue, bonus, product)
  select coalesce(json_agg(json_build_object('inv', inv_id, 'ue', ue, 'bonus', bonus, 'product', product) order by inv_id), '[]'::json) into v from c;
  return v;
end $$;
revoke all on function public.claim_purchases2() from public, anon;
grant execute on function public.claim_purchases2() to authenticated;
