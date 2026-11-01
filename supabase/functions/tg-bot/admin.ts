// Команды разработчика в личке бота (только dev_admins). Всё, что уходит людям, сначала показывается превью с кнопками
// «Отправить» / «Отмена» — черновик хранится в admin_drafts. Список команд — /help.
const SITE = 'https://survivefriday.com/';
const APP = 'https://t.me/Survivefridaybot?startapp';
const POOLS = ['pool', 'pool2', 'pool3', 'pool_l1a', 'pool_l1b', 'pool_l1c', 'pool_l1d', 'pool_l2a', 'pool_l3a', 'pool_l3b', 'pool_l3c'];
const esc = (s: string) => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
const mskDate = () => new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);

export const ADMIN_COMMANDS = [
  { command: 'help', description: 'Все команды' },
  { command: 'stats', description: 'Отчёт за сегодня' },
  { command: 'yesterday', description: 'Отчёт за вчера' },
  { command: 'week', description: 'Отчёт за 7 дней' },
  { command: 'online', description: 'Кто сейчас в игре' },
  { command: 'top', description: 'Лучшие игроки недели' },
  { command: 'sales', description: 'Покупки и деньги' },
  { command: 'find', description: 'Найти игрока: /find Имя' },
  { command: 'push', description: 'Пуш всем: /push Заголовок | Текст' },
  { command: 'rpush', description: 'Случайный мотивирующий пуш (1000 вариантов)' },
  { command: 'news', description: 'Новость в группы и чат игры: /news текст' },
  { command: 'event', description: 'Случайная ситуация — опрос в группы' },
  { command: 'broadcast', description: 'Сообщение подписчикам бота: /broadcast текст' },
  { command: 'bonus', description: 'Бонус +15 у.е. в группы' },
  { command: 'pin', description: 'Обновить закреплённое меню групп' },
  { command: 'export', description: 'Игроки в Excel' },
  { command: 'idea', description: 'Что поправить в игре: /idea текст' },
  { command: 'ideas', description: 'Список идей и что с ними сделано' },
];
const HELP = `🛠 <b>Команды разработчика</b>

📊 <b>Статистика</b>
/stats — сегодня · /yesterday — вчера · /week — 7 дней
/online — кто сейчас в игре
/top — лучшие игроки недели дня
/sales — покупки (сегодня и 7 дней)
/find Имя — найти игрока
/export — все игроки в Excel

📣 <b>Рассылки</b> (сначала превью, потом кнопка «Отправить»)
/push Заголовок | Текст — пуш-уведомление всем подписчикам (или только себе для проверки)
/rpush — случайный мотивирующий пуш из 1000 готовых (русский + английский), можно перебрать «🎲 Другой»
/news текст — новость в Telegram-группы и/или в общий чат игры
/event — случайная офисная ситуация из игры как опрос в группы
/broadcast текст — личное сообщение всем, кто включил напоминания в боте
/bonus — кнопка «Играть и получить 15 у.е.» в группы (бонус на сегодня)
/pin — обновить закреплённое быстрое меню в группах

🕵️ <b>Игра в группах</b>
/mafia — «Крот в офисе» (мафия по-офисному, 5–12 игроков, роли в личке бота) · /mafia_stop — остановить (админ группы или тот, кто начал)

🛠 <b>Правки игры</b>
/idea текст — что поправить или добавить в игре. Каждый день в 03:17 МСК Claude разбирает новые идеи, правит игру и присылает сюда отчёт
/ideas — последние идеи и что с ними сделано`;

type Ctx = { db: any; api: (m: string, b?: Record<string, unknown>) => Promise<any>; token: string };

async function draft(ctx: Ctx, tg: number, kind: string, payload: unknown) {
  const { data } = await ctx.db.from('admin_drafts').insert({ tg_id: tg, kind, payload }).select('id').single();
  return data?.id as number;
}
const kb = (rows: [string, string][][]) => ({ inline_keyboard: rows.map(r => r.map(([text, callback_data]) => ({ text, callback_data }))) });

async function randomCard() {
  const f = POOLS[Math.floor(Math.random() * POOLS.length)];
  const list = await fetch(`${SITE}data/${f}.json`).then(r => r.json()).catch(() => []);
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
}
async function groups(ctx: Ctx) { return ((await ctx.db.from('tg_groups').select('chat_id').eq('enabled', true).limit(500)).data || []) as { chat_id: number }[]; }
const pause = (ms: number) => new Promise(r => setTimeout(r, ms));

const IDEA_ST: Record<string, string> = { new: '🆕 ждёт', in_progress: '⏳ в работе', done: '✅ сделано', skipped: '⏭ не взято', question: '❓ нужен ответ' };

// Команда в личке. true — команда разработчика обработана
export async function adminCommand(ctx: Ctx, cmd: string, rest: string, chatId: number, tg: number): Promise<boolean> {
  const { db, api } = ctx;
  const say = (text: string, extra: Record<string, unknown> = {}) => api('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true, ...extra });
  switch (cmd) {
    case 'help': await say(HELP); return true;
    case 'online': {
      const { data } = await db.from('participants').select('name, dept, status, step, updated_at').gt('updated_at', new Date(Date.now() - 5 * 60e3).toISOString()).order('updated_at', { ascending: false }).limit(30);
      const rows = (data || []).map((p: any) => `• ${esc(p.name)}${p.dept ? ` (${esc(p.dept)})` : ''} — ${p.status === 'playing' ? `играет, карточка ${p.step ?? '?'}` : 'в меню'}`);
      await say(rows.length ? `🟢 <b>Сейчас в игре: ${rows.length}</b>\n${rows.join('\n')}` : '😴 Сейчас никого нет в игре.'); return true;
    }
    case 'top': {
      const { data } = await db.from('daily_leaderboard').select('name, dept, won, step, total').eq('day', mskDate()).order('won', { ascending: false }).order('step', { ascending: false }).order('total', { ascending: false }).limit(10);
      const rows = (data || []).map((r: any, i: number) => `${i + 1}. ${esc(r.name)}${r.dept ? ` · ${esc(r.dept)}` : ''} — ${r.won ? `дожил(а) до пятницы, ${r.total} очк.` : `${r.step}/25`}`);
      await say(rows.length ? `🏆 <b>Неделя дня ${mskDate()}</b>\n${rows.join('\n')}` : 'Сегодня неделю дня ещё никто не сыграл.'); return true;
    }
    case 'sales': {
      const since = (d: number) => new Date(Date.now() - d * 864e5).toISOString();
      const sum = async (d: number) => { const { data } = await db.from('purchases').select('rub, status, product').gt('created_at', since(d)); const paid = (data || []).filter((x: any) => x.status === 'paid'); return { n: (data || []).length, paid: paid.length, rub: paid.reduce((s: number, x: any) => s + x.rub, 0) }; };
      const [a, b] = [await sum(1), await sum(7)];
      await say(`💰 <b>Покупки</b>\nЗа сутки: оплачено ${a.paid} из ${a.n} счетов, ${a.rub} ₽\nЗа 7 дней: оплачено ${b.paid} из ${b.n}, ${b.rub} ₽`); return true;
    }
    case 'find': {
      if (rest.length < 2) { await say('Напишите имя: /find Вика'); return true; }
      const { data } = await db.from('participants').select('name, dept, short_id, games, wins, updated_at, prof_custom').ilike('name', `%${rest.replace(/[%_]/g, '')}%`).limit(10);
      const rows = (data || []).map((p: any) => `• <b>${esc(p.name)}</b> · ID ${p.short_id}${p.dept ? ` · ${esc(p.dept)}` : ''}${p.prof_custom ? ` · ${esc(p.prof_custom)}` : ''}\n   недель ${p.games}, побед ${p.wins}, был(а) ${new Date(new Date(p.updated_at).getTime() + 3 * 3600e3).toISOString().slice(0, 16).replace('T', ' ')} МСК`);
      await say(rows.length ? rows.join('\n') : 'Никого не нашёл.'); return true;
    }
    case 'push': {
      const [t, ...b] = rest.split('|');
      if (!t?.trim() || !b.join('|').trim()) { await say('Формат: <code>/push Заголовок | Текст уведомления</code>'); return true; }
      const p = { t: t.trim().slice(0, 80), b: b.join('|').trim().slice(0, 200) };
      const { count } = await db.from('push_subs').select('endpoint', { count: 'exact', head: true });
      const id = await draft(ctx, tg, 'push', p);
      await say(`🔔 <b>Превью пуша</b>\n\n<b>${esc(p.t)}</b>\n${esc(p.b)}\n\nПодписчиков: ${count ?? 0}`, { reply_markup: kb([[[`✅ Отправить всем (${count ?? 0})`, `adm:${id}:all`]], [['🧪 Только мне', `adm:${id}:me`], ['✖ Отмена', `adm:${id}:no`]]]) });
      return true;
    }
    case 'rpush': {
      const list = await fetch(`${SITE}data/bot/push.json`).then(r => r.json()).catch(() => []);
      if (!list.length) { await say('Не удалось загрузить тексты пушей.'); return true; }
      const i = Math.floor(Math.random() * list.length), x = list[i];
      const p = { t: x.t, b: x.b, en: { t: x.et, b: x.eb }, rnd: true };
      const { count } = await db.from('push_subs').select('endpoint', { count: 'exact', head: true });
      const id = await draft(ctx, tg, 'push', p);
      await say(`🎲 <b>Случайный пуш</b> № ${i + 1} из ${list.length}\n\n<b>${esc(p.t)}</b>\n${esc(p.b)}\n\n🇬🇧 <b>${esc(p.en.t)}</b>\n${esc(p.en.b)}\n\nПодписчиков: ${count ?? 0}`,
        { reply_markup: kb([[[`✅ Отправить всем (${count ?? 0})`, `adm:${id}:all`]], [['🎲 Другой', `adm:${id}:again`], ['🧪 Только мне', `adm:${id}:me`]], [['✖ Отмена', `adm:${id}:no`]]]) });
      return true;
    }
    case 'news': {
      if (!rest.trim()) { await say('Формат: <code>/news текст новости</code>'); return true; }
      const id = await draft(ctx, tg, 'news', { text: rest.trim().slice(0, 3500) });
      await say(`📰 <b>Превью новости</b>\n\n${esc(rest.trim())}`, { reply_markup: kb([[['📢 В группы', `adm:${id}:groups`], ['💬 В чат игры', `adm:${id}:game`]], [['📢 + 💬 Везде', `adm:${id}:both`], ['✖ Отмена', `adm:${id}:no`]]]) });
      return true;
    }
    case 'event': {
      const c = await randomCard();
      if (!c) { await say('Не удалось загрузить карточки с сайта.'); return true; }
      const q = { question: `${c.who ? c.who + ': ' : ''}${c.text}`.slice(0, 290), a: c.answers.left.label.slice(0, 100), b: c.answers.right.label.slice(0, 100) };
      const id = await draft(ctx, tg, 'event', q);
      await say(`🎲 <b>Случайная ситуация</b>\n\n${esc(q.question)}\n\n◀ ${esc(q.a)}\n▶ ${esc(q.b)}`, { reply_markup: kb([[['📊 Опрос в группы', `adm:${id}:poll`], ['🔄 Другая', `adm:${id}:again`]], [['✖ Отмена', `adm:${id}:no`]]]) });
      return true;
    }
    case 'broadcast': {
      if (!rest.trim()) { await say('Формат: <code>/broadcast текст</code> — уйдёт всем, кто включил напоминания в боте.'); return true; }
      const { count } = await db.from('tg_subs').select('tg_id', { count: 'exact', head: true }).eq('enabled', true);
      const id = await draft(ctx, tg, 'broadcast', { text: rest.trim().slice(0, 3500) });
      await say(`✉️ <b>Превью рассылки</b>\n\n${esc(rest.trim())}\n\nПолучателей: ${count ?? 0}`, { reply_markup: kb([[[`✅ Отправить (${count ?? 0})`, `adm:${id}:send`], ['✖ Отмена', `adm:${id}:no`]]]) });
      return true;
    }
    case 'bonus': {
      const id = await draft(ctx, tg, 'bonus', { day: mskDate().replace(/-/g, '') });
      await say('🎁 Отправить в группы кнопку «Играть и получить 15 у.е.»? Бонус действует сегодня, каждый игрок получит его один раз.', { reply_markup: kb([[['✅ Отправить', `adm:${id}:send`], ['✖ Отмена', `adm:${id}:no`]]]) });
      return true;
    }
    case 'idea': {
      const t = rest.trim();
      if (t.length < 3) { await say('Напишите, что поправить: <code>/idea на главной слишком мелкий шрифт у цитаты</code>\nЧем конкретнее (где, что не так, как должно быть), тем точнее правка.'); return true; }
      const { data, error } = await db.from('dev_ideas').insert({ tg_id: tg, text: t.slice(0, 3000) }).select('id').single();
      if (error) { await say(`Не сохранилось: ${esc(error.message)}`); return true; }
      const { count } = await db.from('dev_ideas').select('id', { count: 'exact', head: true }).eq('status', 'new');
      await say(`📝 Идея №${data.id} записана. В очереди: ${count ?? 1}.\nClaude разберёт её сегодня ночью (03:17 МСК) и пришлёт отчёт сюда. Срочно — напишите в сессию Claude «посмотри идеи из бота».`);
      return true;
    }
    case 'ideas': {
      const { data } = await db.from('dev_ideas').select('id, text, status, reply, created_at').order('id', { ascending: false }).limit(15);
      const rows = (data || []).map((x: any) => `№${x.id} ${IDEA_ST[x.status] || x.status} — ${esc(x.text.slice(0, 120))}${x.reply ? `\n   ↳ ${esc(x.reply.slice(0, 200))}` : ''}`);
      await say(rows.length ? `🛠 <b>Идеи</b>\n${rows.join('\n')}` : 'Идей пока нет. Напишите /idea текст.'); return true;
    }
    case 'pin': {
      const code = crypto.randomUUID().replace(/-/g, '');
      await db.from('bot_test_tokens').insert({ token: code });
      const r = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/tg-pin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) }).then(x => x.json()).catch(e => ({ error: String(e) }));
      await say(`📌 Быстрое меню в группах: <code>${esc(JSON.stringify(r))}</code>`); return true;
    }
  }
  return false;
}

// Нажатие кнопки под превью
export async function adminCallback(ctx: Ctx, cq: any) {
  const { db, api } = ctx;
  const m = String(cq.data || '').match(/^adm:(\d+):(\w+)$/); if (!m) return;
  const tg = cq.from?.id, chatId = cq.message?.chat?.id;
  const { data: admin } = await db.from('dev_admins').select('tg_id').eq('tg_id', tg).maybeSingle();
  if (!admin) return api('answerCallbackQuery', { callback_query_id: cq.id, text: 'Только для разработчика' });
  const { data: d } = await db.from('admin_drafts').select('*').eq('id', +m[1]).eq('tg_id', tg).maybeSingle();
  const done = (text: string) => api('editMessageReplyMarkup', { chat_id: chatId, message_id: cq.message.message_id, reply_markup: { inline_keyboard: [] } })
    .then(() => api('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' }));
  if (!d) return api('answerCallbackQuery', { callback_query_id: cq.id, text: 'Черновик уже отправлен или устарел' });
  const act = m[2];
  await api('answerCallbackQuery', { callback_query_id: cq.id, text: act === 'no' ? 'Отменено' : 'Отправляю…' });
  if (act === 'again' && d.kind === 'push') { await db.from('admin_drafts').delete().eq('id', d.id); await api('editMessageReplyMarkup', { chat_id: chatId, message_id: cq.message.message_id, reply_markup: { inline_keyboard: [] } }); return adminCommand(ctx, 'rpush', '', chatId, tg); }
  if (act === 'again' && d.kind === 'event') { await db.from('admin_drafts').delete().eq('id', d.id); await done('🔄 Ищу другую…'); return adminCommand(ctx, 'event', '', chatId, tg); }
  await db.from('admin_drafts').delete().eq('id', d.id);  // один черновик — одна отправка
  if (act === 'no') return done('✖ Отменено.');
  const p = d.payload || {};
  if (d.kind === 'push') {
    const { data: k } = await db.from('push_keys').select('cron_key').eq('id', 1).maybeSingle();
    let only: string[] | undefined;
    if (act === 'me') { only = ((await db.from('tg_accounts').select('user_id').eq('tg_id', tg)).data || []).map((x: any) => x.user_id); if (!only.length) return done('Ваш Telegram не привязан к аккаунту игры — войдите в игру через Telegram и включите уведомления.'); }
    const r = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/push-send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: k?.cron_key, custom: { t: p.t, b: p.b, ...(p.en ? { en: p.en } : {}), ...(p.rnd ? { url: '/?utm_source=push&utm_medium=web&utm_campaign=rpush' } : {}) }, only_players: only }) }).then(x => x.json()).catch(e => ({ error: String(e) }));
    return done(r.error ? `❌ ${esc(r.error)}` : `✅ Пуш отправлен: ${r.sent} из ${r.total}${r.gone ? `, удалено устаревших подписок: ${r.gone}` : ''}.`);
  }
  if (d.kind === 'news') {
    let g = 0, game = '';
    if (act === 'groups' || act === 'both') for (const x of await groups(ctx)) { const r = await api('sendMessage', { chat_id: x.chat_id, text: p.text, reply_markup: { inline_keyboard: [[{ text: '▶ Играть · Play', url: APP }]] } }); if (r.ok) g++; await pause(1100); }
    if (act === 'game' || act === 'both') {
      const { data: acc } = await db.from('tg_accounts').select('user_id').eq('tg_id', tg).maybeSingle();
      if (!acc) game = ' В чат игры не отправлено: ваш Telegram не привязан к аккаунту игры.';
      else { const { error } = await db.from('messages').insert({ channel: 'global', player_id: acc.user_id, text: ('📢 ' + p.text).slice(0, 300) }); game = error ? ` Чат игры: ошибка ${esc(error.message)}.` : ' В общий чат игры отправлено.'; }
    }
    return done(`✅ Новость: групп — ${g}.${game}`);
  }
  if (d.kind === 'event' && act === 'poll') {
    let g = 0;
    for (const x of await groups(ctx)) {
      const r = await api('sendPoll', { chat_id: x.chat_id, question: p.question, options: [{ text: p.a }, { text: p.b }], is_anonymous: true,
        reply_markup: { inline_keyboard: [[{ text: '▶ Сыграть такую неделю · Play', url: APP }]] } });
      if (r.ok) g++; await pause(1100);
    }
    return done(`✅ Опрос отправлен в групп: ${g}.`);
  }
  if (d.kind === 'broadcast') {
    const { data: subs } = await db.from('tg_subs').select('tg_id, player_id').eq('enabled', true).limit(5000);
    let n = 0;
    for (const s of subs || []) {
      const r = await api('sendMessage', { chat_id: s.tg_id, text: p.text, reply_markup: { inline_keyboard: [[{ text: '▶ Играть', web_app: { url: SITE } }]] } });
      if (r.ok) n++; else if (r.error_code === 403) await db.from('tg_subs').update({ enabled: false }).eq('player_id', s.player_id);
      await pause(45);
    }
    return done(`✅ Рассылка: доставлено ${n} из ${subs?.length || 0}.`);
  }
  if (d.kind === 'bonus') {
    let g = 0;
    for (const x of await groups(ctx)) {
      const r = await api('sendMessage', { chat_id: x.chat_id, text: '🎁 Бонус дня: сыграйте сегодня по кнопке ниже — +15 у.е. на счёт.\n🎁 Today’s bonus: play via the button below — +$15.', reply_markup: { inline_keyboard: [[{ text: '🎁 Играть и получить 15 у.е. · Play', url: `${APP}=bonus-${p.day}` }]] } });
      if (r.ok) g++; await pause(1100);
    }
    return done(`✅ Бонус отправлен в групп: ${g}.`);
  }
}
