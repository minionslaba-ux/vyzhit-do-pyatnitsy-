// Вход в игру через Telegram и VK ID.
// Telegram — на сайте (oauth.telegram.org, данные подписаны токеном бота) и в Mini App (initData).
// VK ID — OAuth 2.1 с PKCE: сайт присылает code и code_verifier, мы сами меняем их на токен у VK и спрашиваем, кто это.
// Аккаунт привязан к пользователю Supabase Auth (tg_accounts / vk_accounts); выдаём обычную сессию — как после входа по ссылке из письма.
// Уже вошли (access_token) — Telegram или VK привязывается к этому же аккаунту.
// У аккаунта без почты служебный адрес tg<id>@tg.survivefriday.com / vk<id>@vk.survivefriday.com — писем на него не шлём.
// MAX — мини-приложение бота MAX: initData (WebAppData) подписан токеном бота MAX_BOT_TOKEN тем же способом, что в Telegram (dev.max.ru/docs/webapps/validation).
// action 'bot_id' — номер бота для кнопки входа (не секрет).
// Вход в свой аккаунт кодом (одна игра — один аккаунт на всех площадках):
//   action 'link_code' + access_token — выдать одноразовый код (8 символов, 10 минут) для входа в этот аккаунт на другом устройстве;
//   code + подтверждение площадки (initData / tgAuth / vk / vk_launch / max_init) — эта площадка навсегда привязывается к аккаунту кода;
//   code без площадки (сайт) — просто вход в аккаунт кода. Таблица link_codes (supabase/update-2026-11-03-cloud-save.sql).
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

// Мини-приложение ВКонтакте: ВК передаёт параметры запуска (vk_user_id и др.), подписанные «Защищённым ключом» приложения.
// Секрет VK_APP_SECRET добавляет владелец (Supabase → Edge Functions → Secrets). Подпись: HMAC-SHA256 от отсортированных vk_*-параметров,
// base64url без «=». Аккаунт — тот же, что у входа через VK ID (vk_accounts, vk<id>@vk.survivefriday.com). Имя приходит от клиента — только для подписи профиля.
async function vkLaunchUser(v: any) {
  const secret = (Deno.env.get('VK_APP_SECRET') || '').trim();
  const no = (why: string) => { console.log('vk_launch fail:', why); return { why }; };
  if (!secret) return no('no_secret');
  if (!v || typeof v.params !== 'string') return no('no_params');
  const q = new URLSearchParams(v.params.replace(/^\?/, ''));
  const vkp = [...q.entries()].filter(([k]) => k.startsWith('vk_')).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(new URLSearchParams(vkp).toString())));
  const sign = btoa(String.fromCharCode(...mac)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (sign !== q.get('sign')) return no(`bad_sign keys=${vkp.map(([k]) => k).join(',')}`);
  const ts = Number(q.get('vk_ts') || 0);
  if (ts && Date.now() / 1000 - ts > 7 * 86400) return no('old');  // старые параметры запуска не принимаем
  const id = Number(q.get('vk_user_id'));
  return id > 0 ? { id, first_name: String(v.name || '').replace(/[<>]/g, '').slice(0, 24) } : no('no_user');
}

const CODE_ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => [...crypto.getRandomValues(new Uint8Array(8))].map(x => CODE_ABC[x % CODE_ABC.length]).join('');
// Обычная сессия Supabase для аккаунта uid (как после входа по ссылке из письма)
async function sessionFor(db: any, url: string, opts: any, uid: string, name: string) {
  const email = (await db.auth.admin.getUserById(uid)).data.user?.email || '';
  if (!email) return json({ error: 'no_account' }, 404);
  const gl = await db.auth.admin.generateLink({ type: 'magiclink', email });
  if (gl.error) return json({ error: gl.error.message }, 500);
  const auth = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, opts);
  const { data: s, error } = await auth.auth.verifyOtp({ type: 'magiclink', token_hash: gl.data.properties.hashed_token });
  if (error || !s.session) return json({ error: error?.message || 'no_session' }, 500);
  return json({ access_token: s.session.access_token, refresh_token: s.session.refresh_token, expires_at: s.session.expires_at,
    user: { id: s.user!.id, email: s.user!.email, created_at: s.user!.created_at }, name });
}
// Одноразовый код → аккаунт (или null). Использованный, просроченный (10 мин) или чужой код не подходит
async function useCode(db: any, code: string): Promise<string | null> {
  if (!/^[A-Z0-9]{8}$/.test(code)) return null;
  const since = new Date(Date.now() - 600e3).toISOString();
  const { data } = await db.from('link_codes').update({ used_at: new Date().toISOString() }).eq('code', code).is('used_at', null).gt('created_at', since).select('user_id');
  return data?.[0]?.user_id || null;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json();
    const url0 = Deno.env.get('SUPABASE_URL')!, opts0 = { auth: { persistSession: false, autoRefreshToken: false } };
    // Код для входа на другом устройстве: только для того, кто уже вошёл
    if (body.action === 'link_code') {
      const db = createClient(url0, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, opts0);
      const { data: { user: cur } } = await db.auth.getUser(String(body.access_token || ''));
      if (!cur) return json({ error: 'bad_session' }, 401);
      const { count } = await db.from('link_codes').select('code', { count: 'exact', head: true }).eq('user_id', cur.id).gt('created_at', new Date(Date.now() - 3600e3).toISOString());
      if ((count || 0) >= 10) return json({ error: 'too_often' }, 429);
      for (let i = 0; i < 5; i++) {
        const code = newCode();
        const { error } = await db.from('link_codes').insert({ code, user_id: cur.id });
        if (!error) return json({ code, expires_in: 600 });
      }
      return json({ error: 'code_failed' }, 500);
    }
    const code = typeof body.code === 'string' ? body.code.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
    const proof = (typeof body.max_init === 'string' && body.max_init) || body.vk_launch || body.vk || (typeof body.initData === 'string' && body.initData) || body.tgAuth;
    if (code && !proof) {  // сайт: просто вход в аккаунт кода
      const db = createClient(url0, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, opts0);
      const target = await useCode(db, code);
      if (!target) return json({ error: 'bad_code' }, 403);
      return await sessionFor(db, url0, opts0, target, '');
    }
    const vkl = !!body.vk_launch, vk = !!body.vk || vkl, max = typeof body.max_init === 'string' && !!body.max_init;
    const token = max ? (Deno.env.get('MAX_BOT_TOKEN') || '').trim() : Deno.env.get('TELEGRAM_BOT_TOKEN') || '';
    if (!vk && !token) return json({ error: 'not_configured' }, 503);
    if (body.action === 'bot_id') return json({ bot_id: Number(token.split(':')[0]) });
    const u = max ? await verify(token, { initData: body.max_init }) : vkl ? await vkLaunchUser(body.vk_launch) : vk ? await vkUser(body.vk) : await verify(token, body);
    if (!u?.id) return json({ error: vk ? 'vk_failed' : 'bad_signature', why: (u as any)?.why ? String((u as any).why).split(' ')[0] : undefined }, 403);
    const T = max ? { table: 'max_accounts', key: 'max_id', mail: 'max' } : vk ? { table: 'vk_accounts', key: 'vk_id', mail: 'vk' } : { table: 'tg_accounts', key: 'tg_id', mail: 'tg' };
    const name = [u.first_name, u.last_name].filter(Boolean).join(' ').slice(0, 24) || (u as any).username || (max ? 'MAX' : vk ? 'VK' : 'Telegram');
    const url = Deno.env.get('SUPABASE_URL')!, opts = { auth: { persistSession: false, autoRefreshToken: false } };
    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, opts);
    const { data: link } = await db.from(T.table).select('user_id').eq(T.key, u.id).maybeSingle();
    const extra = vk ? {} : { username: String((u as any).username || '').slice(0, 64) };  // логин Telegram — для выгрузки разработчику
    if (code) {  // эта площадка теперь входит в аккаунт кода (прежний автоматический аккаунт площадки остаётся пустым)
      const target = await useCode(db, code);
      if (!target) return json({ error: 'bad_code' }, 403);
      const { error } = await db.from(T.table).upsert({ [T.key]: u.id, user_id: target, name, ...extra });
      if (error) return json({ error: 'already_linked' }, 409);  // к аккаунту кода уже привязан другой профиль этой площадки
      return await sessionFor(db, url, opts, target, name);
    }
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
