// Напоминания в мессенджерах без веб-пушей: включить / выключить / узнать состояние.
//   ВК (мини-приложение): { via: 'vk', params: location.search, enable?: boolean, player_id? } — подпись параметров запуска
//     проверяется «Защищённым ключом» приложения (секрет VK_APP_SECRET, как в tg-login). Разрешение на уведомления игрок
//     даёт в самом ВК (VKWebAppAllowNotifications) — сюда игра приходит уже после согласия.
//   MAX (мини-приложение бота): { via: 'max', init: WebApp.initData, enable?, player_id? } — подпись initData токеном бота MAX_BOT_TOKEN.
// enable не передан — только вернуть { enabled }. Шлёт напоминания tg-daily (remind.ts), раз в день.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const enc = new TextEncoder();
const hex = (b: Uint8Array) => [...b].map(x => x.toString(16).padStart(2, '0')).join('');
async function hmac(key: Uint8Array, msg: string) {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
}

// ВК: подпись vk_*-параметров запуска (как vkLaunchUser в tg-login)
async function vkUser(params: string): Promise<number> {
  const secret = (Deno.env.get('VK_APP_SECRET') || '').trim();
  if (!secret || typeof params !== 'string') return 0;
  const q = new URLSearchParams(params.replace(/^\?/, ''));
  const vkp = [...q.entries()].filter(([k]) => k.startsWith('vk_')).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  const mac = await hmac(enc.encode(secret), new URLSearchParams(vkp).toString());
  const sign = btoa(String.fromCharCode(...mac)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (sign !== q.get('sign')) return 0;
  const ts = Number(q.get('vk_ts') || 0);
  if (ts && Date.now() / 1000 - ts > 7 * 86400) return 0;
  return Number(q.get('vk_user_id')) || 0;
}
// MAX: initData подписан токеном бота тем же способом, что Telegram WebApp
async function maxUser(init: string): Promise<number> {
  const token = (Deno.env.get('MAX_BOT_TOKEN') || '').trim();
  if (!token || typeof init !== 'string' || !init) return 0;
  const p = new URLSearchParams(init), hash = p.get('hash') || '';
  p.delete('hash');
  const check = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
  if (hex(await hmac(await hmac(enc.encode('WebAppData'), token), check)) !== hash) return 0;
  if (Date.now() / 1000 - Number(p.get('auth_date') || 0) > 7 * 86400) return 0;
  try { return Number(JSON.parse(p.get('user') || 'null')?.id) || 0; } catch { return 0; }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const b = await req.json().catch(() => ({}));
    const via = b.via === 'vk' ? 'vk' : b.via === 'max' ? 'max' : '';
    if (!via) return json({ error: 'bad_via' }, 400);
    const uid = via === 'vk' ? await vkUser(b.params) : await maxUser(b.init);
    if (!uid) return json({ error: 'bad_signature' }, 403);
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
    if (typeof b.enable !== 'boolean') {
      const { data } = await db.from('msg_remind').select('enabled').eq('via', via).eq('uid', uid).maybeSingle();
      return json({ enabled: !!data?.enabled });
    }
    const pid = /^[0-9a-f-]{36}$/i.test(String(b.player_id || '')) ? String(b.player_id) : null;
    const row: Record<string, unknown> = { via, uid, enabled: b.enable, lang: b.lang === 'en' ? 'en' : 'ru', updated_at: new Date().toISOString(), last_error: null };
    if (pid) row.player_id = pid;
    const { error } = await db.from('msg_remind').upsert(row);
    if (error) return json({ error: error.message }, 500);
    return json({ enabled: b.enable });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
