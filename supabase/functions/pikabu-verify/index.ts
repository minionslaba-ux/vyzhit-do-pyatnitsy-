// Покупки на Пикабу Играх («Выжить до пятницы», js/platform-pikabu.js): игра присылает signedData покупки
// (JWT HS256, подписан секретным ключом игры из Студии Пикабу). Функция проверяет подпись ключом PIKABU_SECRET
// (секрет функций Supabase, его добавляет владелец), проверяет товар по списку и записывает покупку в pikabu_purchases:
// повтор той же покупки не создаёт второй записи. Ответ: { ok, productId, purchaseId, consumable, test, fresh }.
// GET — { ok, ready }: задан ли ключ (без значения). Устроено как nf-pikabu «Ночного тарифа» (прошло модерацию).
import { createClient } from 'jsr:@supabase/supabase-js@2';

const SECRET = (Deno.env.get('PIKABU_SECRET') || '').trim();
// товары — как в promo/pikabu/tovary-pikabu.csv (каталог в Студии Пикабу)
const PRODUCTS = new Set(['starter', 'noads', 'ue10', 'ue25', 'ue50', 'ue100']);
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type, apikey, authorization', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

const b64urlBytes = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
async function verify(token: string): Promise<Record<string, unknown> | null> {
  const parts = String(token || '').split('.');
  if (parts.length !== 3 || !SECRET) return null;
  try {
    const head = JSON.parse(new TextDecoder().decode(b64urlBytes(parts[0])));
    if (head.alg !== 'HS256') return null;  // только HS256, как пишет площадка
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('HMAC', key, b64urlBytes(parts[2]), new TextEncoder().encode(parts[0] + '.' + parts[1]));
    if (!ok) return null;
    return JSON.parse(new TextDecoder().decode(b64urlBytes(parts[1])));
  } catch { return null; }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return json({ ok: true, ready: !!SECRET });
  if (!SECRET) return json({ ok: false, error: 'not_configured' }, 503);
  const b = await req.json().catch(() => null);
  const p = await verify(b?.signedData);
  if (!p) return json({ ok: false, error: 'bad_signature' }, 403);
  const purchaseId = String(p.purchaseId || ''), productId = String(p.productId || '');
  if (!purchaseId || !PRODUCTS.has(productId)) return json({ ok: false, error: 'unknown_product' }, 400);
  const { data, error } = await db.from('pikabu_purchases').upsert({ purchase_id: purchaseId.slice(0, 200), player_id: String(p.playerId || '').slice(0, 100),
    product_id: productId, consumable: !!p.isConsumable, test: !!p.isTestPurchase }, { onConflict: 'purchase_id', ignoreDuplicates: true }).select('purchase_id');
  if (error) return json({ ok: false, error: 'db' }, 500);
  return json({ ok: true, productId, purchaseId, consumable: !!p.isConsumable, test: !!p.isTestPurchase, fresh: !!data?.length });
});
