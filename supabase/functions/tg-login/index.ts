// Вход в игру через Telegram и VK ID.
// Telegram — на сайте (oauth.telegram.org, данные подписаны токеном бота) и в Mini App (initData).
// VK ID — OAuth 2.1 с PKCE: сайт присылает code и code_verifier, мы сами меняем их на токен у VK и спрашиваем, кто это.
// Аккаунт привязан к пользователю Supabase Auth (tg_accounts / vk_accounts); выдаём обычную сессию — как после входа по ссылке из письма.
// Уже вошли (access_token) — Telegram или VK привязывается к этому же аккаунту.
// У аккаунта без почты служебный адрес tg<id>@tg.survivefriday.com / vk<id>@vk.survivefriday.com — писем на него не шлём.
// action 'bot_id' — номер бота для кнопки входа (не секрет).
import { createClient } from 'jsr:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const enc = new TextEncoder();
const hex = (b: Uint8Array) => [...b].map(x => x.toString(16).padStart(2, '0')).join('');
async function hmac(key: Uint8Array, msg: string) {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(msg)));
}
const DAY = 86400;

// Проверка подписи; возвращает пользователя Telegram или null
async function verify(token: string, body: any) {
  if (typeof body.initData === 'string' && body.initData) {  // Mini App
    const p = new URLSearchParams(body.initData), hash = p.get('hash') || '';
    p.delete('hash');
    const check = [...p.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => `${k}=${v}`).join('\n');
    if (hex(await hmac(await hmac(enc.encode('WebAppData'), token), check)) !== hash) return null;
    if (Date.now() / 1000 - Number(p.get('auth_date') || 0) > 7 * DAY) return null;
    return JSON.parse(p.get('user') || 'null');
  }
  const a = body.tgAuth;  // вход на сайте: ключ — SHA-256 от токена
  if (!a || typeof a !== 'object' || !a.hash) return null;
  const check = Object.keys(a).filter(k => k !== 'hash' && a[k] != null).sort().map(k => `${k}=${a[k]}`).join('\n');
  const key = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(token)));
  if (hex(await hmac(key, check)) !== a.hash) return null;
  if (Date.now() / 1000 - Number(a.auth_date || 0) > DAY) return null;
  return { id: Number(a.id), first_name: a.first_name, last_name: a.last_name, username: a.username };
}

// VK ID: обменять код на токен и узнать пользователя
async function vkUser(v: any) {
  if (!v || typeof v.code !== 'string' || typeof v.code_verifier !== 'string' || !/^\d+$/.test(String(v.client_id || ''))) return null;
  const form = (o: Record<string, string>) => ({ method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(o) });
  const t = await (await fetch('https://id.vk.com/oauth2/auth', form({ grant_type: 'authorization_code', code: v.code, code_verifier: v.code_verifier,
    client_id: String(v.client_id), device_id: String(v.device_id || ''), redirect_uri: String(v.redirect_uri || ''), state: String(v.state || '') }))).json().catch(() => ({}));
  if (!t.access_token) return null;
  const i = await (await fetch('https://id.vk.com/oauth2/user_info', form({ client_id: String(v.client_id), access_token: t.access_token }))).json().catch(() => ({}));
  const u = i.user;
  return u?.user_id ? { id: Number(u.user_id), first_name: u.first_name, last_name: u.last_name } : null;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json();
    const vk = !!body.vk;
    const token = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
    if (!vk && !token) return json({ error: 'not_configured' }, 503);
    if (body.action === 'bot_id') return json({ bot_id: Number(token.split(':')[0]) });
    const u = vk ? await vkUser(body.vk) : await verify(token, body);
    if (!u?.id) return json({ error: vk ? 'vk_failed' : 'bad_signature' }, 403);
    const T = vk ? { table: 'vk_accounts', key: 'vk_id', mail: 'vk' } : { table: 'tg_accounts', key: 'tg_id', mail: 'tg' };
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ').slice(0, 24) || (u as any).username || (vk ? 'VK' : 'Telegram');
    const url = Deno.env.get('SUPABASE_URL')!, opts = { auth: { persistSession: false, autoRefreshToken: false } };
    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, opts);
    const { data: link } = await db.from(T.table).select('user_id').eq(T.key, u.id).maybeSingle();
    const extra = vk ? {} : { username: String((u as any).username || '').slice(0, 64) };  // логин Telegram — для выгрузки разработчику
    if (link && !vk) await db.from(T.table).update({ name, ...extra }).eq(T.key, u.id);

    if (body.access_token) {  // привязать к аккаунту, под которым уже вошли
      const { data: { user: cur } } = await db.auth.getUser(body.access_token);
      if (!cur) return json({ error: 'bad_session' }, 401);
      if (link && link.user_id !== cur.id) return json({ error: 'linked_elsewhere' }, 409);
      const { error } = await db.from(T.table).upsert({ [T.key]: u.id, user_id: cur.id, name, ...extra });
      if (error) return json({ error: 'already_linked' }, 409);  // к аккаунту уже привязан другой профиль
      return json({ linked: true, name });
    }

    let uid = link?.user_id as string | undefined, email = '';
    if (uid) email = (await db.auth.admin.getUserById(uid)).data.user?.email || '';
    if (!uid || !email) {
      email = `${T.mail}${u.id}@${T.mail}.survivefriday.com`;
      const made = await db.auth.admin.createUser({ email, email_confirm: true, user_metadata: { [T.key]: u.id, name } });
      if (made.error || !made.data.user) return json({ error: made.error?.message || 'create_failed' }, 500);
      uid = made.data.user.id;
      await db.from(T.table).upsert({ [T.key]: u.id, user_id: uid, name, ...extra });
    }
    const gl = await db.auth.admin.generateLink({ type: 'magiclink', email });
    if (gl.error) return json({ error: gl.error.message }, 500);
    const auth = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, opts);
    const { data: s, error } = await auth.auth.verifyOtp({ type: 'magiclink', token_hash: gl.data.properties.hashed_token });
    if (error || !s.session) return json({ error: error?.message || 'no_session' }, 500);
    return json({ access_token: s.session.access_token, refresh_token: s.session.refresh_token, expires_at: s.session.expires_at,
      user: { id: s.user!.id, email: s.user!.email, created_at: s.user!.created_at }, name });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
