-- Ежедневный пост о «Мутации» (игра владельца) в группы Telegram и каналы MAX в 13:00 МСК (10:00 UTC).
-- tg-daily {cross_daily: 'mutaciya'} → data/bot/cross_daily_mutaciya.json; повтор за день не отправится (cross_promo_posts).
select cron.unschedule('cross-mutaciya') where exists (select 1 from cron.job where jobname = 'cross-mutaciya');
select cron.schedule('cross-mutaciya', '0 10 * * *',
  $$select net.http_post(url := 'https://auequuxfcwdshblqrwbd.supabase.co/functions/v1/tg-daily', headers := '{"Content-Type": "application/json"}'::jsonb, body := '{"cross_daily": "mutaciya"}'::jsonb, timeout_milliseconds := 60000)$$);
-- сегодня (10.11) стартовый пост уже ушёл разово — серия начинается с 11.11
insert into public.cross_promo_posts(day, slug) values ('2026-11-10', 'mutaciya') on conflict do nothing;
