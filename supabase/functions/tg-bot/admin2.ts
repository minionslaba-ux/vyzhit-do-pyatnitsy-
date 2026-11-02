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
/pushes — подписчики пушей · /groups — группы Telegram · /vk — ВКонтакте`;

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
  if (d.kind !== 'dm') return false;
  if (act !== 'send') return true;
  const p = d.payload || {};
  const r = await ctx.api('sendMessage', { chat_id: p.to, text: `✉️ Команда игры «Выжить до пятницы»:\n\n${p.text}`, reply_markup: { inline_keyboard: [[{ text: '▶ Играть', web_app: { url: SITE } }]] } });
  await done(r.ok ? `✅ Сообщение доставлено игроку «${esc(p.name)}».` : `❌ Не доставлено: ${esc(r.description || 'игрок закрыл бота')}`);
  return true;
}
