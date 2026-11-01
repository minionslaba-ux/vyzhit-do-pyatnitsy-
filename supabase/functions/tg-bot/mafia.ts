// «Крот в офисе» / "The office mole" — игра в стиле «Мафии» в Telegram-группах.
// Группа: /mafia — набор игроков (кнопка «Присоединиться» = ссылка t.me/Survivefridaybot?start=maf_<id>, в личке бот регистрирует игрока),
// /mafia_stop — остановить (админ группы или тот, кто начал). Кнопки — callback_data с префиксом "maf:".
// Роли: Крот (1 на 4 игроков), HR-детектив, Профсоюз, Сотрудники. Ночь — действия в личке, день — обсуждение и голосование в группе.
// Таймеры: tg-bot?mafia_tick=1 (pg_cron раз в минуту, ключ cron_key) двигает фазы, у которых вышло время; фаза двигается и сразу,
// когда все сходили / проголосовали. Состояние — таблицы mafia_games, mafia_players (supabase/update-2026-11-02-mafia.sql).

// ================= LOGIC (чистые функции, без сети — проверяются тестом) =================
export type Role = 'mole' | 'detective' | 'union' | 'staff';
export type MP = {
  tg_id: number; name: string; role: Role | null; alive: boolean;
  night_target?: number | null; night_at?: string | null; voted_for?: number | null; last_protect?: number | null;
};
export const MIN_PLAYERS = 5, MAX_PLAYERS = 12;
export const moleCount = (n: number) => Math.max(1, Math.floor(n / 4));  // 5–7 → 1, 8–11 → 2, 12 → 3

export function assignRoles(ids: number[], rnd: () => number = Math.random): Map<number, Role> {
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  const k = moleCount(a.length), out = new Map<number, Role>();
  a.forEach((id, i) => out.set(id, i < k ? 'mole' : i === k ? 'detective' : i === k + 1 ? 'union' : 'staff'));
  return out;
}

// 'staff' — кротов не осталось; 'moles' — кротов не меньше, чем остальных
export function winner(ps: MP[]): 'moles' | 'staff' | null {
  const alive = ps.filter(p => p.alive), moles = alive.filter(p => p.role === 'mole').length;
  if (moles === 0) return 'staff';
  if (moles >= alive.length - moles) return 'moles';
  return null;
}

const NIGHT_ROLES: Role[] = ['mole', 'detective', 'union'];
export const actsAtNight = (p: MP) => p.alive && !!p.role && NIGHT_ROLES.includes(p.role);

// кого может выбрать игрок этой ночью
export function nightOptions(ps: MP[], actor: MP): number[] {
  const alive = ps.filter(p => p.alive);
  if (actor.role === 'mole') return alive.filter(p => p.role !== 'mole').map(p => p.tg_id);
  if (actor.role === 'detective') return alive.filter(p => p.tg_id !== actor.tg_id).map(p => p.tg_id);
  if (actor.role === 'union') return alive.filter(p => p.tg_id !== actor.last_protect).map(p => p.tg_id);
  return [];
}

export const nightDone = (ps: MP[]) => ps.filter(actsAtNight).every(p => p.night_target != null);

// решение кротов: большинство; при равенстве — цель того, кто выбрал раньше
export function moleChoice(ps: MP[]): number | null {
  const picks = ps.filter(p => p.alive && p.role === 'mole' && p.night_target != null)
    .filter(p => ps.some(t => t.tg_id === p.night_target && t.alive && t.role !== 'mole'))
    .sort((a, b) => String(a.night_at || '').localeCompare(String(b.night_at || '')));
  if (!picks.length) return null;
  const n = new Map<number, number>();
  for (const p of picks) n.set(p.night_target!, (n.get(p.night_target!) || 0) + 1);
  const top = Math.max(...n.values());
  return picks.find(p => n.get(p.night_target!) === top)!.night_target!;
}

export function resolveNight(ps: MP[]): { target: number | null; fired: number | null; saved: boolean } {
  const target = moleChoice(ps);
  if (target == null) return { target: null, fired: null, saved: false };
  const saved = ps.some(p => p.alive && p.role === 'union' && p.night_target === target);
  return { target, fired: saved ? null : target, saved };
}

export const voteDone = (ps: MP[]) => ps.filter(p => p.alive).every(p => p.voted_for != null);

// голосование: больше всех голосов и строго больше, чем у соседа и у «воздержаться» (0); иначе никого
export function tallyVotes(ps: MP[]): { out: number | null; counts: Map<number, number> } {
  const counts = new Map<number, number>();
  for (const p of ps) if (p.alive && p.voted_for != null) counts.set(p.voted_for, (counts.get(p.voted_for) || 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked.length || ranked[0][0] === 0 || (ranked[1] && ranked[1][1] === ranked[0][1])) return { out: null, counts };
  return { out: ranked[0][0], counts };
}
// ================= /LOGIC =================

type Ctx = { db: any; api: (m: string, b?: Record<string, unknown>) => Promise<any> };
type L = 'ru' | 'en';
type Game = { id: number; chat_id: number; lang: L; status: string; sub: string | null; seq: number; phase_ends_at: string | null; day_no: number; starter_tg: number | null; lobby_msg_id: number | null; vote_msg_id: number | null; created_at: string };

const BOT = 'Survivefridaybot';
const LOBBY_MS = 10 * 60e3, NIGHT_MS = 90e3, TALK_MS = 120e3, VOTE_MS = 90e3, MAX_AGE_MS = 3 * 3600e3;
const esc = (s: string) => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!));
const at = (ms: number) => new Date(Date.now() + ms).toISOString();
const langOf = (code?: string): L => code && !/^(ru|uk|be|kk)/.test(code) ? 'en' : 'ru';
// текст в группу: английской группе — по-английски, русской — по-русски + короткая строка для иностранцев
const G = (l: L, ru: string, en: string, hint?: string) => l === 'en' ? en : ru + (hint ? `\n<i>🇬🇧 ${hint}</i>` : '');
const t2 = (l: L, ru: string, en: string) => l === 'en' ? en : ru;

const ROLE: Record<L, Record<Role, string>> = {
  ru: { mole: '🕵️ Крот', detective: '🔎 HR-детектив', union: '🛡 Профсоюз', staff: '👔 Сотрудник' },
  en: { mole: '🕵️ Mole', detective: '🔎 HR detective', union: '🛡 Union rep', staff: '👔 Employee' },
};
const ROLE_ABOUT: Record<L, Record<Role, string>> = {
  ru: {
    mole: 'Вы тайно сливаете начальству всё — от опозданий до печенек из переговорки. Каждую ночь кроты выбирают, кого подставить, — и человека увольняют. Днём делайте вид, что вы самый преданный сотрудник. Кроты побеждают, когда их не меньше, чем остальных.',
    detective: 'Каждую ночь вы проверяете личное дело одного коллеги и узнаёте: крот или нет. Днём помогите офису вычислить кротов — но аккуратно, кроты тоже не спят.',
    union: 'Каждую ночь вы берёте одного коллегу под защиту — его не уволят. Себя тоже можно. Одного и того же — не две ночи подряд.',
    staff: 'Ночью вы спите (или доделываете отчёт). Днём слушайте, спорьте и голосуйте — отправьте кротов на служебное расследование.',
  },
  en: {
    mole: 'You secretly leak everything to the boss — from late arrivals to the meeting-room cookies. Each night the moles pick someone to get fired. By day, act like the most loyal employee. Moles win once they equal or outnumber everyone else.',
    detective: 'Each night you check one colleague’s file and learn whether they are a mole. By day, help the office find the moles — carefully, the moles are awake too.',
    union: 'Each night you protect one colleague — they can’t be fired that night. You may protect yourself. Not the same person two nights in a row.',
    staff: 'At night you sleep (or finish that report). By day, listen, argue and vote to send the moles to an internal investigation.',
  },
};
const FIRED: Record<L, ((n: string) => string)[]> = {
  ru: [
    n => `📄 ${n} получает приказ об увольнении «в связи с оптимизацией». Кактус с подоконника — на память.`,
    n => `🚪 Пропуск ${n} больше не открывает турникет: сокращение штата.`,
    n => `📦 На столе ${n} — коробка с вещами и записка от начальства: «Спасибо за всё». Увольнение.`,
  ],
  en: [
    n => `📄 ${n} gets a dismissal notice “due to optimisation”. The desk cactus goes too, as a keepsake.`,
    n => `🚪 ${n}’s pass no longer opens the turnstile: headcount reduction.`,
    n => `📦 A box of belongings and a note from the boss on ${n}’s desk: “Thanks for everything.” Dismissed.`,
  ],
};

// ---------- база ----------
async function getGame(ctx: Ctx, id: number): Promise<Game | null> {
  return (await ctx.db.from('mafia_games').select('*').eq('id', id).maybeSingle()).data;
}
async function activeGame(ctx: Ctx, chatId: number): Promise<Game | null> {
  return (await ctx.db.from('mafia_games').select('*').eq('chat_id', chatId).neq('status', 'finished').maybeSingle()).data;
}
async function players(ctx: Ctx, gid: number): Promise<MP[]> {
  return (await ctx.db.from('mafia_players').select('*').eq('game_id', gid).order('joined_at')).data || [];
}
// переход фазы только если её никто не сдвинул раньше (seq)
async function cas(ctx: Ctx, g: Game, patch: Record<string, unknown>): Promise<Game | null> {
  const { data } = await ctx.db.from('mafia_games').update({ ...patch, seq: g.seq + 1, updated_at: new Date().toISOString() })
    .eq('id', g.id).eq('seq', g.seq).select().maybeSingle();
  return data;
}
async function chatAdmin(ctx: Ctx, chatId: number, tg: number) {
  const r = await ctx.api('getChatMember', { chat_id: chatId, user_id: tg });
  return ['creator', 'administrator'].includes(r?.result?.status);
}
const send = (ctx: Ctx, chat: number, text: string, markup?: unknown) =>
  ctx.api('sendMessage', { chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true, ...(markup ? { reply_markup: markup } : {}) });
const nameOf = (ps: MP[], id: number | null | undefined) => esc(ps.find(p => p.tg_id === id)?.name || '?');
const pl = (p: MP): L => (p as any).lang === 'en' ? 'en' : 'ru';

// ---------- лобби ----------
function lobbyText(g: Game, ps: MP[]) {
  const l = g.lang, list = ps.map(p => `• ${esc(p.name)}`).join('\n');
  const left = Math.max(1, Math.round((new Date(g.phase_ends_at || 0).getTime() - Date.now()) / 60e3));
  return G(l,
    `🕵️ <b>Крот в офисе</b>\nВ офисе завёлся крот: сливает начальству всё подряд. Найдите его до пятницы!\n\nРоли: кроты, HR-детектив, профсоюз и честные сотрудники. Ночью — тайные действия в личке бота, днём — обсуждение и голосование здесь.\n\nНажмите «Присоединиться» — откроется чат с ботом, там нажмите «Старт».\n\n👥 Игроков: <b>${ps.length}</b>/${MAX_PLAYERS} (нужно от ${MIN_PLAYERS})${list ? '\n' + list : ''}\n\n⏳ Набор — ещё ~${left} мин.`,
    `🕵️ <b>The office mole</b>\nThere’s a mole in the office leaking everything to the boss. Find them before Friday!\n\nRoles: moles, an HR detective, a union rep and honest employees. Night — secret actions in the bot’s DM; day — discussion and a vote here.\n\nTap “Join” — a chat with the bot opens, press “Start” there.\n\n👥 Players: <b>${ps.length}</b>/${MAX_PLAYERS} (${MIN_PLAYERS}+ needed)${list ? '\n' + list : ''}\n\n⏳ Sign-up closes in ~${left} min.`,
    'Office mole (mafia-style game): tap Join, then Start in the bot chat. Roles and night actions come by DM.');
}
const lobbyKb = (g: Game) => ({ inline_keyboard: [
  [{ text: t2(g.lang, '🙋 Присоединиться · Join', '🙋 Join'), url: `https://t.me/${BOT}?start=maf_${g.id}` }],
  [{ text: t2(g.lang, '▶ Начать', '▶ Start'), callback_data: `maf:go:${g.id}` }, { text: t2(g.lang, '✖ Отменить', '✖ Cancel'), callback_data: `maf:x:${g.id}` }],
] });
async function refreshLobby(ctx: Ctx, g: Game) {
  if (!g.lobby_msg_id) return;
  await ctx.api('editMessageText', { chat_id: g.chat_id, message_id: g.lobby_msg_id, text: lobbyText(g, await players(ctx, g.id)), parse_mode: 'HTML', reply_markup: lobbyKb(g) });
}

// /mafia и /mafia_stop в группе
export async function mafiaCommand(ctx: Ctx, msg: any, cmd: string, lang: L, isAdmin: () => Promise<boolean>) {
  const chatId = msg.chat.id, tg = msg.from?.id;
  const g = await activeGame(ctx, chatId);
  if (cmd === 'mafia_stop') {
    if (!g) return send(ctx, chatId, t2(lang, 'Сейчас здесь нет игры. Начать — /mafia', 'No game here right now. Start one — /mafia'));
    if (g.starter_tg !== tg && !(await isAdmin())) return send(ctx, chatId, t2(lang, 'Остановить игру может тот, кто её начал, или админ группы.', 'Only the game starter or a group admin can stop the game.'));
    return finish(ctx, g, 'stopped');
  }
  if (g) {
    const s = g.status === 'lobby' ? t2(g.lang, 'Набор уже идёт — жмите «Присоединиться» в сообщении выше.', 'Sign-up is already open — tap “Join” in the message above.')
      : t2(g.lang, 'Здесь уже идёт партия «Крот в офисе». Остановить — /mafia_stop', 'A game is already running here. Stop it — /mafia_stop');
    return ctx.api('sendMessage', { chat_id: chatId, text: s, reply_to_message_id: g.lobby_msg_id || undefined, allow_sending_without_reply: true });
  }
  const { data: ng, error } = await ctx.db.from('mafia_games').insert({ chat_id: chatId, lang, status: 'lobby', phase_ends_at: at(LOBBY_MS), starter_tg: tg }).select().single();
  if (error || !ng) return;  // гонка двух /mafia — уникальный индекс пропустит только одну
  const r = await send(ctx, chatId, lobbyText(ng, []), lobbyKb(ng));
  if (r?.ok) await ctx.db.from('mafia_games').update({ lobby_msg_id: r.result.message_id }).eq('id', ng.id);
  else await ctx.db.from('mafia_games').update({ status: 'finished', winner: 'cancelled' }).eq('id', ng.id);
}

// /start maf_<id> в личке — запись в игру
export async function mafiaJoin(ctx: Ctx, msg: any, arg: string) {
  const tg = msg.from?.id, me = langOf(msg.from?.language_code), id = Number(arg.replace(/^maf_/, ''));
  const g = id ? await getGame(ctx, id) : null;
  if (!g || g.status !== 'lobby') return send(ctx, msg.chat.id, t2(me, '🕵️ Набор в эту игру уже закрыт. Попросите в группе начать новую — /mafia', '🕵️ Sign-up for this game is closed. Ask the group to start a new one — /mafia'));
  const ps = await players(ctx, g.id);
  if (ps.some(p => p.tg_id === tg)) return send(ctx, msg.chat.id, t2(me, '✅ Вы уже в игре. Ждите старта — роль придёт сюда.', '✅ You’re already in. Wait for the start — your role will arrive here.'));
  if (ps.length >= MAX_PLAYERS) return send(ctx, msg.chat.id, t2(me, 'Мест нет: в игре уже 12 человек. В следующий раз!', 'Sorry, the game is full (12 players). Next time!'));
  const name = [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ').trim().slice(0, 40) || (msg.from?.username ? '@' + msg.from.username : `#${String(tg).slice(-4)}`);
  const { error } = await ctx.db.from('mafia_players').insert({ game_id: g.id, tg_id: tg, name, lang: me });
  if (error) return;
  await send(ctx, msg.chat.id, t2(me, '✅ Вы в игре «Крот в офисе»! Возвращайтесь в группу. Когда игра начнётся, сюда придёт ваша роль, а ночью — кнопки действий.\n🇬🇧 You’re in! Your role and night actions will arrive here.', '✅ You’re in “The office mole”! Head back to the group. When the game starts your role arrives here, and at night — your action buttons.'));
  if (ps.length + 1 >= MAX_PLAYERS) return startGame(ctx, g);
  await refreshLobby(ctx, g);
}

// ---------- ход игры ----------
async function startGame(ctx: Ctx, g: Game) {
  const ps = await players(ctx, g.id);
  if (ps.length < MIN_PLAYERS) return;
  const ng = await cas(ctx, g, { status: 'night', sub: null, day_no: 1, phase_ends_at: at(NIGHT_MS) });
  if (!ng) return;
  const roles = assignRoles(ps.map(p => p.tg_id));
  await Promise.all(ps.map(p => ctx.db.from('mafia_players').update({ role: roles.get(p.tg_id), alive: true, night_target: null, voted_for: null }).eq('game_id', g.id).eq('tg_id', p.tg_id)));
  for (const p of ps) p.role = roles.get(p.tg_id)!;
  if (g.lobby_msg_id) await ctx.api('editMessageReplyMarkup', { chat_id: g.chat_id, message_id: g.lobby_msg_id, reply_markup: { inline_keyboard: [] } });
  const moles = ps.filter(p => p.role === 'mole');
  for (const p of ps) {
    const l = pl(p), r = p.role!;
    let text = `${t2(l, 'Ваша роль', 'Your role')}: <b>${ROLE[l][r]}</b>\n\n${ROLE_ABOUT[l][r]}`;
    if (r === 'mole' && moles.length > 1) text += '\n\n' + t2(l, `Другие кроты: ${moles.filter(m => m.tg_id !== p.tg_id).map(m => esc(m.name)).join(', ')}. Пишите сюда, в личку боту, — сообщения уйдут другим кротам.`, `Fellow moles: ${moles.filter(m => m.tg_id !== p.tg_id).map(m => esc(m.name)).join(', ')}. Write here in the bot DM — messages go to the other moles.`);
    if (l === 'ru') text += `\n<i>🇬🇧 ${ROLE.en[r]}</i>`;
    await send(ctx, p.tg_id, `🕵️ <b>${t2(l, 'Крот в офисе', 'The office mole')}</b>\n${text}`);
  }
  const k = moles.length;
  await send(ctx, g.chat_id, G(g.lang,
    `🎬 <b>Игра началась!</b> Игроков: ${ps.length}. Среди вас ${k === 1 ? 'один крот' : `кротов: ${k}`}, HR-детектив и профсоюз. Роли — в личке бота.`,
    `🎬 <b>The game is on!</b> ${ps.length} players. Among you: ${k === 1 ? 'one mole' : `${k} moles`}, an HR detective and a union rep. Roles are in your DMs.`,
    `Game started: ${ps.length} players, ${k} mole(s). Check your DM for your role.`));
  await beginNight(ctx, ng, ps);
}

async function beginNight(ctx: Ctx, g: Game, ps: MP[]) {
  const d = g.day_no;
  await send(ctx, g.chat_id, G(g.lang,
    `🌙 <b>Ночь ${d}</b>. Офис опустел, горит только принтер.\nКроты выбирают, кого подставить перед начальством, HR-детектив листает личные дела, профсоюз пишет защитные письма.\nДействия — в личке бота, 90 секунд.`,
    `🌙 <b>Night ${d}</b>. The office is empty, only the printer glows.\nThe moles pick whom to frame, the HR detective reads personnel files, the union writes letters of protection.\nActions are in the bot’s DM, 90 seconds.`,
    'Night: special roles act in the bot DM (90 s).'));
  for (const p of ps.filter(actsAtNight)) {
    const l = pl(p), opts = nightOptions(ps, p);
    const q = p.role === 'mole' ? t2(l, `🌙 Ночь ${d}. Кого подставить перед начальством?${ps.filter(x => x.alive && x.role === 'mole').length > 1 ? ' Решает большинство кротов, при равенстве — кто выбрал первым.' : ''}`, `🌙 Night ${d}. Whom do you get fired?${ps.filter(x => x.alive && x.role === 'mole').length > 1 ? ' Majority of moles decides; on a tie — whoever chose first.' : ''}`)
      : p.role === 'detective' ? t2(l, `🌙 Ночь ${d}. Чьё личное дело проверить?`, `🌙 Night ${d}. Whose file do you check?`)
      : t2(l, `🌙 Ночь ${d}. Кого профсоюз берёт под защиту?`, `🌙 Night ${d}. Whom does the union protect?`);
    const btn = opts.map(id => ({ text: (id === p.tg_id ? '🙋 ' : '') + (ps.find(x => x.tg_id === id)?.name || '?'), callback_data: `maf:n:${g.id}:${d}:${id}` }));
    const rows: any[] = []; for (let i = 0; i < btn.length; i += 2) rows.push(btn.slice(i, i + 2));
    await send(ctx, p.tg_id, q, { inline_keyboard: rows });
  }
}

async function endNight(ctx: Ctx, g: Game) {
  const ng = await cas(ctx, g, { status: 'day', sub: 'talk', phase_ends_at: at(TALK_MS) });
  if (!ng) return;
  const ps = await players(ctx, g.id), l = g.lang;
  const r = resolveNight(ps);
  const union = ps.find(p => p.alive && p.role === 'union');
  if (union) await ctx.db.from('mafia_players').update({ last_protect: union.night_target ?? null }).eq('game_id', g.id).eq('tg_id', union.tg_id);
  if (union?.night_target != null) await ctx.db.from('mafia_players').update({ protected_until_day: g.day_no }).eq('game_id', g.id).eq('tg_id', union.night_target);
  let news: string;
  if (r.fired != null) {
    const f = ps.find(p => p.tg_id === r.fired)!;
    f.alive = false;
    await ctx.db.from('mafia_players').update({ alive: false }).eq('game_id', g.id).eq('tg_id', f.tg_id);
    const i = Math.floor(Math.random() * FIRED.ru.length);
    news = G(l, `${FIRED.ru[i](`<b>${esc(f.name)}</b>`)}\nРоль: ${ROLE.ru[f.role!]}.`, `${FIRED.en[i](`<b>${esc(f.name)}</b>`)}\nRole: ${ROLE.en[f.role!]}.`);
    await send(ctx, f.tg_id, t2(pl(f), '📦 Вас уволили этой ночью. Можно наблюдать за игрой в группе, но не подсказывайте 🤫', '📦 You were fired tonight. You can keep watching in the group, but no hints 🤫'));
  } else if (r.saved) {
    news = G(l, '🛡 Ночью кто-то пытался уволить коллегу, но профсоюз успел подать протест. Сегодня все на местах!', '🛡 Someone tried to get a colleague fired overnight, but the union filed a protest in time. Everyone’s still here!', 'The union saved someone — nobody was fired.');
  } else {
    news = G(l, '☕ Ночь прошла спокойно: кроты, видимо, сами доделывали отчёты. Никого не уволили.', '☕ A quiet night: the moles must have been busy with their own reports. Nobody was fired.', 'Quiet night — nobody was fired.');
  }
  await ctx.db.from('mafia_players').update({ night_target: null, night_at: null, voted_for: null }).eq('game_id', g.id);
  for (const p of ps) { p.night_target = null; p.voted_for = null; }
  const w = winner(ps);
  if (w) { await send(ctx, g.chat_id, `☀️ ${news}`); return finish(ctx, ng, w); }
  const alive = ps.filter(p => p.alive);
  await send(ctx, g.chat_id, G(l,
    `☀️ <b>День ${g.day_no}</b>. Утренняя планёрка.\n${news}\n\nНа местах (${alive.length}): ${alive.map(p => esc(p.name)).join(', ')}.\n💬 Обсуждение — 2 минуты, потом голосование: кого отправить на служебное расследование.`,
    `☀️ <b>Day ${g.day_no}</b>. Morning stand-up.\n${news}\n\nStill here (${alive.length}): ${alive.map(p => esc(p.name)).join(', ')}.\n💬 Discussion — 2 minutes, then a vote: whom to send to an internal investigation.`,
    'Discuss for 2 min, then vote.'));
}

function voteText(g: Game, ps: MP[]) {
  const alive = ps.filter(p => p.alive), voted = alive.filter(p => p.voted_for != null);
  const lines = voted.map(p => `${esc(p.name)} → ${p.voted_for === 0 ? t2(g.lang, '🤷 воздерживается', '🤷 abstains') : nameOf(ps, p.voted_for)}`);
  return G(g.lang,
    `🗳 <b>День ${g.day_no}: голосование</b>\nКого отправить на служебное расследование? 90 секунд, голосуют только те, кто на местах. Голос можно поменять.\n\nПроголосовали: ${voted.length}/${alive.length}${lines.length ? '\n' + lines.join('\n') : ''}`,
    `🗳 <b>Day ${g.day_no}: vote</b>\nWhom do we send to an internal investigation? 90 seconds; only players still in the office vote. You can change your vote.\n\nVoted: ${voted.length}/${alive.length}${lines.length ? '\n' + lines.join('\n') : ''}`,
    'Vote: who goes to the internal investigation?');
}
function voteKb(g: Game, ps: MP[]) {
  const btn = ps.filter(p => p.alive).map(p => ({ text: p.name, callback_data: `maf:v:${g.id}:${g.day_no}:${p.tg_id}` }));
  const rows: any[] = []; for (let i = 0; i < btn.length; i += 2) rows.push(btn.slice(i, i + 2));
  rows.push([{ text: t2(g.lang, '🤷 Воздержаться · Abstain', '🤷 Abstain'), callback_data: `maf:v:${g.id}:${g.day_no}:0` }]);
  return { inline_keyboard: rows };
}

async function startVote(ctx: Ctx, g: Game) {
  const ng = await cas(ctx, g, { sub: 'vote', phase_ends_at: at(VOTE_MS) });
  if (!ng) return;
  const ps = await players(ctx, g.id);
  const r = await send(ctx, g.chat_id, voteText(ng, ps), voteKb(ng, ps));
  if (r?.ok) await ctx.db.from('mafia_games').update({ vote_msg_id: r.result.message_id }).eq('id', g.id);
}

async function endDay(ctx: Ctx, g: Game) {
  const ng = await cas(ctx, g, { status: 'night', sub: null, day_no: g.day_no + 1, phase_ends_at: at(NIGHT_MS), vote_msg_id: null });
  if (!ng) return;
  const ps = await players(ctx, g.id), l = g.lang;
  if (g.vote_msg_id) await ctx.api('editMessageText', { chat_id: g.chat_id, message_id: g.vote_msg_id, text: voteText(g, ps), parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } });
  const { out } = tallyVotes(ps);
  let text: string;
  if (out != null) {
    const p = ps.find(x => x.tg_id === out)!;
    p.alive = false;
    await ctx.db.from('mafia_players').update({ alive: false }).eq('game_id', g.id).eq('tg_id', out);
    text = G(l, `🔍 Решением собрания <b>${esc(p.name)}</b> отправляется на служебное расследование.\nРоль: ${ROLE.ru[p.role!]}. ${p.role === 'mole' ? 'Попался крот! 🎯' : 'Увы, это был не крот…'}`,
      `🔍 By the meeting’s decision, <b>${esc(p.name)}</b> is sent to an internal investigation.\nRole: ${ROLE.en[p.role!]}. ${p.role === 'mole' ? 'A mole caught! 🎯' : 'Oops, not a mole…'}`);
    await send(ctx, p.tg_id, t2(pl(p), '🔍 Вас отправили на служебное расследование. Можно наблюдать за игрой, но не подсказывайте 🤫', '🔍 You were sent to an internal investigation. You can keep watching, but no hints 🤫'));
  } else {
    text = G(l, '🤝 Голоса разделились — на расследование сегодня никого не отправили.', '🤝 The vote was split — nobody goes to the investigation today.', 'Split vote — nobody out.');
  }
  await ctx.db.from('mafia_players').update({ voted_for: null, night_target: null, night_at: null }).eq('game_id', g.id);
  for (const p of ps) { p.voted_for = null; p.night_target = null; }
  await send(ctx, g.chat_id, text);
  const w = winner(ps);
  if (w) return finish(ctx, ng, w);
  await beginNight(ctx, ng, ps);
}

async function finish(ctx: Ctx, g: Game, why: 'moles' | 'staff' | 'stopped' | 'cancelled') {
  await ctx.db.from('mafia_games').update({ status: 'finished', winner: why, sub: null, phase_ends_at: null, seq: g.seq + 1, updated_at: new Date().toISOString() }).eq('id', g.id);
  const ps = await players(ctx, g.id), l = g.lang;
  if (g.lobby_msg_id && g.status === 'lobby') await ctx.api('editMessageReplyMarkup', { chat_id: g.chat_id, message_id: g.lobby_msg_id, reply_markup: { inline_keyboard: [] } });
  if (g.vote_msg_id) await ctx.api('editMessageReplyMarkup', { chat_id: g.chat_id, message_id: g.vote_msg_id, reply_markup: { inline_keyboard: [] } });
  if (why === 'cancelled' && new Date(g.phase_ends_at || 0).getTime() > Date.now()) return send(ctx, g.chat_id, G(l, '✖ Набор в «Крота в офисе» отменён. Начать заново — /mafia', '✖ Sign-up for “The office mole” was cancelled. Start again — /mafia'));
  if (why === 'cancelled') return send(ctx, g.chat_id, G(l, `😴 Набор закрыт: за 10 минут собралось ${ps.length} из ${MIN_PLAYERS} нужных. Попробуем позже — /mafia`, `😴 Sign-up closed: only ${ps.length} of ${MIN_PLAYERS} players joined in 10 minutes. Try again later — /mafia`, 'Not enough players — game cancelled.'));
  const head = why === 'staff' ? G(l, '🎉 <b>Все кроты выявлены!</b> Офис спокойно доживёт до пятницы. Победа сотрудников.', '🎉 <b>All moles exposed!</b> The office will make it to Friday. The employees win.', 'Employees win!')
    : why === 'moles' ? G(l, '🕵️ <b>Кротов не меньше, чем честных сотрудников</b> — начальство знает всё, даже про печеньки. Победа кротов.', '🕵️ <b>The moles now equal the honest staff</b> — the boss knows everything, even about the cookies. The moles win.', 'Moles win!')
    : G(l, '⏹ Игра «Крот в офисе» остановлена.', '⏹ “The office mole” game has been stopped.');
  const roles = ps.some(p => p.role) ? '\n\n' + ps.map(p => `${p.alive ? '•' : '✖'} ${esc(p.name)} — ${ROLE[l][p.role!] || '?'}`).join('\n') : '';
  await send(ctx, g.chat_id, `${head}${roles}\n\n${t2(l, 'Ещё партия — /mafia', 'Another round — /mafia')}`);
}

// ---------- кнопки ----------
export async function mafiaCallback(ctx: Ctx, cq: any) {
  const m = String(cq.data || '').match(/^maf:(go|x|n|v):(\d+)(?::(\d+):(\d+))?$/);
  const tg = cq.from?.id, me = langOf(cq.from?.language_code);
  const answer = (text = '', alert = false) => ctx.api('answerCallbackQuery', { callback_query_id: cq.id, text, show_alert: alert });
  if (!m) return answer();
  const g = await getGame(ctx, +m[2]);
  if (!g || g.status === 'finished') return answer(t2(me, 'Эта игра уже закончилась.', 'This game is over.'));
  const kind = m[1];
  if (kind === 'go' || kind === 'x') {
    if (g.status !== 'lobby') return answer(t2(me, 'Игра уже идёт.', 'The game is already on.'));
    if (g.starter_tg !== tg && !(await chatAdmin(ctx, g.chat_id, tg))) return answer(t2(me, 'Это может сделать тот, кто начал набор, или админ группы.', 'Only the starter or a group admin can do this.'), true);
    if (kind === 'x') { await answer('✖'); return finish(ctx, g, 'cancelled'); }
    const n = (await players(ctx, g.id)).length;
    if (n < MIN_PLAYERS) return answer(t2(me, `Нужно минимум ${MIN_PLAYERS} игроков, сейчас ${n}.`, `At least ${MIN_PLAYERS} players needed, now ${n}.`), true);
    await answer('▶');
    return startGame(ctx, g);
  }
  const day = +m[3], target = +m[4];
  const ps = await players(ctx, g.id), p = ps.find(x => x.tg_id === tg);
  if (!p) return answer(t2(me, 'Вы не участвуете в этой игре.', 'You are not in this game.'));
  if (!p.alive) return answer(t2(me, 'Вы уже вне игры — можно только наблюдать 🤫', 'You’re out — spectating only 🤫'));
  if (kind === 'n') {
    if (g.status !== 'night' || g.day_no !== day) return answer(t2(me, 'Эта ночь уже прошла.', 'That night is over.'));
    if (!actsAtNight(p)) return answer();
    if (p.night_target != null) return answer(t2(me, 'Выбор уже сделан.', 'You already chose.'));
    if (!nightOptions(ps, p).includes(target)) return answer(t2(me, 'Этого игрока выбрать нельзя.', 'You can’t pick this player.'), true);
    const now = new Date().toISOString();
    const { data: upd } = await ctx.db.from('mafia_players').update({ night_target: target, night_at: now }).eq('game_id', g.id).eq('tg_id', tg).is('night_target', null).select('tg_id');
    if (!upd?.length) return answer(t2(me, 'Выбор уже сделан.', 'You already chose.'));
    p.night_target = target; p.night_at = now;
    const l = pl(p), tn = nameOf(ps, target);
    await answer('✅');
    let done = t2(l, `✅ Выбор: <b>${tn}</b>`, `✅ Your choice: <b>${tn}</b>`);
    if (p.role === 'detective') {
      const t = ps.find(x => x.tg_id === target)!;
      done = t.role === 'mole' ? t2(l, `🔎 <b>${tn}</b> — КРОТ! 🕵️ Как убедить остальных — решать вам.`, `🔎 <b>${tn}</b> is a MOLE! 🕵️ How to convince the others is up to you.`)
        : t2(l, `🔎 <b>${tn}</b> — не крот, честный сотрудник.`, `🔎 <b>${tn}</b> is not a mole — an honest employee.`);
    }
    if (cq.message) await ctx.api('editMessageText', { chat_id: cq.message.chat.id, message_id: cq.message.message_id, text: done, parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } });
    if (p.role === 'mole') for (const o of ps.filter(x => x.alive && x.role === 'mole' && x.tg_id !== tg)) {
      await send(ctx, o.tg_id, t2(pl(o), `🕵️ ${esc(p.name)} предлагает подставить: <b>${tn}</b>`, `🕵️ ${esc(p.name)} wants to get <b>${tn}</b> fired`));
    }
    if (nightDone(ps)) await endNight(ctx, g);
    return;
  }
  // голос днём
  if (g.status !== 'day' || g.sub !== 'vote' || g.day_no !== day) return answer(t2(me, 'Голосование сейчас не идёт.', 'No vote right now.'));
  if (target === tg) return answer(t2(me, 'За себя голосовать нельзя 🙂', 'You can’t vote for yourself 🙂'));
  if (target !== 0 && !ps.some(x => x.tg_id === target && x.alive)) return answer(t2(me, 'Этого игрока уже нет в офисе.', 'That player is already out.'));
  await ctx.db.from('mafia_players').update({ voted_for: target }).eq('game_id', g.id).eq('tg_id', tg);
  p.voted_for = target;
  await answer(target === 0 ? '🤷' : `🗳 ${ps.find(x => x.tg_id === target)?.name}`);
  if (voteDone(ps)) return endDay(ctx, g);
  if (g.vote_msg_id) await ctx.api('editMessageText', { chat_id: g.chat_id, message_id: g.vote_msg_id, text: voteText(g, ps), parse_mode: 'HTML', reply_markup: voteKb(g, ps) });
}

// Текст в личку боту (не команда): крот пишет — сообщение уходит другим кротам той же игры. true — обработано
export async function mafiaDm(ctx: Ctx, msg: any): Promise<boolean> {
  const text = String(msg.text || '').trim(), tg = msg.from?.id;
  if (!text || !tg) return false;
  const { data: rows } = await ctx.db.from('mafia_players').select('game_id, name, role, alive, mafia_games!inner(status)').eq('tg_id', tg).eq('role', 'mole').eq('alive', true).in('mafia_games.status', ['night', 'day']);
  let sent = false;
  for (const r of rows || []) {
    const { data: others } = await ctx.db.from('mafia_players').select('tg_id, lang').eq('game_id', r.game_id).eq('role', 'mole').eq('alive', true).neq('tg_id', tg);
    for (const o of others || []) { await send(ctx, o.tg_id, `🕵️ <b>${esc(r.name)}</b>: ${esc(text.slice(0, 1000))}`); sent = true; }
  }
  return sent;
}

// Таймер: двигает партии, у которых вышло время фазы
export async function mafiaTick(ctx: Ctx) {
  const { data } = await ctx.db.from('mafia_games').select('*').neq('status', 'finished').lte('phase_ends_at', new Date().toISOString()).limit(50);
  const out: Record<string, string> = {};
  for (const g of (data || []) as Game[]) {
    try {
      if (Date.now() - new Date(g.created_at).getTime() > MAX_AGE_MS) { await finish(ctx, g, 'stopped'); out[g.id] = 'expired'; continue; }
      if (g.status === 'lobby') {
        const n = (await players(ctx, g.id)).length;
        if (n >= MIN_PLAYERS) await startGame(ctx, g); else await finish(ctx, g, 'cancelled');
      } else if (g.status === 'night') await endNight(ctx, g);
      else if (g.status === 'day' && g.sub === 'talk') await startVote(ctx, g);
      else if (g.status === 'day') await endDay(ctx, g);
      out[g.id] = `${g.status}${g.sub ? '/' + g.sub : ''} → advanced`;
    } catch (e) { console.error('mafia tick', g.id, e); out[g.id] = 'error: ' + String(e); }
  }
  return { ok: true, games: out };
}

export const MAFIA_COMMANDS = {
  ru: [{ command: 'mafia', description: 'Игра «Крот в офисе» (5–12 игроков)' }, { command: 'mafia_stop', description: 'Остановить «Крота в офисе»' }],
  en: [{ command: 'mafia', description: '“The office mole” game (5–12 players)' }, { command: 'mafia_stop', description: 'Stop “The office mole”' }],
};
