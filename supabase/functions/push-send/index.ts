// Рассылка пуш-уведомлений: cron вызывает 3 раза в день (утро, день, вечер по Москве).
// Каждому подписчику — 1–3 уведомления в день: сколько и в какие из трёх слотов, решает хэш (подписка + дата).
// Тексты — data/push_ru.json на сайте (500 штук: утро/день/вечер, пн/ср/пт с бонусом, выходные), без повторов подряд.
// Кто играл в последние 3 часа — не беспокоим. Протухшие подписки (404/410) удаляем.
// Защита: в теле запроса — cron_key из закрытой таблицы push_keys (его подставляет задание cron).
import { createClient } from 'jsr:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const SITE = 'https://survivefriday.com';
const EN = [
  { t: '☕ Monday-proof?', b: 'A new work week is waiting. Keep all four meters in balance.' },
  { t: '📅 Daily Week is live', b: 'Same cards for everyone today — beat your coworkers.' },
  { t: '🧍 Someone misses you', b: 'Your character has a wish. Pop in for a minute.' },
  { t: '🐾 Hungry paws', b: 'Pets need food every week. Don’t forget them!' },
  { t: '🏁 Almost Friday', b: 'Survive one more week and climb the leaderboard.' },
  { t: '📜 Want a raise?', b: 'Pass today’s certification and earn +$0.5 a day.' },
];
const h32 = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

Deno.serve(async req => {
  try {
    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { key, slot: forced, test } = await req.json().catch(() => ({}));
    const { data: k } = await db.from('push_keys').select('pub, priv, cron_key').eq('id', 1).maybeSingle();
    if (!k || key !== k.cron_key) return new Response('forbidden', { status: 403 });
    webpush.setVapidDetails('mailto:support@survivefriday.com', k.pub, k.priv);

    const msk = new Date(Date.now() + 3 * 3600e3), hour = msk.getUTCHours(), dow = msk.getUTCDay(), date = msk.toISOString().slice(0, 10);
    const slot = typeof forced === 'number' ? forced : hour < 12 ? 0 : hour < 17 ? 1 : 2;
    const dayNo = Math.floor(msk.getTime() / 864e5);
    const texts = await fetch(`${SITE}/data/push_ru.json`).then(r => r.json()).catch(() => null);
    const pool = (lang: string) => {
      if (lang === 'en' || !texts) return EN;
      if (dow === 0 || dow === 6) return texts.weekend;
      if (slot === 0 && dow === 1) return texts.mon;
      if (slot === 0 && dow === 3) return texts.wed;
      if (slot === 0 && dow === 5) return texts.fri;
      return texts[['morning', 'day', 'evening'][slot]];
    };
    const { data: subs } = await db.from('push_subs').select('endpoint, p256dh, auth, player_id, lang, sent').limit(20000);
    // кто играл в последние 3 часа
    const { data: act } = await db.from('events').select('player_id').gt('created_at', new Date(Date.now() - 3 * 3600e3).toISOString()).limit(50000);
    const active = new Set((act || []).map(a => a.player_id));
    let sent = 0, skipped = 0, gone = 0;
    const todo = (subs || []).filter(s => {
      if (test) return true;
      const h = h32(s.endpoint + date), n = 1 + h % 3;  // сегодня 1, 2 или 3 уведомления
      const on = n === 3 || (n === 2 ? slot !== (h >>> 4) % 3 : slot === (h >>> 6) % 3);
      if (!on || (s.player_id && active.has(s.player_id))) { skipped++; return false; }
      return true;
    });
    for (let i = 0; i < todo.length; i += 25) {
      await Promise.all(todo.slice(i, i + 25).map(async s => {
        const list = pool(s.lang) || EN, m = list[(h32(s.endpoint) + dayNo * 3 + slot) % list.length];
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify({ t: m.t, b: m.b, url: `/?utm_source=push&utm_medium=web&utm_campaign=${['morning', 'day', 'evening'][slot]}` }), { TTL: 6 * 3600, urgency: 'normal' });
          sent++;
          await db.from('push_subs').update({ last_sent: new Date().toISOString(), sent: (s.sent || 0) + 1 }).eq('endpoint', s.endpoint);
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) { gone++; await db.from('push_subs').delete().eq('endpoint', s.endpoint); }
        }
      }));
    }
    return new Response(JSON.stringify({ slot, dow, total: subs?.length || 0, sent, skipped, gone }), { headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});
