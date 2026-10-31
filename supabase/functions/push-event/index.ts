// Пуш по событию (вызывает триггер базы push_notify): личное сообщение (dm) или приглашение в офис (invite).
// Получателю — на все его подписки; не чаще одного пуша о сообщениях в 3 минуты (переписка не превращается в шквал).
// Защита — cron_key из закрытой таблицы push_keys (его подставляет триггер).
import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const cut = (s: string, n: number) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n) + ((s || '').length > n ? '…' : '');

Deno.serve(async req => {
  try {
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { key, kind, id } = await req.json().catch(() => ({}));
    const { data: k } = await db.from('push_keys').select('pub, priv, cron_key').eq('id', 1).maybeSingle();
    if (!k || key !== k.cron_key) return new Response('forbidden', { status: 403 });
    webpush.setVapidDetails('mailto:support@survivefriday.com', k.pub, k.priv);

    let to = '', from = '', msg: { t: string; b: string; url: string; en: { t: string; b: string } } | null = null;
    if (kind === 'dm') {
      const { data: m } = await db.from('direct_messages').select('from_player, to_player, text').eq('id', id).maybeSingle();
      if (!m) return new Response('no message', { status: 404 });
      to = m.to_player; from = m.from_player;
      const { data: p } = await db.from('players').select('name').eq('player_id', from).maybeSingle();
      const name = cut(p?.name || 'Игрок', 24);
      msg = { t: `✉️ ${name}`, b: cut(m.text, 110), url: '/?open=dm&utm_source=push&utm_medium=web&utm_campaign=dm', en: { t: `✉️ ${name}`, b: cut(m.text, 110) } };
    } else if (kind === 'invite') {
      const { data: inv } = await db.from('invites').select('from_player, to_player, team_id').eq('id', id).maybeSingle();
      if (!inv) return new Response('no invite', { status: 404 });
      to = inv.to_player; from = inv.from_player;
      const [{ data: p }, { data: t }] = await Promise.all([db.from('players').select('name').eq('player_id', from).maybeSingle(), db.from('teams').select('name').eq('id', inv.team_id).maybeSingle()]);
      const name = cut(p?.name || 'Коллега', 24), team = cut(t?.name || 'офис', 30);
      msg = { t: `🏢 Приглашение в «${team}»`, b: `${name} зовёт тебя в свой офис — играть вместе и соревноваться.`, url: '/?open=invite&utm_source=push&utm_medium=web&utm_campaign=invite',
        en: { t: `🏢 Invite to “${team}”`, b: `${name} invites you to their Office — play together and compete.` } };
    } else return new Response('bad kind', { status: 400 });

    const { data: subs } = await db.from('push_subs').select('endpoint, p256dh, auth, lang, last_event_at').eq('player_id', to);
    const now = Date.now();
    let sent = 0;
    for (const s of subs || []) {
      if (kind === 'dm' && s.last_event_at && now - new Date(s.last_event_at).getTime() < 3 * 60e3) continue;
      const m = s.lang === 'en' ? { ...msg!.en, url: msg!.url } : msg!;
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ t: m.t, b: m.b, url: m.url, tag: kind }), { TTL: 24 * 3600, urgency: 'high' });
        sent++;
        await db.from('push_subs').update({ last_event_at: new Date().toISOString() }).eq('endpoint', s.endpoint);
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await db.from('push_subs').delete().eq('endpoint', s.endpoint);
      }
    }
    return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});
