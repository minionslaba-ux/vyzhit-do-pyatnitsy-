// Рассылка пуш-уведомлений: cron вызывает 3 раза в день (утро, день, вечер по Москве).
// Каждому подписчику — 1–3 уведомления в день: сколько и в какие из трёх слотов, решает хэш (подписка + дата).
// Тексты — data/push_ru.json на сайте (500 общих: утро/день/вечер, пн/ср/пт с бонусом, выходные) и data/push_personal_ru.json
// (500 личных шаблонов с именами персонажа, питомцев, детей — по состоянию, которое сообщает игра), без повторов подряд.
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
    // пн/ср/пт утром — уведомление с бонусом +15 у.е.: ссылка ?bonus=ГГГГММДД (как в рассылке бота, один раз в день)
    const bonusDay = slot === 0 && [1, 3, 5].includes(dow), bonus = bonusDay ? `&bonus=${date.replace(/-/g, '')}` : '';
    const [texts, personal] = await Promise.all([`${SITE}/data/push_ru.json`, `${SITE}/data/push_personal_ru.json`].map(u => fetch(u).then(r => r.json()).catch(() => null)));
    const pool = (lang: string) => {
      if (lang === 'en' || !texts) return EN;
      if (dow === 0 || dow === 6) return texts.weekend;
      if (slot === 0 && dow === 1) return texts.mon;
      if (slot === 0 && dow === 3) return texts.wed;
      if (slot === 0 && dow === 5) return texts.fri;
      return texts[['morning', 'day', 'evening'][slot]];
    };
    const { data: subs } = await db.from('push_subs').select('endpoint, p256dh, auth, player_id, lang, sent, state, state_at').limit(20000);
    // Личное напоминание (6 из 10, если игра сообщила состояние за последние 3 недели): самое актуальное — голодный питомец,
    // просьба персонажа, мечта ребёнка, плохое настроение…; имена подставляются, {а}/{ся} — по полу персонажа
    type St = { hero?: string; g?: string; need?: string; mood?: number; breaks?: number; pet?: string; petHungry?: boolean; kid?: string; kidWant?: string; week?: number; company?: string; bank?: number; certReady?: boolean; streak?: number };
    const personalMsg = (st: St, at: string, seed: number) => {
      if (!personal || !st) return null;
      const age = (Date.now() - new Date(at).getTime()) / 864e5; if (age > 21) return null;
      const c: string[] = [];
      if (st.pet && st.petHungry) c.push('pet_hungry');
      if (st.hero && st.need) c.push('hero_need');
      if (st.kid && st.kidWant) c.push('kid_wish');
      if (st.hero && (st.mood ?? 100) < 35) c.push(st.breaks ? 'breakdown_risk' : 'hero_sad');
      if (age >= 3) c.push('comeback');
      if (st.certReady) c.push('cert_ready');
      if ((st.bank ?? 99) < 5) c.push('money_low');
      if ((st.streak ?? 0) >= 2) c.push('streak');
      const extra = [st.hero && 'hero_miss', st.pet && 'pet_miss', st.kid && 'kid_miss', st.week && st.company && 'career', 'leaderboard'].filter(Boolean) as string[];
      const pick = c.length && seed % 10 < 7 ? c[Math.floor(seed / 10) % Math.min(c.length, 3)] : extra[seed % extra.length];  // чаще — самое срочное
      const list = personal[pick]; if (!list?.length) return null;
      const m = list[(seed >>> 3) % list.length], f = st.g === 'f';
      const fill = (s: string) => s.replace(/\{hero\}/g, st.hero || '').replace(/\{need\}/g, st.need || '').replace(/\{pet\}/g, st.pet || '').replace(/\{kid\}/g, st.kid || '')
        .replace(/\{kidWant\}/g, st.kidWant || '').replace(/\{week\}/g, String(st.week || '')).replace(/\{company\}/g, st.company || '').replace(/\{streak\}/g, String(st.streak || ''))
        .replace(/\{а\}/g, f ? 'а' : '').replace(/\{ся\}/g, f ? 'ась' : 'ся').replace(/\{ла\}/g, f ? 'ла' : 'л');
      return { t: fill(m.t), b: fill(m.b), cat: pick };
    };
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
        const seed = h32(s.endpoint + date + slot), list = pool(s.lang) || EN;
        const pm = s.lang !== 'en' && !bonusDay && seed % 10 < 6 ? personalMsg(s.state, s.state_at, seed >>> 4) : null;  // бонусное утро пн/ср/пт — всегда про бонус
        const m = pm || list[(h32(s.endpoint) + dayNo * 3 + slot) % list.length];
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify({ t: m.t, b: m.b, url: `/?utm_source=push&utm_medium=web&utm_campaign=${pm ? pm.cat : ['morning', 'day', 'evening'][slot]}${s.lang === 'en' ? '' : bonus}` }), { TTL: 6 * 3600, urgency: 'normal' });
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
