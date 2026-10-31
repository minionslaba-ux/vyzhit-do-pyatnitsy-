// Робокасса: создать счёт на покупку у.е. и вернуть ссылку на оплату.
// Цена считается здесь, на сервере (как на странице «Цены»): 1–9 у.е. — 100 ₽, 10+ — 90, 25+ — 80, 50+ — 70, 100+ — 60 за 1 у.е.
// Подпись — MD5(MerchantLogin:OutSum:InvId:Пароль№1). Пароли — только в секретах Supabase:
// ROBOKASSA_PASS1, ROBOKASSA_PASS2 (идентификатор магазина не секрет: survivefriday.com); ROBOKASSA_TEST=1 — тестовый режим (тогда в PASS1/PASS2 — тестовые пароли).
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHash } from 'node:crypto';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const TIERS = [[1, 100], [10, 90], [25, 80], [50, 70], [100, 60]];
const perUe = (n: number) => TIERS.reduce((p, [from, price]) => n >= from ? price : p, 100);
const md5 = (s: string) => createHash('md5').update(s).digest('hex');

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const login = Deno.env.get('ROBOKASSA_LOGIN') || 'survivefriday.com', pass1 = Deno.env.get('ROBOKASSA_PASS1');
    if (!login || !pass1) return json({ error: 'not_configured' }, 503);
    const { access_token, ue, email } = await req.json();
    const n = Math.floor(Number(ue));
    if (!(n >= 1 && n <= 500)) return json({ error: 'bad_amount' }, 400);
    const url = Deno.env.get('SUPABASE_URL')!, db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
    if (typeof access_token !== 'string' || !access_token) return json({ error: 'no_session' }, 401);
    const { data: { user } } = await db.auth.getUser(access_token);
    if (!user) return json({ error: 'bad_session' }, 401);
    const rub = n * perUe(n);
    const { data: row, error } = await db.from('purchases').insert({ player_id: user.id, ue: n, rub }).select('inv_id').single();
    if (error) return json({ error: error.message }, 500);
    const inv = String(row.inv_id), sum = `${rub}.00`;
    const q = new URLSearchParams({
      MerchantLogin: login, OutSum: sum, InvId: inv, Culture: 'ru',
      Description: `Игровая валюта «Выжить до пятницы»: ${n} у.е.`.slice(0, 100),
      SignatureValue: md5(`${login}:${sum}:${inv}:${pass1}`),
    });
    const mail = typeof email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && !/@(tg|vk)\.survivefriday\.com$/.test(email) ? email : '';
    if (mail) q.set('Email', mail);
    if (Deno.env.get('ROBOKASSA_TEST') === '1') q.set('IsTest', '1');
    return json({ url: `https://auth.robokassa.ru/Merchant/Index.aspx?${q}`, inv_id: row.inv_id, rub });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
