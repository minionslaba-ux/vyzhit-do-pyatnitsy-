// Раз в день (pg_cron, 12:31 по Москве) — напоминание в Telegram тем, кто сам включил его в игре,
// и в группы, где админ написал боту /remind (в группу — с итогами вчерашней недели дня).
// Каждому — не больше одного сообщения в день (last_sent), поэтому лишний вызов ничего не ломает.
// Заблокировали бота или удалили из группы — подписка выключается сама.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const TEXT = {
  ru: ['📅 Неделя дня готова: 25 решений до пятницы, 18:00. Коллеги уже играют — сравним?',
       '🎯 Новые задания дня ждут. Одна неделя — и вы на шаг ближе к повышению.',
       '☕ Обеденный перерыв? Идеальное время дожить до пятницы. Неделя дня уже в игре.',
       '📌 Вас ждёт продолжение истории и новая неделя дня. Кто сегодня продержится дольше?'],
  en: ['📅 Today’s Daily Week is live: 25 decisions until Friday, 6 PM. Your coworkers are already playing — compare?',
       '🎯 Fresh daily quests are waiting. One week closer to that promotion.',
       '☕ Lunch break? Perfect time to make it to Friday. The Daily Week is up.',
       '📌 Your story continues and a new Daily Week is up. Who lasts longest today?'],
};
const GROUP = {
  ru: ['📅 Неделя дня готова! 25 решений до пятницы, 18:00 — одна неделя на всех. Кто из группы продержится дольше?',
       '☕ Обед — время дожить до пятницы. Новая неделя дня уже в игре.',
       '🏢 Офис открыт: новая неделя дня. Сыграйте и сравните результаты с группой.',
       '⏰ Пятница сама себя не дождётся. Неделя дня готова — кто первый?'],
  en: ['📅 The Daily Week is live! 25 decisions until Friday, 6 PM — the same week for everyone. Who here lasts longest?',
       '☕ Lunch break — time to make it to Friday. A new Daily Week is up.',
       '🏢 The office is open: a new Daily Week. Play and compare with the group.',
       '⏰ Friday won’t come by itself. The Daily Week is ready — who’s first?'],
};

Deno.serve(async () => {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  if (!token) return new Response('not configured', { status: 503 });
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const today = new Date().toISOString().slice(0, 10), day = Math.floor(Date.now() / 864e5);
  const send = (body: Record<string, unknown>) => fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const pause = () => new Promise(res => setTimeout(res, 40));  // не больше ~25 сообщений в секунду

  // личные напоминания
  const { data, error } = await db.from('tg_subs').select('player_id, tg_id, lang').eq('enabled', true).or(`last_sent.is.null,last_sent.lt.${today}`).limit(1000);
  if (error) return new Response(error.message, { status: 500 });
  let sent = 0, groups = 0;
  for (const s of data || []) {
    const en = s.lang === 'en', list = en ? TEXT.en : TEXT.ru;
    const r = await send({ chat_id: s.tg_id, text: list[day % list.length],
      reply_markup: { inline_keyboard: [[{ text: en ? '▶ Play' : '▶ Играть', web_app: { url: `https://survivefriday.com/${en ? 'en.html' : ''}` } }]] } });
    if (r.ok) { sent++; await db.from('tg_subs').update({ last_sent: today }).eq('player_id', s.player_id); }
    else if (r.status === 403) await db.from('tg_subs').update({ enabled: false }).eq('player_id', s.player_id);
    await pause();
  }

  // группы: итоги вчерашней недели дня — сколько сыграло и лучший результат
  const { data: gs } = await db.from('tg_groups').select('chat_id, lang').eq('enabled', true).or(`last_sent.is.null,last_sent.lt.${today}`).limit(1000);
  if (gs?.length) {
    const yday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const { count } = await db.from('daily_leaderboard').select('tag', { count: 'exact', head: true }).eq('day', yday);
    const { data: top } = await db.from('daily_leaderboard').select('name, won, step, total').eq('day', yday)
      .order('won', { ascending: false }).order('step', { ascending: false }).order('total', { ascending: false }).order('created_at', { ascending: true }).limit(1);
    const best = top?.[0];
    const recap = (en: boolean) => !count || !best ? '' : '\n\n' + (en
      ? `Yesterday ${count} ${count === 1 ? 'person' : 'people'} played. Best: ${best.name} — ${best.won ? `made it to Friday, ${best.total} pts` : `${best.step} of 25 decisions`}.`
      : `Вчера сыграли: ${count}. Лучший — ${best.name}: ${best.won ? `дожил(а) до пятницы, ${best.total} очков` : `${best.step} из 25 решений`}.`);
    for (const g of gs) {
      const en = g.lang === 'en', list = en ? GROUP.en : GROUP.ru;
      const r = await send({ chat_id: g.chat_id, text: list[day % list.length] + recap(en),
        reply_markup: { inline_keyboard: [[{ text: en ? '▶ Play' : '▶ Играть', url: 'https://t.me/Survivefridaybot?startapp' }]] } });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { groups++; await db.from('tg_groups').update({ last_sent: today }).eq('chat_id', g.chat_id); }
      else if (j.parameters?.migrate_to_chat_id) await db.from('tg_groups').update({ chat_id: j.parameters.migrate_to_chat_id }).eq('chat_id', g.chat_id);  // письмо уйдёт в следующий вызов
      else if (r.status === 403 || /chat not found/i.test(j.description || '')) await db.from('tg_groups').update({ enabled: false }).eq('chat_id', g.chat_id);
      await pause();
    }
  }
  return new Response(JSON.stringify({ sent, groups }), { headers: { 'Content-Type': 'application/json' } });
});
