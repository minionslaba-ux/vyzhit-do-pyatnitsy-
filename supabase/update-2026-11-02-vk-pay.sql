-- Оплата у.е. голосами ВКонтакте в мини-приложении ВК (Edge Function vk-pay). Выполнить после update-2026-11-01-shop.sql.
-- Строки ВК пишет сразу оплаченными (status='paid') — по уведомлению order_status_change от ВК; игра забирает их той же
-- claim_purchases2(), что и покупки через Робокассу, так что функции зачисления не меняются.

-- Через что оплачено: 'robokassa' (сайт, Telegram), 'vk' — голоса ВК, 'vk_test' — тестовый режим платежей ВК
alter table public.purchases add column if not exists pay_via text not null default 'robokassa';
alter table public.purchases drop constraint if exists purchases_pay_via_check;
alter table public.purchases add constraint purchases_pay_via_check check (pay_via in ('robokassa', 'vk', 'vk_test'));
-- Номер заказа ВК (order_id): уникальный — повторное уведомление ВК не начислит у.е. второй раз
alter table public.purchases add column if not exists vk_order_id bigint;
create unique index if not exists purchases_vk_order_idx on public.purchases (vk_order_id) where vk_order_id is not null;
-- Цена в голосах ВК (для статистики; у Робокассы — null)
alter table public.purchases add column if not exists votes integer check (votes is null or votes > 0);
-- Покупки за голоса не имеют цены в рублях: rub может быть пустым (проверка rub > 0 остаётся для заполненных)
alter table public.purchases alter column rub drop not null;
-- Каждая покупка оплачена либо рублями, либо голосами
alter table public.purchases drop constraint if exists purchases_price_check;
alter table public.purchases add constraint purchases_price_check check (rub is not null or votes is not null);
