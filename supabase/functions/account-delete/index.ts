// Удаление аккаунта игроком — с подтверждением.
// request: игрок вошёл и просит удалить → запоминаем запрос; у аккаунта с почтой шлём на неё письмо со ссылкой входа,
//          у аккаунта через Telegram/VK (почты нет) подтверждение — повторный вход через тот же сервис.
// status:  есть ли запрос и подтверждён ли он: вход по ссылке из письма (или через Telegram/VK) после запроса, не старше 15 минут.
// delete:  только при запросе не старше суток и свежем подтверждении → стираем данные (purge_player) и самого пользователя.
// cancel:  передумал.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const SITES = ['https://survivefriday.com/', 'https://survivefriday.com/en.html'];
const FRESH = 15 * 60, PENDING = 24 * 3600;

// Как и когда игрок вошёл: amr из токена (сам токен уже проверен getUser)
function signIn(token: string) {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return (p.amr || []) as { method: string; timestamp: number }[];
  } catch { return []; }
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const { action, access_token, redirect } = await req.json();
    const url = Deno.env.get('SUPABASE_URL')!, opts = { auth: { persistSession: false, autoRefreshToken: false } };
    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, opts);
    if (typeof access_token !== 'string' || !access_token) return json({ error: 'no_session' }, 401);
    const { data: { user } } = await db.auth.getUser(access_token);
    if (!user) return json({ error: 'bad_session' }, 401);
    const via = user.email?.match(/@(tg|vk)\.survivefriday\.com$/)?.[1] || 'email';
    const now = Date.now() / 1000;
    const { data: pend } = await db.from('account_deletions').select('requested_at').eq('user_id', user.id).maybeSingle();
    const asked = pend ? new Date(pend.requested_at).getTime() / 1000 : 0, pending = !!pend && now - asked < PENDING;
    // подтверждение — вход по ссылке из письма (или через Telegram/VK) уже после запроса и не старше 15 минут
    const fresh = pending && signIn(access_token).some(a => ['otp', 'magiclink', 'email/signup'].includes(a.method) && a.timestamp >= asked - 5 && now - a.timestamp < FRESH);

    if (action === 'status') return json({ pending, fresh, via });
    if (action === 'cancel') { await db.from('account_deletions').delete().eq('user_id', user.id); return json({ ok: true }); }
    if (action === 'request') {
      await db.from('account_deletions').upsert({ user_id: user.id, requested_at: new Date().toISOString() });
      if (via !== 'email') return json({ ok: true, via });
      const to = SITES.includes(redirect) ? redirect : SITES[0];
      const anon = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, opts);
      const { error } = await anon.auth.signInWithOtp({ email: user.email!, options: { shouldCreateUser: false, emailRedirectTo: to } });
      if (error) return json({ error: /rate|seconds/i.test(error.message) ? 'too_often' : error.message }, 429);
      return json({ ok: true, via });
    }
    if (action === 'delete') {
      if (!pending) return json({ error: 'not_requested' }, 409);
      if (!fresh) return json({ error: 'not_confirmed' }, 403);
      const { error: e1 } = await db.rpc('purge_player', { p_id: user.id });
      if (e1) return json({ error: e1.message }, 500);
      const { error: e2 } = await db.auth.admin.deleteUser(user.id);
      if (e2) return json({ error: e2.message }, 500);
      return json({ ok: true });
    }
    return json({ error: 'bad_action' }, 400);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
