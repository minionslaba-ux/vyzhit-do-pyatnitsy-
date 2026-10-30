// Подписка на напоминания «Неделя дня готова» в Telegram. Вызывается из игры, открытой как Telegram Mini App.
// Проверяем подпись initData токеном бота (TELEGRAM_BOT_TOKEN в секретах функций) — так подписаться можно только за себя.
// action: 'group_link' — ссылка-приглашение в группу игры (tg_groups.main); 'group_claim' — награда 10 у.е. за вступление:
// бот проверяет, что игрок в группе, и выдаёт её один раз на аккаунт Telegram (tg_group_rewards).
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
    const { initData, player_id, lang, enable, action } = await req.json();
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const tg = async (method: string, body: Record<string, unknown>) =>
      (await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json().catch(() => ({}));
    const main = async () => (await db.from('tg_groups').select('chat_id, invite_link').eq('main', true).maybeSingle()).data;
    if (action === 'group_link') {  // ссылка не секрет — без проверки подписи
      const g = await main();
      if (!g) return json({ link: null });
      if (g.invite_link) return json({ link: g.invite_link });
      const r = await tg('exportChatInviteLink', { chat_id: g.chat_id });  // нужен бот-админ с правом приглашать
      if (r.ok) await db.from('tg_groups').update({ invite_link: r.result }).eq('chat_id', g.chat_id);
      return json({ link: r.ok ? r.result : null });
    }
    if (typeof initData !== 'string' || !/^[0-9a-f-]{36}$/i.test(player_id || '')) return json({ error: 'bad_request' }, 400);
    const p = new URLSearchParams(initData), hash = p.get('hash') || '';
    p.delete('hash');
    const check = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
    const secret = await hmac(enc.encode('WebAppData'), token);
    if (hex(await hmac(secret, check)) !== hash) return json({ error: 'bad_signature' }, 403);
    if (Date.now() / 1000 - Number(p.get('auth_date') || 0) > 7 * 86400) return json({ error: 'expired' }, 403);
    const user = JSON.parse(p.get('user') || '{}');
    if (!user.id) return json({ error: 'no_user' }, 400);
    if (action === 'group_claim') {
      const g = await main();
      if (!g) return json({ error: 'no_group' }, 404);
      const { data: had } = await db.from('tg_group_rewards').select('tg_id').eq('tg_id', user.id).maybeSingle();
      if (had) return json({ error: 'claimed' }, 409);
      const m = await tg('getChatMember', { chat_id: g.chat_id, user_id: user.id });
      const st = m.result?.status;
      if (!(['creator', 'administrator', 'member'].includes(st) || (st === 'restricted' && m.result?.is_member))) return json({ error: 'not_member' }, 403);
      const { error } = await db.from('tg_group_rewards').insert({ tg_id: user.id, player_id });
      if (error) return json({ error: 'claimed' }, 409);
      return json({ ok: true, reward: 10 });
    }
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
