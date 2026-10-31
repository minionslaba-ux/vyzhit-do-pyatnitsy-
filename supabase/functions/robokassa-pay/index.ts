// Робокасса: создать счёт на покупку у.е. и вернуть ссылку на оплату.
// Цена считается здесь, на сервере (как на странице «Цены»): 1–9 у.е. — 100 ₽, 10+ — 90, 25+ — 80, 50+ — 70, 100+ — 60 за 1 у.е.
// Подпись — MD5(MerchantLogin:OutSum:InvId:Пароль№1). Пароли — только в секретах Supabase:
// ROBOKASSA_PASS1, ROBOKASSA_PASS2 (идентификатор магазина не секрет: survivefriday.com); ROBOKASSA_TEST=1 — тестовый режим (тогда в PASS1/PASS2 — тестовые пароли).
// Товары с фиксированной ценой ({ product: 'starter' }): Стартовый набор — 149 ₽ за 30 у.е. (+ питомец, тема и подсказки
// выдаёт игра при зачислении), один раз на аккаунт; «Кофе разработчикам» — 100 ₽ за значок «Меценат» и 10 у.е., без ограничений. Первое обычное пополнение — +50% у.е. в подарок (колонка bonus).
// Нужна миграция supabase/update-2026-11-01-shop.sql (колонки product и bonus, функция claim_purchases2).
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHash } from 'node:crypto';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const TIERS = [[1, 100], [10, 90], [25, 80], [50, 70], [100, 60]];
const perUe = (n: number) => TIERS.reduce((p, [from, price]) => n >= from ? price : p, 100);
const md5 = (s: string) => createHash('md5').update(s).digest('hex');
const PRODUCTS: Record<string, { ue: number; rub: number; title: string }> = {
  starter: { ue: 30, rub: 149, title: 'Стартовый набор «Выжить до пятницы»: 30 у.е. и подарки' },
  // цифровой товар (не пожертвование): значок «☕ Меценат» в профиле + 10 у.е.; можно покупать сколько угодно раз
  coffee: { ue: 10, rub: 100, title: 'Кофе разработчикам: значок «Меценат» и 10 у.е. в «Выжить до пятницы»' },
};
const FIRST_BONUS = 0.5;  // +50% у.е. к первому оплаченному пополнению

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const login = Deno.env.get('ROBOKASSA_LOGIN') || 'survivefriday.com', pass1 = Deno.env.get('ROBOKASSA_PASS1');
    if (!login || !pass1) return json({ error: 'not_configured' }, 503);
    const { access_token, ue, email, product } = await req.json();
    const prod = typeof product === 'string' && product ? PRODUCTS[product] : null;
    if (product && !prod) return json({ error: 'bad_product' }, 400);
    const n = prod ? prod.ue : Math.floor(Number(ue));
    if (!(n >= 1 && n <= 500)) return json({ error: 'bad_amount' }, 400);
    const url = Deno.env.get('SUPABASE_URL')!, db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
    if (typeof access_token !== 'string' || !access_token) return json({ error: 'no_session' }, 401);
    const { data: { user } } = await db.auth.getUser(access_token);
    if (!user) return json({ error: 'bad_session' }, 401);
    // оплаченные покупки игрока: Стартовый набор — только один раз, бонус — только к самому первому пополнению
    const { data: paid, error: pErr } = await db.from('purchases').select('inv_id, product').eq('player_id', user.id).eq('status', 'paid').limit(50);
    if (pErr) return json({ error: pErr.message }, 500);
    if (prod && product === 'starter' && (paid || []).some(p => p.product === 'starter')) return json({ error: 'starter_taken' }, 409);
    const bonus = !prod && !(paid || []).length ? Math.min(250, Math.ceil(n * FIRST_BONUS)) : 0;
    const rub = prod ? prod.rub : n * perUe(n);
    const { data: row, error } = await db.from('purchases').insert({ player_id: user.id, ue: n, rub, bonus, product: prod ? product : null }).select('inv_id').single();
    if (error) return json({ error: error.message }, 500);
    const inv = String(row.inv_id), sum = `${rub}.00`;
    const q = new URLSearchParams({
      MerchantLogin: login, OutSum: sum, InvId: inv, Culture: 'ru',
      Description: (prod ? prod.title : `Игровая валюта «Выжить до пятницы»: ${n} у.е.${bonus ? ` + ${bonus} в подарок` : ''}`).slice(0, 100),
      SignatureValue: md5(`${login}:${sum}:${inv}:${pass1}`),
    });
    const mail = typeof email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && !/@(tg|vk)\.survivefriday\.com$/.test(email) ? email : '';
    if (mail) q.set('Email', mail);
    if (Deno.env.get('ROBOKASSA_TEST') === '1') q.set('IsTest', '1');
    return json({ url: `https://auth.robokassa.ru/Merchant/Index.aspx?${q}`, inv_id: row.inv_id, rub, bonus, product: prod ? product : null });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
