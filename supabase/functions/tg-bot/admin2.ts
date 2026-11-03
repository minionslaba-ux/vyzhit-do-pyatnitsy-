// Команды разработчика, часть 2: здоровье сайта, ошибки, игроки, модерация чата, ВК, пуши, реклама, разминки.
// Только чтение, кроме /hide, /unprof (модерация) и /msg (личное сообщение игроку — сначала превью с кнопкой).
const SITE = 'https://survivefriday.com/';
const VK_GROUP = 242860183;
const POOLS = ['pool', 'pool2', 'pool3', 'pool_l1a', 'pool_l1b', 'pool_l1c', 'pool_l1d', 'pool_l2a', 'pool_l3a', 'pool_l3b', 'pool_l3c'];
const esc = (s: unknown) => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
const MSK = 3 * 3600e3;
const msk = (t?: string | null) => t ? new Date(new Date(t).getTime() + MSK).toISOString().slice(0, 16).replace('T', ' ') : '—';
const ago = (d: number) => new Date(Date.now() - d * 864e5).toISOString();
const todayMsk = () => new Date(Math.floor((Date.now() + MSK) / 864e5) * 864e5 - MSK).toISOString();
const sidOf = async (id: string) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(id)))].slice(0, 3).map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
const count = (rows: any[], key: (r: any) => string) => Object.entries(rows.reduce((m: Record<string, number>, r) => { const k = key(r); m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
const BRK: Record<number, string> = { 5: 'Пятнашки', 6: 'Последняя печенька', 22: 'Поймай кофе', 24: 'Отбей спам', 28: 'Баскетбол в мусорку', 30: 'Ровно в 18:00', 34: 'Анаграммы', 39: 'Мемори', 41: 'Запомни стол', 43: 'Цветная путаница', 44: 'Бухгалтерия в уме', 45: 'Кто лишний', 49: 'Пупырка' };

export const ADMIN_COMMANDS2 = [
  { command: 'health', description: 'Всё ли работает: сайт, версия, рассылки' },
  { command: 'errors', description: 'Ошибки JS у игроков' },
  { command: 'new', description: 'Новые игроки за сегодня' },
  { command: 'player', description: 'Карточка игрока: /player ID' },
  { command: 'msg', description: 'Написать игроку в Telegram: /msg ID текст' },
  { command: 'chat', description: 'Последние сообщения общего чата' },
  { command: 'hide', description: 'Скрыть / вернуть сообщение: /hide номер' },
  { command: 'reports', description: 'Жалобы на сообщения и профессии' },
  { command: 'unprof', description: 'Сбросить свою профессию игрока: /unprof ID' },
  { command: 'cards', description: 'Самые «убийственные» карточки' },
  { command: 'breaks', description: 'Разминки за 7 дней' },
  { command: 'ads', description: 'Реклама за 7 дней' },
  { command: 'pushes', description: 'Подписчики пушей' },
  { command: 'groups', description: 'Группы Telegram с ботом' },
  { command: 'vk', description: 'ВКонтакте: игроки и посты' },
  { command: 'vkpost', description: 'Пост в группу ВК: /vkpost текст' },
  { command: 'vkqueue', description: 'Очередь постов ВК' },
  { command: 'maxsetup', description: 'Найти канал MAX для автопостов' },
  { command: 'maxwelcome', description: 'Приветствие с кнопкой «Играть» в канал MAX (закрепить)' },
];
export const HELP2 = `

🩺 <b>Сайт и игроки</b>
/health — всё ли работает: сайт, версия, данные, рассылка дня, последние правки
/errors — ошибки JS у игроков за 3 дня
/new — кто пришёл сегодня и откуда
/player ID — карточка игрока (ID — из /find или из профиля в игре)
/msg ID текст — личное сообщение игроку в Telegram (если он входил через Telegram), сначала превью

🛡 <b>Модерация</b>
/chat — последние сообщения общего чата с номерами
/hide номер — скрыть сообщение (повторно — вернуть)
/reports — жалобы на сообщения и на «свою профессию»
/unprof ID — сбросить игроку свою профессию

📈 <b>Аналитика</b>
/cards — на каких карточках чаще всего увольняют
/breaks — какие разминки играют · /ads — показы рекламы
/pushes — подписчики пушей · /groups — группы Telegram · /vk — ВКонтакте

📰 <b>Посты в группу ВК</b> (каждый день в 12:31 выходит пост из очереди, пусто — обычный: Мира, разминка, «Что бы вы выбрали?»; по понедельникам — итоги недели)
/vkpost текст — превью и кнопки «В очередь» / «Сейчас». Картинка: вставьте в текст ссылку на фото из группы (vk.com/photo-242860183_…)
/vkqueue — что в очереди · /vkdel номер — убрать из очереди

💬 <b>MAX</b>
/maxsetup — найти канал MAX, куда добавлен бот (после этого ежедневный пост уходит и туда)
/maxwelcome — опубликовать в канале MAX приветствие с кнопкой «▶ Играть» и закрепить его`;

type Ctx = { db: any; api: (m: string, b?: Record<string, unknown>) => Promise<any>; token: string };

// short_id (6 символов из профиля) → player_id
async function byShort(db: any, sid: string): Promise<any | null> {
  const want = sid.trim().toUpperCase().replace(/[^0-9A-F]/g, '');
  if (want.length < 6) return null;
  const { data } = await db.from('players').select('player_id, name, dept, prof, prof_custom, status, step, created_at, updated_at, feed_off').limit(20000);
  for (const p of data || []) if (await sidOf(p.player_id) === want.slice(0, 6)) return p;
  return null;
}
async function cardTexts(ids: string[]) {
  const out: Record<string, string> = {}; const need = new Set(ids);
  for (const f of POOLS) {
    if (!need.size) break;
    const list = await fetch(`${SITE}data/${f}.json`).then(r => r.json()).catch(() => []);
    for (const c of list) if (need.has(c.id)) { out[c.id] = `${c.who ? c.who + ': ' : ''}${c.text}`; need.delete(c.id); }
  }
  return out;
}

export async function adminCommand2(ctx: Ctx, cmd: string, rest: string, chatId: number, tg: number): Promise<boolean> {
  const { db, api } = ctx;
  const say = (text: string, extra: Record<string, unknown> = {}) => api('sendMessage', { chat_id: chatId, text: text.slice(0, 4000), parse_mode: 'HTML', disable_web_page_preview: true, ...extra });
  switch (cmd) {
    case 'maxsetup': {
      const token = (Deno.env.get('MAX_BOT_TOKEN') || '').trim();
      if (!token) { await say('Нет токена бота MAX (MAX_BOT_TOKEN в секретах Supabase).'); return true; }
      const call = async (path: string) => { for (const h of ['https://platform-api.max.ru', 'https://platform-api2.max.ru']) { try { const r = await fetch(h + path, { headers: { Authorization: token } }); return await r.json(); } catch {} } return { error: 'network' }; };
      const me = await call('/me');
      const up = await call('/updates?limit=100&timeout=0&marker=0&types=bot_added,bot_removed,chat_title_changed');
      const ups: any[] = up?.updates || [];
      let added = 0;
      for (const u of ups) {
        if (u.update_type === 'bot_added' && u.chat_id) { await db.from('max_chats').upsert({ chat_id: u.chat_id, is_channel: !!u.is_channel, enabled: true }); added++; }
        if (u.update_type === 'bot_removed' && u.chat_id) await db.from('max_chats').update({ enabled: false }).eq('chat_id', u.chat_id);
        if (u.update_type === 'chat_title_changed' && u.chat_id) await db.from('max_chats').update({ title: String(u.title || '').slice(0, 100) }).eq('chat_id', u.chat_id);
      }
      // Список каналов API MAX не отдаёт — chat_id приходит только в событиях. Подписываем бота на вебхук max-hook,
      // он сам сохраняет каналы в max_chats. Секрет = как в max-hook/index.ts (из токена бота).
      const hookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/max-hook`;
      const hb = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('max-hook:' + token)));
      const secret = [...hb].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 40);
      let sub: any = { error: 'network' };
      for (const h of ['https://platform-api.max.ru', 'https://platform-api2.max.ru']) {
        try { sub = await (await fetch(h + '/subscriptions', { method: 'POST', headers: { Authorization: token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: hookUrl, update_types: ['bot_added', 'bot_removed', 'chat_title_changed', 'message_created'], secret }) })).json(); break; } catch {}
      }
      const subs = await call('/subscriptions');
      const hooked = (subs?.subscriptions || []).some((x: any) => x.url === hookUrl);
      const { data: rows } = await db.from('max_chats').select('chat_id, is_channel, title, enabled, last_post').order('added_at');
      for (const r of rows || []) if (!r.title) { const c = await call(`/chats/${r.chat_id}`); if (c?.title) { r.title = c.title; await db.from('max_chats').update({ title: String(c.title).slice(0, 100) }).eq('chat_id', r.chat_id); } }
      const list = (rows || []).map((r: any) => `${r.enabled ? '🟢' : '⚪️'} ${r.is_channel ? 'канал' : 'чат'} «${esc(r.title || r.chat_id)}»${r.last_post ? ` · пост ${msk(r.last_post).slice(5)}` : ''}`);
      await say(`💬 <b>MAX</b> · бот: ${esc(me?.name || me?.username || me?.error || '?')}\nСобытий: ${ups.length} · вебхук: ${hooked ? '✅ подключён' : '❌ ' + esc(sub?.message || sub?.error || 'нет')}\n\n${list.length ? list.join('\n') + '\n\nВ каналы 🟢 ежедневный пост уходит вместе с ВК (12:31).' : 'Каналов пока нет. Теперь, когда вебхук подключён: удалите бота из админов канала MAX и добавьте снова (или просто опубликуйте пост в канале), подождите полминуты и повторите /maxsetup.'}`);
      return true;
    }
    case 'maxwelcome': {
      const token = (Deno.env.get('MAX_BOT_TOKEN') || '').trim();
      if (!token) { await say('Нет токена бота MAX (MAX_BOT_TOKEN).'); return true; }
      const { data: chats } = await db.from('max_chats').select('chat_id, title').eq('enabled', true).eq('is_channel', true);
      if (!chats?.length) { await say('Канал MAX не найден — сначала /maxsetup.'); return true; }
      const api = async (path: string, init: RequestInit = {}) => { for (const h of ['https://platform-api.max.ru', 'https://platform-api2.max.ru']) { try { const r = await fetch(h + path, { ...init, headers: { Authorization: token, 'Content-Type': 'application/json' } }); return await r.json(); } catch {} } return { message: 'network' }; };
      const text = '🏢 «Выжить до пятницы» — офисная игра от выгорания\n\n25 решений с понедельника 9:00 до пятницы 18:00: свайп влево или вправо — и держите в балансе Кукуху, Энергию, Босса и Коллег.\n\n☕ 54 мини-игры для перерыва · 🛋️ психолог Мира · 📅 неделя дня — одна на всех\n\nИграть прямо здесь, в MAX, без регистрации — кнопка ниже 👇\n\n🤖 Все персонажи игры вымышлены.';
      const out: string[] = [];
      for (const c of chats) {
        const send = (btn: any) => api(`/messages?chat_id=${c.chat_id}`, { method: 'POST', body: JSON.stringify({ text, attachments: [{ type: 'inline_keyboard', payload: { buttons: [[btn]] } }] }) });
        let r = await send({ type: 'open_app', text: '▶ Играть', web_app: 'se14877440_bot', payload: 'welcome' });
        if (!r?.message?.body?.mid) r = await send({ type: 'link', text: '▶ Играть', url: 'https://survivefriday.com/?utm_source=max' });
        const mid = r?.message?.body?.mid;
        if (!mid) { out.push(`«${esc(c.title || c.chat_id)}»: ❌ ${esc(r?.message || r?.code || 'ошибка')}`); continue; }
        const pin = await api(`/chats/${c.chat_id}/pin`, { method: 'PUT', body: JSON.stringify({ message_id: mid, notify: false }) });
        out.push(`«${esc(c.title || c.chat_id)}»: ✅ опубликовано${pin?.success ? ', закреплено' : ` (закрепить не вышло: ${esc(pin?.message || '')} — закрепите вручную)`}`);
      }
      await say(`💬 <b>Приветствие в MAX</b>\n${out.join('\n')}`); return true;
    }
    case 'vkpost': {
      const raw = rest.trim();
      if (raw.length < 5) { await say('Формат: <code>/vkpost текст поста</code>\nСсылку на игру добавьте в текст. Картинка — ссылка на фото из группы: vk.com/photo-242860183_457239039'); return true; }
      const m = raw.match(/(?:https?:\/\/)?(?:m\.)?vk\.(?:com|ru)\/photo(-?\d+_\d+)/);
      const photo = m ? `photo${m[1]}` : null, text = (m ? raw.replace(m[0], '') : raw).trim().slice(0, 4000);
      const { data: d } = await db.from('admin_drafts').insert({ tg_id: tg, kind: 'vkpost', payload: { text, photo } }).select('id').single();
      const { count } = await db.from('vk_queue').select('id', { head: true, count: 'exact' }).is('posted_at', null);
      await say(`📰 <b>Пост в ВК</b>${photo ? ' · 🖼 с картинкой' : ''}\n\n${esc(text)}\n\n<i>В очереди сейчас: ${count ?? 0}. «В очередь» — выйдет в 12:31 после остальных.</i>`,
        { reply_markup: { inline_keyboard: [[{ text: '🗓 В очередь', callback_data: `adm:${d.id}:queue` }, { text: '🚀 Сейчас', callback_data: `adm:${d.id}:now` }], [{ text: '✖ Отмена', callback_data: `adm:${d.id}:no` }]] } });
      return true;
    }
    case 'vkqueue': {
      const { data } = await db.from('vk_queue').select('id, text, photo, created_at').is('posted_at', null).order('id').limit(20);
      const { data: done } = await db.from('vk_queue').select('id, post_id, posted_at').not('posted_at', 'is', null).order('posted_at', { ascending: false }).limit(3);
      const lines = [`📰 <b>Очередь постов ВК: ${data?.length || 0}</b> (по одному в день в 12:31, кроме понедельника)`];
      (data || []).forEach((q: any, i: number) => lines.push(`${i + 1}. <code>#${q.id}</code>${q.photo ? ' 🖼' : ''} ${esc(q.text.split('\n')[0].slice(0, 80))}`));
      if (done?.length) lines.push('', '<b>Недавно вышли:</b>', ...done.map((q: any) => `#${q.id} — ${msk(q.posted_at).slice(5)} https://vk.com/wall-${VK_GROUP}_${q.post_id}`));
      lines.push('', 'Убрать: /vkdel номер');
      await say(lines.join('\n')); return true;
    }
    case 'vkdel': {
      const id = parseInt(rest.replace('#', ''), 10);
      if (!id) { await say('Формат: <code>/vkdel 5</code> — номер из /vkqueue'); return true; }
      const { data } = await db.from('vk_queue').delete().eq('id', id).is('posted_at', null).select('id');
      await say(data?.length ? `🗑 Пост #${id} убран из очереди.` : 'Такого поста в очереди нет (или он уже вышел).'); return true;
    }
    case 'health': {
      const t0 = Date.now();
      const site = await fetch(SITE, { cache: 'no-store' }).then(r => r.status).catch(() => 0), ms = Date.now() - t0;
      const sw = await fetch(`${SITE}sw.js`, { cache: 'no-store' }).then(r => r.text()).catch(() => '');
      const ver = sw.match(/CACHE\s*=\s*'vdp-(v\d+)'/)?.[1] || '?';
      const pool = await fetch(`${SITE}data/pool.json`).then(r => r.ok ? r.json() : null).then(x => Array.isArray(x) ? x.length : 0).catch(() => 0);
      const en = await fetch(`${SITE}en.html`).then(r => r.status).catch(() => 0);
      const db0 = Date.now(); const { error: dbErr } = await db.from('players').select('player_id', { head: true, count: 'exact' }); const dbMs = Date.now() - db0;
      const { data: g } = await db.from('tg_groups').select('last_sent').eq('enabled', true).order('last_sent', { ascending: false }).limit(1);
      const { data: vk } = await db.from('vk_posts').select('day, post_id').order('day', { ascending: false }).limit(1);
      const { data: ps } = await db.from('push_subs').select('last_sent').order('last_sent', { ascending: false, nullsFirst: false }).limit(1);
      const { count: errs } = await db.from('events').select('id', { head: true, count: 'exact' }).eq('kind', 'js_error').gt('created_at', ago(1));
      const { count: opens } = await db.from('events').select('id', { head: true, count: 'exact' }).eq('kind', 'open').gt('created_at', ago(1));
      const commits = await fetch('https://api.github.com/repos/minionslaba-ux/vyzhit-do-pyatnitsy-/commits?per_page=3', { headers: { 'User-Agent': 'survivefriday-bot', Accept: 'application/vnd.github+json' } }).then(r => r.ok ? r.json() : []).catch(() => []);
      const ok = (b: boolean) => b ? '✅' : '❌';
      const lines = [
        '🩺 <b>Состояние</b>',
        `${ok(site === 200)} Сайт: ${site || 'нет ответа'} за ${ms} мс · версия <b>${ver}</b>`,
        `${ok(en === 200)} Английская версия · ${ok(pool > 0)} карточки (${pool})`,
        `${ok(!dbErr)} База: ${dbErr ? esc(dbErr.message) : `${dbMs} мс`}`,
        `📢 Рассылка дня в Telegram: ${g?.[0]?.last_sent || '—'} · пост ВК: ${vk?.[0]?.day || '—'}`,
        `🔔 Последний пуш: ${msk(ps?.[0]?.last_sent)} МСК`,
        `${(errs ?? 0) > 5 ? '⚠️' : '✅'} Ошибок JS за сутки: ${errs ?? 0} (заходов ${opens ?? 0}) — подробно /errors`,
      ];
      if (Array.isArray(commits) && commits.length) lines.push('', '🛠 <b>Последние правки</b>', ...commits.map((c: any) => `• ${msk(c.commit?.author?.date).slice(5)} — ${esc(String(c.commit?.message || '').split('\n')[0].slice(0, 90))}`));
      await say(lines.join('\n')); return true;
    }
    case 'errors': {
      const { data } = await db.from('events').select('created_at, mode, card_id, detail').eq('kind', 'js_error').gt('created_at', ago(3)).order('id', { ascending: false }).limit(200);
      if (!data?.length) { await say('✅ За 3 дня ошибок JS нет.'); return true; }
      const top = count(data, r => `${r.detail}`).slice(0, 12);
      const vers = count(data, r => r.card_id || '?').slice(0, 4).map(([v, n]) => `${v} — ${n}`).join(', ');
      await say(`🐞 <b>Ошибки JS за 3 дня: ${data.length}</b>\nПо версиям: ${esc(vers)}\nПоследняя: ${msk(data[0].created_at)} МСК (${esc(data[0].mode)})\n\n${top.map(([d, n]) => `• ${n}× <code>${esc(d)}</code>`).join('\n')}\n\n<i>Старые версии обновятся у игроков сами. Если ошибка в новой версии — пришлите её Claude.</i>`);
      return true;
    }
    case 'new': {
      const { data, error } = await db.rpc('dev_users');
      if (error) { await say(`Не получилось: ${esc(error.message)}`); return true; }
      const since = todayMsk();
      const rows = (data || []).filter((u: any) => u.registered && u.registered >= since).sort((a: any, b: any) => a.registered < b.registered ? 1 : -1);
      if (!rows.length) { await say('Сегодня новых игроков пока нет.'); return true; }
      const VIA: Record<string, string> = { email: 'почта', tg: 'Telegram', telegram: 'Telegram', vk: 'VK' };
      await say(`🆕 <b>Новые сегодня: ${rows.length}</b>\n${rows.slice(0, 30).map((u: any) => `• ${msk(u.registered).slice(11)} ${esc(u.name || 'без имени')} — ${esc(u.source || 'сайт')}${u.login_via ? `, вход: ${esc(VIA[u.login_via] || u.login_via)}` : ', гость'}, недель ${Number(u.weeks) || 0}`).join('\n')}`);
      return true;
    }
    case 'player': {
      const p = await byShort(db, rest);
      if (!p) { await say('Не нашёл. Формат: <code>/player A1B2C3</code> — ID из /find или из профиля игрока.'); return true; }
      const id = p.player_id;
      const [{ data: sc }, { data: ev }, { data: pu }, { data: tga }, { data: vka }, { count: pushN }, { count: msgN }] = await Promise.all([
        db.from('scores').select('won, mode').eq('player_id', id).limit(5000),
        db.from('events').select('kind, created_at').eq('player_id', id).order('id', { ascending: false }).limit(300),
        db.from('purchases').select('rub, votes, status, product, ue, created_at, claimed_at').eq('player_id', id).order('created_at', { ascending: false }).limit(10),
        db.from('tg_accounts').select('tg_id').eq('user_id', id).limit(1),
        db.from('vk_accounts').select('vk_id').eq('user_id', id).limit(1),
        db.from('push_subs').select('endpoint', { head: true, count: 'exact' }).eq('player_id', id),
        db.from('messages').select('id', { head: true, count: 'exact' }).eq('player_id', id),
      ]);
      const weeks = sc?.length || 0, won = (sc || []).filter((s: any) => s.won).length;
      const kinds = count(ev || [], r => r.kind).slice(0, 8).map(([k, n]) => `${k} ${n}`).join(', ');
      const paid = (pu || []).filter((x: any) => x.status === 'paid');
      const lines = [
        `👤 <b>${esc(p.name || 'без имени')}</b> · ID ${await sidOf(id)}`,
        `${p.dept ? `Отдел: ${esc(p.dept)} · ` : ''}${p.prof_custom ? `профессия: ${esc(p.prof_custom)}` : ''}`,
        `Пришёл: ${msk(p.created_at)} · был: ${msk(p.updated_at)} МСК · сейчас: ${p.status === 'playing' ? `играет, карточка ${p.step}` : 'в меню'}`,
        `Недель: ${weeks}, до пятницы: ${won} · сообщений в чате: ${msgN ?? 0}`,
        `Вход: ${tga?.length ? 'Telegram ✅ ' : ''}${vka?.length ? 'VK ✅ ' : ''}${!tga?.length && !vka?.length ? 'почта или гость' : ''} · пуши: ${pushN ? 'да' : 'нет'}${p.feed_off ? ' · скрыт из ленты' : ''}`,
        `Покупки: ${paid.length ? paid.map((x: any) => `${x.product || x.ue + ' у.е.'} ${x.rub ? x.rub + ' ₽' : (x.votes || 0) + ' гол.'}${x.claimed_at ? '' : ' ⏳ не зачислено'}`).join('; ') : 'нет'}${(pu || []).length > paid.length ? ` (неоплаченных счетов: ${(pu || []).length - paid.length})` : ''}`,
        `Последние действия: ${esc(kinds) || '—'}`,
      ].filter(Boolean);
      if (paid.some((x: any) => !x.claimed_at)) lines.push('', 'ℹ️ «Не зачислено» — у.е. придут сами, когда игрок откроет игру под своим аккаунтом.');
      await say(lines.join('\n')); return true;
    }
    case 'msg': {
      const m = rest.trim().match(/^(\S+)\s+([\s\S]+)$/);
      if (!m) { await say('Формат: <code>/msg A1B2C3 текст сообщения</code>'); return true; }
      const p = await byShort(db, m[1]);
      if (!p) { await say('Игрок с таким ID не найден.'); return true; }
      const { data: acc } = await db.from('tg_accounts').select('tg_id').eq('user_id', p.player_id).limit(1);
      if (!acc?.length) { await say(`У игрока «${esc(p.name)}» нет входа через Telegram — написать ему из бота нельзя.`); return true; }
      const text = m[2].trim().slice(0, 3000);
      const { data: d } = await db.from('admin_drafts').insert({ tg_id: tg, kind: 'dm', payload: { to: acc[0].tg_id, name: p.name, text } }).select('id').single();
      await say(`✉️ <b>Сообщение игроку «${esc(p.name)}»</b>\n\n${esc(text)}\n\n<i>Придёт от бота с подписью «Команда игры».</i>`, { reply_markup: { inline_keyboard: [[{ text: '✅ Отправить', callback_data: `adm:${d.id}:send` }, { text: '✖ Отмена', callback_data: `adm:${d.id}:no` }]] } });
      return true;
    }
    case 'chat': {
      const { data } = await db.from('messages').select('id, player_id, text, created_at, hidden, gift').eq('channel', 'global').order('id', { ascending: false }).limit(15);
      if (!data?.length) { await say('В общем чате пока пусто.'); return true; }
      const ids = [...new Set(data.map((x: any) => x.player_id))];
      const { data: pl } = await db.from('players').select('player_id, name').in('player_id', ids);
      const nm = Object.fromEntries((pl || []).map((x: any) => [x.player_id, x.name]));
      await say(`💬 <b>Общий чат</b> (скрыть: /hide номер)\n${data.reverse().map((x: any) => `<code>${x.id}</code> ${msk(x.created_at).slice(5)} <b>${esc(nm[x.player_id] || 'Игрок')}</b>${x.hidden ? ' 🚫скрыто' : ''}: ${esc(x.gift ? `🎁 ${x.gift}` : x.text).slice(0, 200)}`).join('\n')}`);
      return true;
    }
    case 'hide': {
      const id = parseInt(rest, 10);
      if (!id) { await say('Формат: <code>/hide 123</code> — номер из /chat. Повторно — вернуть сообщение.'); return true; }
      const { data: m } = await db.from('messages').select('id, hidden, text').eq('id', id).maybeSingle();
      if (!m) { await say('Сообщение не найдено.'); return true; }
      const { error } = await db.from('messages').update({ hidden: !m.hidden }).eq('id', id);
      await say(error ? `Ошибка: ${esc(error.message)}` : `${m.hidden ? '👁 Сообщение возвращено' : '🚫 Сообщение скрыто'}: «${esc(m.text.slice(0, 120))}»`);
      return true;
    }
    case 'reports': {
      const { data: mr } = await db.from('message_reports').select('message_id').gt('created_at', ago(30)).limit(500);
      const { data: tr } = await db.from('title_reports').select('target').gt('created_at', ago(30)).limit(500);
      const lines = ['🚩 <b>Жалобы за 30 дней</b>'];
      const mc = count(mr || [], r => String(r.message_id)).slice(0, 10);
      if (mc.length) {
        const { data: ms } = await db.from('messages').select('id, text, hidden').in('id', mc.map(([k]) => +k));
        const by = Object.fromEntries((ms || []).map((x: any) => [x.id, x]));
        lines.push('', '<b>Сообщения</b> (скрыть: /hide номер; от 3 жалоб скрываются сами)', ...mc.map(([k, n]) => `<code>${k}</code> ${n}× ${by[k]?.hidden ? '🚫' : ''} «${esc((by[k]?.text || '?').slice(0, 100))}»`));
      }
      const tc = count(tr || [], r => r.target).slice(0, 10);
      if (tc.length) {
        const { data: ps } = await db.from('players').select('player_id, name, prof_custom').in('player_id', tc.map(([k]) => k));
        const by = Object.fromEntries((ps || []).map((x: any) => [x.player_id, x]));
        lines.push('', '<b>Своя профессия</b> (сбросить: /unprof ID)');
        for (const [k, n] of tc) lines.push(`${await sidOf(k)} ${n}× ${esc(by[k]?.name || '?')}: «${esc(by[k]?.prof_custom || 'уже сброшено')}»`);
      }
      await say(lines.length > 1 ? lines.join('\n') : '✅ Жалоб нет.'); return true;
    }
    case 'unprof': {
      const p = await byShort(db, rest);
      if (!p) { await say('Формат: <code>/unprof A1B2C3</code>'); return true; }
      const { error } = await db.from('players').update({ prof_custom: null }).eq('player_id', p.player_id);
      await say(error ? `Ошибка: ${esc(error.message)}` : `✅ У игрока «${esc(p.name)}» сброшена профессия «${esc(p.prof_custom || '—')}».`);
      return true;
    }
    case 'cards': {
      const { data } = await db.from('stats_killers').select('card_id, losses').limit(10);
      if (!data?.length) { await say('Пока мало данных.'); return true; }
      const tx = await cardTexts(data.map((x: any) => x.card_id));
      const { data: cs } = await db.from('card_stats').select('card_id, l, r').in('card_id', data.map((x: any) => x.card_id));
      const lr = Object.fromEntries((cs || []).map((x: any) => [x.card_id, x]));
      await say(`💀 <b>На этих карточках чаще всего заканчивается неделя</b>\n${data.map((x: any, i: number) => { const s = lr[x.card_id]; const t = s ? s.l + s.r : 0; return `${i + 1}. ${x.losses}× <code>${esc(x.card_id)}</code> ${esc((tx[x.card_id] || '').slice(0, 110))}${t ? ` (влево ${Math.round(100 * s.l / t)}%)` : ''}`; }).join('\n')}\n\n<i>Если карточка увольняет слишком часто — попросите Claude смягчить её.</i>`);
      return true;
    }
    case 'breaks': {
      const { data } = await db.from('events').select('kind, detail').in('kind', ['break_play', 'break_end']).gt('created_at', ago(7)).limit(5000);
      if (!data?.length) { await say('За 7 дней разминки не открывали.'); return true; }
      const st: Record<string, { p: number; e: number; w: number }> = {};
      for (const r of data) { const n = String(r.detail || '').split(':')[0]; if (!n) continue; const s = st[n] ||= { p: 0, e: 0, w: 0 }; if (r.kind === 'break_play') s.p++; else { s.e++; if (String(r.detail).split(':')[1] === '1') s.w++; } }
      const rows = Object.entries(st).sort((a, b) => (b[1].p + b[1].e) - (a[1].p + a[1].e)).slice(0, 15);
      await say(`☕ <b>Разминки за 7 дней</b> (запуски · доиграли · побед)\n${rows.map(([n, s]) => `№${n}${BRK[+n] ? ' ' + BRK[+n] : ''} — ${s.p} · ${s.e} · ${s.w}`).join('\n')}`);
      return true;
    }
    case 'ads': {
      const { data } = await db.from('events').select('kind, detail').like('kind', 'ad_%').gt('created_at', ago(7)).limit(5000);
      if (!data?.length) { await say('За 7 дней рекламы не было.'); return true; }
      const K: Record<string, string> = { ad_open: 'открыли', ad_render: 'показана', ad_fail: 'не загрузилась', ad_reward: 'досмотрели за награду', ad_forced: 'обязательная', ad_offer: 'предложили' };
      const by = count(data, r => r.kind), place = count(data.filter((r: any) => r.kind === 'ad_open' || r.kind === 'ad_render'), r => String(r.detail || '—').split(':')[0]);
      const n = (k: string) => by.find(([x]) => x === k)?.[1] || 0;
      await say(`📺 <b>Реклама за 7 дней</b>\n${by.map(([k, c]) => `• ${K[k] || k}: ${c}`).join('\n')}\n\nЗаполняемость: ${n('ad_render') + n('ad_fail') ? Math.round(100 * n('ad_render') / (n('ad_render') + n('ad_fail'))) + '%' : '—'}\nГде: ${place.map(([k, c]) => `${esc(k)} ${c}`).join(', ')}\n\n<i>Доход смотрите в кабинете РСЯ (partner.yandex.ru).</i>`);
      return true;
    }
    case 'pushes': {
      const { data } = await db.from('push_subs').select('lang, created_at, last_sent, sent, player_id').limit(20000);
      const all = data || [];
      const fresh = all.filter((x: any) => x.created_at > ago(7)).length, sent = all.reduce((s: number, x: any) => s + (x.sent || 0), 0);
      const { count: tgSubs } = await db.from('tg_subs').select('tg_id', { head: true, count: 'exact' }).eq('enabled', true);
      await say(`🔔 <b>Пуши</b>\nПодписок: ${all.length} (игроков ${new Set(all.map((x: any) => x.player_id)).size}), за 7 дней +${fresh}\nЯзык: ${count(all, r => r.lang || '?').map(([k, n]) => `${k} ${n}`).join(', ') || '—'}\nОтправлено всего: ${sent} · последний: ${msk(all.map((x: any) => x.last_sent).filter(Boolean).sort().pop())} МСК\nРасписание: 09:40, 13:40, 19:40 МСК (не чаще раза в 3 часа и не тем, кто недавно играл)\n\n📱 Напоминания в боте Telegram: ${tgSubs ?? 0}\n\nОтправить: /push или /rpush`);
      return true;
    }
    case 'groups': {
      const { data } = await db.from('tg_groups').select('chat_id, title, lang, enabled, last_sent, main, invite_link').order('created_at', { ascending: true }).limit(100);
      if (!data?.length) { await say('Бот пока ни в одной группе.'); return true; }
      const lines = ['👥 <b>Группы Telegram с ботом</b>'];
      for (const g of data) {
        const n = (await api('getChatMemberCount', { chat_id: g.chat_id })).result;
        lines.push(`${g.enabled ? '🟢' : '⚪️'} ${esc(g.title || g.chat_id)}${g.main ? ' ⭐ основная' : ''} · ${g.lang} · участников ${n ?? '?'} · рассылка ${g.last_sent || '—'}${g.invite_link ? `\n   ${esc(g.invite_link)}` : ''}`);
      }
      lines.push('', '⚪️ — напоминания выключены (/remind в группе включит снова).');
      await say(lines.join('\n')); return true;
    }
    case 'vk': {
      const [{ count: acc }, { count: acc7 }, { count: opens }, { data: posts }] = await Promise.all([
        db.from('vk_accounts').select('vk_id', { head: true, count: 'exact' }),
        db.from('vk_accounts').select('vk_id', { head: true, count: 'exact' }).gt('created_at', ago(7)),
        db.from('events').select('id', { head: true, count: 'exact' }).eq('kind', 'vk_app').gt('created_at', ago(7)),
        db.from('vk_posts').select('day, post_id').order('day', { ascending: false }).limit(5),
      ]);
      const { data: vpay } = await db.from('purchases').select('votes').eq('pay_via', 'vk').eq('status', 'paid').limit(5000);
      await say(`🔵 <b>ВКонтакте</b>\nАккаунтов VK: ${acc ?? 0} (за 7 дней +${acc7 ?? 0})\nЗапусков мини-приложения за 7 дней: ${opens ?? 0}\nОплат голосами: ${vpay?.length || 0} (${(vpay || []).reduce((s: number, x: any) => s + (x.votes || 0), 0)} гол.)\n\n📰 <b>Автопосты</b>\n${(posts || []).map((p: any) => `• ${p.day} — https://vk.com/wall-${VK_GROUP}_${p.post_id}`).join('\n') || 'пока нет'}\n\nГруппа: https://vk.ru/survivefriday · приложение: https://vk.com/app54871699`);
      return true;
    }
  }
  return false;
}

// Кнопки под превью /msg. true — черновик наш и обработан
export async function adminCallback2(ctx: Ctx, d: any, act: string, done: (t: string) => Promise<any>): Promise<boolean> {
  if (d.kind === 'vkpost') {
    const p = d.payload || {};
    if (act === 'queue') {
      const { data, error } = await ctx.db.from('vk_queue').insert({ text: p.text, photo: p.photo, created_by: d.tg_id }).select('id').single();
      await done(error ? `❌ ${esc(error.message)}` : `🗓 Пост #${data.id} в очереди — выйдет в ближайшие дни в 12:31. Очередь: /vkqueue`);
      return true;
    }
    if (act === 'now') {
      const token = Deno.env.get('VK_GROUP_TOKEN') || '', gid = (Deno.env.get('VK_GROUP_ID') || '').replace(/^-/, '');
      if (!token || !gid) { await done('❌ Нет ключа группы ВК (VK_GROUP_TOKEN / VK_GROUP_ID в секретах).'); return true; }
      const post = (extra: Record<string, string>) => fetch('https://api.vk.com/method/wall.post', { method: 'POST', body: new URLSearchParams({ owner_id: `-${gid}`, from_group: '1', message: p.text, ...extra, access_token: token, v: '5.199' }) }).then(x => x.json()).catch(e => ({ error: { error_msg: String(e) } }));
      let r = await post(p.photo ? { attachments: p.photo } : {});
      if (r.error && p.photo) r = await post({});
      if (r.error) { await done(`❌ ВК: ${esc(r.error.error_msg || r.error.error_code)}`); return true; }
      await ctx.db.from('vk_queue').insert({ text: p.text, photo: p.photo, created_by: d.tg_id, posted_at: new Date().toISOString(), post_id: r.response?.post_id ?? null });
      await done(`✅ Опубликовано: https://vk.com/wall-${VK_GROUP}_${r.response?.post_id}`);
      return true;
    }
    return true;
  }
  if (d.kind !== 'dm') return false;
  if (act !== 'send') return true;
  const p = d.payload || {};
  const r = await ctx.api('sendMessage', { chat_id: p.to, text: `✉️ Команда игры «Выжить до пятницы»:\n\n${p.text}`, reply_markup: { inline_keyboard: [[{ text: '▶ Играть', web_app: { url: SITE } }]] } });
  await done(r.ok ? `✅ Сообщение доставлено игроку «${esc(p.name)}».` : `❌ Не доставлено: ${esc(r.description || 'игрок закрыл бота')}`);
  return true;
}
