// Раз в день (pg_cron, 12:31 по Москве) — напоминание в Telegram тем, кто сам включил его в игре,
// и в группы, где админ написал боту /remind: поровну — позвать играть (с итогами вчерашней недели дня) или привлечь новых игроков.
// Каждому — не больше одного сообщения в день (last_sent), поэтому лишний вызов ничего не ломает.
// Заблокировали бота или удалили из группы — подписка выключается сама.
// Разработчикам (dev_admins) — отчёт по игре за вчера, тоже раз в день.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { buildReport, mskDay, reportMarkup, yesterdayTitle } from './report.ts';

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
// Группы: раз в день — привлечь новых игроков или позвать играть, поровну (расписание по дням недели — ниже).
// Русские тексты — по 250 на каждое направление, лежат на сайте: data/bot/recruit_ru.json и data/bot/play_ru.json
// (у «играть» свои наборы для понедельника, пятницы и субботы). Править можно прямо в репозитории — функцию перевыкладывать не нужно.
// Сайт не ответил — берём запасные тексты ниже. Английских пока меньше. Текст выбирается по дате: подряд не повторяются.
const RECRUIT_EN = [
  '📣 Share the game with your coworkers! The more people in the office, the hotter the department leaderboard. The button below sends it to any chat.',
  '🤝 Who from work is missing here? Invite the one who always says “got a minute?” — let them try to make it to Friday.',
  '🏆 Department vs department: the leaderboard counts the average score. Bring your team and leave Accounting behind.',
  '🎁 Every new player who joins via your link earns you +$15 and an item for the week. Find your link in the game: “Invite coworkers and friends”.',
  '☕ Best water-cooler opener: “Which card did you make it to?” Send the game to your coworkers — button below.',
  '👥 The Daily Week is the same for everyone. Play it with coworkers and see who made the bolder calls. Share the game in your work chat.',
  '📲 Got a friend who’s always complaining about deadlines? We made a game about exactly that. Send it — let them survive at least till Wednesday.',
  '🏢 Build your own Office in the game: create it in “My Office” and invite coworkers by link. You get a shared chat and tournaments.',
];
const PLAY_EN = [
  '📅 The Daily Week is live! 25 decisions until Friday, 6 PM — the same week for everyone. Who here lasts longest?',
  '👑 The fight for the crown is on! Who has today’s best Daily Week score? See if you can beat the leader.',
  '☕ Lunch break — time to make it to Friday. A new Daily Week is up.',
  '🎯 Three daily quests are waiting: XP and cash for each, an item for all three. Finish them before midnight.',
  '⏰ Friday won’t come by itself. The Daily Week is ready — who’s first?',
  '🧠 Keep every meter between 20% and 80% and Friday is yours. The Daily Week is waiting.',
];
const PLAY_DOW_EN: Record<number, string> = {
  1: '🗓 It’s Monday — time to start surviving till Friday! The Daily Week is waiting, and the Boss is already typing “got a minute?”.',
  5: '🎉 It’s Friday! 6 PM is within reach. Play the Daily Week and see if you make it to the weekend — at least in the game.',
  6: '🛋 Saturday, the office is closed… except in the game. The Daily Week works weekends — perfect time to beat your record.',
};
const RECRUIT_RU_SPARE = [
  '📣 Поделитесь игрой с коллегами! Чем больше людей в офисе, тем жарче рейтинг отделов. Кнопка ниже отправит игру в любой чат.',
  '🤝 Кого из коллег не хватает в этой группе? Позовите того, кто громче всех говорит «есть минутка?» — пусть попробует дожить до пятницы.',
];
const PLAY_RU_SPARE = [
  '📅 Неделя дня готова! 25 решений до пятницы, 18:00 — одна неделя на всех. Кто из группы продержится дольше?',
  '👑 Борьба за корону началась! Лучший результат недели дня — у кого он сегодня? Проверьте, сможете ли обойти лидера.',
];
const getJson = (name: string) => fetch(`https://survivefriday.com/data/bot/${name}`).then(r => r.ok ? r.json() : null).catch(() => null);
// Текст для группы: day — номер дня с 1970 года, week — номер недели, dow — день недели по Москве (0 — воскресенье)
function groupText(ru: { recruit: string[] | null; play: Record<string, string[]> | null }, en: boolean, recruit: boolean, dow: number, day: number, week: number) {
  if (recruit) { const l = en ? RECRUIT_EN : ru.recruit?.length ? ru.recruit : RECRUIT_RU_SPARE; return l[day % l.length]; }
  if (en) return PLAY_DOW_EN[dow] || PLAY_EN[day % PLAY_EN.length];
  const k = dow === 1 ? 'monday' : dow === 5 ? 'friday' : dow === 6 ? 'saturday' : 'any';
  const l = ru.play?.[k]?.length ? ru.play[k] : PLAY_RU_SPARE;
  return l[(k === 'any' ? day : week) % l.length];
}

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

  // группы: поровну — позвать играть (с итогами вчерашней недели дня: сколько сыграло, лучший результат) или привлечь игроков
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
    const msk = new Date(Date.now() + 3 * 3600e3), dow = msk.getUTCDay();
    // пн, ср, пт — позвать играть; вт, чт, вс — привлечь игроков; суббота — по очереди: за две недели ровно 7 на 7
    const week = Math.floor((day + 3) / 7);  // 1 января 1970 — четверг: так неделя начинается с понедельника
    const recruit = [2, 4, 0].includes(dow) || (dow === 6 && week % 2 === 0);
    const ru = recruit ? { recruit: await getJson('recruit_ru.json'), play: null } : { recruit: null, play: await getJson('play_ru.json') };
    const shareUrl = (en: boolean) => 'https://t.me/share/url?' + new URLSearchParams({ url: 'https://t.me/Survivefridaybot?startapp',
      text: en ? 'Survive till Friday — an office survival game. Can you make it to 6 PM?' : '«Выжить до пятницы» — игра про офис. Доживёшь до 18:00?' });
    for (const g of gs) {
      const en = g.lang === 'en';
      const play = { text: en ? '▶ Play' : '▶ Играть', url: 'https://t.me/Survivefridaybot?startapp' };
      const text = groupText(ru, en, recruit, dow, day, week) + (recruit ? '' : recap(en));
      const keyboard = recruit ? [[{ text: en ? '📣 Share the game' : '📣 Поделиться игрой', url: shareUrl(en) }], [play]] : [[play]];
      const r = await send({ chat_id: g.chat_id, text, reply_markup: { inline_keyboard: keyboard } });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { groups++; await db.from('tg_groups').update({ last_sent: today }).eq('chat_id', g.chat_id); }
      else if (j.parameters?.migrate_to_chat_id) await db.from('tg_groups').update({ chat_id: j.parameters.migrate_to_chat_id }).eq('chat_id', g.chat_id);  // письмо уйдёт в следующий вызов
      else if (r.status === 403 || /chat not found/i.test(j.description || '')) await db.from('tg_groups').update({ enabled: false }).eq('chat_id', g.chat_id);
      await pause();
    }
  }
  // отчёт разработчику за вчера (по Москве), со сравнением с позавчера
  let reports = 0;
  const { data: admins } = await db.from('dev_admins').select('tg_id').or(`last_sent.is.null,last_sent.lt.${today}`);
  if (admins?.length) {
    const text = await buildReport(db, yesterdayTitle(), mskDay(-1), mskDay(0), [mskDay(-2), mskDay(-1)]);
    for (const a of admins) {
      const r = await send({ chat_id: a.tg_id, text, parse_mode: 'HTML', reply_markup: reportMarkup });
      if (r.ok) { reports++; await db.from('dev_admins').update({ last_sent: today }).eq('tg_id', a.tg_id); }
      await pause();
    }
  }
  return new Response(JSON.stringify({ sent, groups, reports }), { headers: { 'Content-Type': 'application/json' } });
});
