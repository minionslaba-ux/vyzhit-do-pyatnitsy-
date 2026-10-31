// Пуш-уведомления браузера: подписка и отписка игрока; GET — открытый ключ VAPID для подписки.
// Пару ключей VAPID функция создаёт сама при первом обращении и хранит в закрытой таблице push_keys:
// закрытый ключ никуда не передаётся (ни в браузер, ни в репозиторий).
import { createClient } from 'jsr:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const b64u = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function keys(db: ReturnType<typeof createClient>) {
  const { data } = await db.from('push_keys').select('pub').eq('id', 1).maybeSingle();
  if (data?.pub) return data.pub as string;
  const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const pub = b64u(await crypto.subtle.exportKey('raw', kp.publicKey));
  const priv = (await crypto.subtle.exportKey('jwk', kp.privateKey)).d!;
  await db.from('push_keys').upsert({ id: 1, pub, priv }, { onConflict: 'id', ignoreDuplicates: true });
  const { data: again } = await db.from('push_keys').select('pub').eq('id', 1).single();  // если две функции создали ключи одновременно — берём сохранённый
  return again.pub as string;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
    if (req.method === 'GET') return json({ pub: await keys(db) });
    const { action, sub, endpoint, player_id, lang } = await req.json();
    if (action === 'off') {
      if (typeof endpoint === 'string') await db.from('push_subs').delete().eq('endpoint', endpoint);
      return json({ ok: true });
    }
    const ep = sub?.endpoint, p256dh = sub?.keys?.p256dh, auth = sub?.keys?.auth;
    if (typeof ep !== 'string' || !/^https:\/\//.test(ep) || ep.length > 990 || typeof p256dh !== 'string' || typeof auth !== 'string' || p256dh.length > 200 || auth.length > 100) return json({ error: 'bad_sub' }, 400);
    const pid = typeof player_id === 'string' && /^[0-9a-f-]{36}$/i.test(player_id) ? player_id : null;
    const { error } = await db.from('push_subs').upsert({ endpoint: ep, p256dh, auth, player_id: pid, lang: lang === 'en' ? 'en' : 'ru' }, { onConflict: 'endpoint' });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
