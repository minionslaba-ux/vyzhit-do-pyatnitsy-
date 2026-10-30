// Подписка на напоминания «Неделя дня готова» в Telegram. Вызывается из игры, открытой как Telegram Mini App.
// Проверяем подпись initData токеном бота (TELEGRAM_BOT_TOKEN в секретах функций) — так подписаться можно только за себя.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const enc = new TextEncoder();
async function hmac(key: Uint8Array, msg: string) {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
}
const hex = (b: Uint8Array) => [...b].map(x => x.toString(16).padStart(2, '0')).join('');

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!token) return json({ error: 'not_configured' }, 503);
    const { initData, player_id, lang, enable } = await req.json();
    if (typeof initData !== 'string' || !/^[0-9a-f-]{36}$/i.test(player_id || '')) return json({ error: 'bad_request' }, 400);
    const p = new URLSearchParams(initData), hash = p.get('hash') || '';
    p.delete('hash');
    const check = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
    const secret = await hmac(enc.encode('WebAppData'), token);
    if (hex(await hmac(secret, check)) !== hash) return json({ error: 'bad_signature' }, 403);
    if (Date.now() / 1000 - Number(p.get('auth_date') || 0) > 7 * 86400) return json({ error: 'expired' }, 403);
    const user = JSON.parse(p.get('user') || '{}');
    if (!user.id) return json({ error: 'no_user' }, 400);
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    if (typeof enable !== 'boolean') {  // только узнать, включено ли
      const { data } = await db.from('tg_subs').select('enabled').eq('tg_id', user.id).maybeSingle();
      return json({ enabled: !!data?.enabled });
    }
    await db.from('tg_subs').delete().eq('tg_id', user.id).neq('player_id', player_id);
    const { error } = await db.from('tg_subs').upsert({ player_id, tg_id: user.id, lang: lang === 'en' ? 'en' : 'ru', enabled: enable });
    if (error) return json({ error: error.message }, 500);
    return json({ enabled: enable });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
