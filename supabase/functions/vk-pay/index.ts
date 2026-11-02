// Оплата у.е. голосами ВКонтакте внутри мини-приложения ВК (Payments API, «платёжные уведомления»).
// Сайт и Telegram платят через Робокассу (robokassa-pay / robokassa-result) — эта функция их не трогает.
//
// Как устроено:
//   игра (js/topup.js, vkBuy) → vkBridge('VKWebAppShowOrderBox', { type: 'item', item: 'ue25' })
//   → ВК присылает сюда get_item: какой это товар и сколько стоит в голосах → игрок платит в окне ВК
//   → ВК присылает order_status_change со status=chargeable → пишем в purchases строку status='paid'
//   → игра забирает у.е. и подарки через claim_purchases2 (js/topup.js, claimPaid) — так же, как после Робокассы.
//
// Протокол (ВНИМАНИЕ: сверить с актуальной документацией перед включением — из песочницы dev.vk.com/dev.vk.ru были недоступны,
// написано по известному формату Payments API: https://dev.vk.com/ru/api/payments/notifications/overview):
//   • POST application/x-www-form-urlencoded; параметры: notification_type, app_id, user_id, receiver_id, order_id, item,
//     item_id, item_price, status, date, version, lang, sig …
//   • Подпись: sig = md5( все параметры, кроме sig, отсортированные по имени, «key=value» подряд без разделителей + секрет приложения ).
//     Секрет — «Защищённый ключ» приложения ВК: VK_APP_SECRET (тот же, что проверяет параметры запуска в tg-login).
//   • get_item / get_item_test → { response: { item_id, title, photo_url, price, expiration } }, price — в голосах.
//   • order_status_change / order_status_change_test, status=chargeable → { response: { order_id, app_order_id } }.
//     Повторное уведомление с тем же order_id — тот же ответ, без второго начисления (уникальный vk_order_id).
//   • Ошибка → { error: { error_code, error_msg, critical } }. Коды ВК: 1 — общая, 2 — временная (critical=false — ВК повторит),
//     10 — неверная подпись, 11 — параметры не по спецификации, 20 — товара нет, 21 — товар недоступен, 22 — пользователя нет.
//   • Тестовые уведомления (*_test) приходят только при тестовом режиме платежей в настройках приложения; они зачисляются тоже,
//     но с pay_via='vk_test' — чтобы не путать со статистикой настоящих покупок.
//
// Также GET ?prices=1 — публичный список товаров с ценами в голосах для окна покупки в игре (без цены товара в списке нет).
// Деплой: verify_jwt = false (ВК не присылает ключ Supabase). Нужна миграция supabase/update-2026-11-02-vk-pay.sql.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createHash } from 'node:crypto';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } });
const fail = (error_code: number, error_msg: string, critical = true) => json({ error: { error_code, error_msg, critical } });
const md5 = (s: string) => createHash('md5').update(s).digest('hex');

// ============ ЦЕНЫ ВЛАДЕЛЬЦА — заполнить ============
// Цена в голосах ВК (1 голос ≈ 7 ₽ для игрока; ВК удерживает свою комиссию). 0 — товар не продаётся:
// get_item ответит «товар недоступен», а в игре кнопки этого товара не будет. Пока все 0 — покупка в ВК закрыта,
// даже если в js/config.js включено vk.pay.
const VK_PRICES: Record<string, number> = {
  ue10: 0,
  ue25: 0,
  ue50: 0,
  ue100: 0,
  starter: 0,
  coffee: 0,
};
// ====================================================

// Что получает игрок — то же, что в robokassa-pay (у.е., Стартовый набор, «Кофе разработчикам»)
const ITEMS: Record<string, { ue: number; product: string | null; title: string }> = {
  ue10: { ue: 10, product: null, title: '10 у.е. — игровая валюта «Выжить до пятницы»' },
  ue25: { ue: 25, product: null, title: '25 у.е. — игровая валюта «Выжить до пятницы»' },
  ue50: { ue: 50, product: null, title: '50 у.е. — игровая валюта «Выжить до пятницы»' },
  ue100: { ue: 100, product: null, title: '100 у.е. — игровая валюта «Выжить до пятницы»' },
  starter: { ue: 30, product: 'starter', title: 'Стартовый набор: 30 у.е. и подарки' },
  coffee: { ue: 10, product: 'coffee', title: 'Кофе разработчикам: значок «Меценат» и 10 у.е.' },
};
const FIRST_BONUS = 0.5;  // +50% у.е. к первому оплаченному пополнению — как в robokassa-pay
const PHOTO = 'https://survivefriday.com/icons/icon-512.png';
const price = (item: string) => Math.max(0, Math.floor(Number(VK_PRICES[item]) || 0));

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method === 'GET') {
    const items: Record<string, { votes: number; ue: number; product: string | null }> = {};
    for (const [id, it] of Object.entries(ITEMS)) if (price(id) > 0) items[id] = { votes: price(id), ue: it.ue, product: it.product };
    return json({ items });
  }
  try {
    const secret = (Deno.env.get('VK_APP_SECRET') || '').trim();
    if (!secret) return fail(2, 'not configured', false);
    const p = new URLSearchParams(await req.text());
    const keys = [...p.keys()].filter(k => k !== 'sig').sort();
    if (md5(keys.map(k => `${k}=${p.get(k)}`).join('') + secret) !== (p.get('sig') || '').toLowerCase()) return fail(10, 'bad signature');
    const appId = (Deno.env.get('VK_APP_ID') || '').trim();  // необязательно: свой ли это app_id
    if (appId && p.get('app_id') && p.get('app_id') !== appId) return fail(11, 'wrong app_id');

    const type = p.get('notification_type') || '', test = type.endsWith('_test');
    const vkId = Number(p.get('receiver_id') || p.get('user_id') || 0);
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
    // игрок ВК → аккаунт игры (вход в мини-приложении, tg-login vk_launch)
    const player = async () => vkId > 0 ? (await db.from('vk_accounts').select('user_id').eq('vk_id', vkId).maybeSingle()).data?.user_id as string | undefined : undefined;
    const paidRows = async (uid: string) => (await db.from('purchases').select('product').eq('player_id', uid).eq('status', 'paid').limit(50)).data || [];

    if (type === 'get_item' || type === 'get_item_test') {
      const item = p.get('item') || '', it = ITEMS[item];
      if (!it) return fail(20, 'item not found');
      if (!(price(item) > 0)) return fail(21, 'item unavailable');
      const uid = await player();
      if (!uid) return fail(22, 'user not found');  // сначала игра должна войти в аккаунт (это делает сама при запуске)
      if (it.product === 'starter' && (await paidRows(uid)).some(r => r.product === 'starter')) return fail(21, 'starter already bought');
      return json({ response: { item_id: item, title: it.title, photo_url: PHOTO, price: price(item), expiration: 3600 } });
    }

    if (type === 'order_status_change' || type === 'order_status_change_test') {
      const orderId = Number(p.get('order_id') || 0), status = p.get('status') || '';
      if (!(orderId > 0)) return fail(11, 'no order_id');
      const { data: had } = await db.from('purchases').select('inv_id').eq('vk_order_id', orderId).maybeSingle();
      if (status !== 'chargeable') {
        // Возврат (refunded) делает поддержка ВК; у.е. к этому времени обычно уже зачислены — только фиксируем в логах
        console.log('vk-pay status', status, 'order', orderId, 'inv', had?.inv_id);
        return json({ response: { order_id: orderId, ...(had ? { app_order_id: had.inv_id } : {}) } });
      }
      if (had) return json({ response: { order_id: orderId, app_order_id: had.inv_id } });  // уже зачислено — повтор
      const item = p.get('item') || p.get('item_id') || '', it = ITEMS[item];
      if (!it) return fail(20, 'item not found');
      const uid = await player();
      if (!uid) return fail(22, 'user not found');
      const bonus = !it.product && !(await paidRows(uid)).length ? Math.min(250, Math.ceil(it.ue * FIRST_BONUS)) : 0;
      const votes = Math.floor(Number(p.get('item_price')) || price(item));
      const { data: row, error } = await db.from('purchases').insert({
        player_id: uid, ue: it.ue, rub: null, bonus, product: it.product, status: 'paid', paid_at: new Date().toISOString(),
        pay_via: test ? 'vk_test' : 'vk', vk_order_id: orderId, votes,
      }).select('inv_id').single();
      if (error) {
        // одновременный повтор того же заказа (уникальный vk_order_id) — отвечаем как на повтор
        const { data: dup } = await db.from('purchases').select('inv_id').eq('vk_order_id', orderId).maybeSingle();
        if (dup) return json({ response: { order_id: orderId, app_order_id: dup.inv_id } });
        console.log('vk-pay insert', error.message);
        return fail(2, 'database error', false);  // ВК повторит уведомление
      }
      return json({ response: { order_id: orderId, app_order_id: row.inv_id } });
    }
    return fail(11, 'unknown notification_type');
  } catch (e) {
    console.log('vk-pay', String(e));
    return fail(1, 'internal error', false);
  }
});
