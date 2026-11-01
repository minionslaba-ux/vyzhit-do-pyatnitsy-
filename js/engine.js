// Движок: данные карточек, пул, правила случайных событий, хранилище и настройки игрока.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → fx → faces → intro → game → ui-menu → app;
// у них общее глобальное пространство имён, как у cards.js и content.js.

// ---------- данные ----------
const RES = [
  { k: 'psyche', name: L('Кукуха', 'Sanity') },
  { k: 'energy', name: L('Энергия', 'Energy') },
  { k: 'boss', name: L('Босс', 'Boss') },
  { k: 'colleagues', name: L('Коллеги', 'Team') },
];
const resName = k => RES.find(r => r.k === k).name;
const PROF = {
  marketer:   { name: L('Маркетолог', 'Marketer'), icon: '📣', bonus: { colleagues: 15, psyche: -5 }, perk: L('Коллеги +15 · Кукуха −5', 'Team +15 · Sanity −5') },
  accountant: { name: L('Бухгалтер', 'Accountant'), icon: '🧮', bonus: { boss: 15, energy: -5 }, perk: L('Босс +15 · Энергия −5', 'Boss +15 · Energy −5') },
  dev:        { name: L('Программист', 'Developer'), icon: '💻', bonus: { psyche: 15, colleagues: -5 }, perk: L('Кукуха +15 · Коллеги −5', 'Sanity +15 · Team −5') },
  sales:      { name: L('Продажник', 'Sales rep'), icon: '📞', bonus: { energy: 15, psyche: -5 }, perk: L('Энергия +15 · Кукуха −5', 'Energy +15 · Sanity −5') },
  hr:         { name: L('HR-менеджер', 'HR manager'), icon: '🤝', bonus: { boss: 15, colleagues: -5 }, perk: L('Босс +15 · Коллеги −5', 'Boss +15 · Team −5') },
  designer:   { name: L('Дизайнер', 'Designer'), icon: '🎨', bonus: { psyche: 15, boss: -5 }, perk: L('Кукуха +15 · Босс −5', 'Sanity +15 · Boss −5') },
  sysadmin:   { name: L('Сисадмин', 'Sysadmin'), icon: '🔌', bonus: { colleagues: 15, energy: -5 }, perk: L('Коллеги +15 · Энергия −5', 'Team +15 · Energy −5') },
  cooler:     { name: L('Хранитель кулера', 'Keeper of the Cooler'), icon: '🚰', bonus: { energy: 15, boss: -5 }, perk: L('Энергия +15 · Босс −5', 'Energy +15 · Boss −5') },
  intern:     { name: L('Вечный стажёр', 'Eternal Intern'), icon: '🎒', bonus: { energy: 10, colleagues: 10, psyche: -10 }, perk: L('Энергия +10 · Коллеги +10 · Кукуха −10', 'Energy +10 · Team +10 · Sanity −10') },
};
// Название профессии для показа самому игроку: своё (prefs.profCustom), если он его написал
const profLabel = k => (typeof prefs !== 'undefined' && prefs.profCustom && k === prefs.prof) ? prefs.profCustom : (PROF[k]?.name || '');
// DAYS и PHASES — ключи логики (c.day, c.phase): не переводить; показывать — dayName(i), phaseName(i) из js/i18n.js
const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
const PHASES = [{ name: 'Утро' }, { name: 'День' }, { name: 'Вечер' }];
const PHASE_KEY = ['morning', 'day', 'evening'];
const PHASE_TIME = ['09:00', '13:00', '17:00'];
// День — 5 карточек (неделя — 25): 9:00 и 11:00 — утро, 13:00 и 15:00 — день, 17:00 — вечер.
// Длина дня меняется здесь: PER_DAY, SLOT_PHASE и SLOT_TIME
const PER_DAY = 5, WEEK_LEN = PER_DAY * 5;
const SLOT_PHASE = [0, 0, 1, 1, 2];
const SLOT_TIME = ['09:00', '11:00', '13:00', '15:00', '17:00'];
const dayOf = step => Math.min(4, Math.floor(step / PER_DAY));
const slotPh = step => SLOT_PHASE[step % PER_DAY];
const slotTime = step => SLOT_TIME[step % PER_DAY];
// первая карточка утра, дня или вечера данного дня (для карточек по расписанию: day + phase)
const slotOfPhase = (d, p) => d * PER_DAY + SLOT_PHASE.indexOf(p);
const DAY_QUIP = EN ? [
  'The week has just begun. Coffee poured, nerves still intact.',
  "Yesterday's emails haven't gone anywhere. There are more of them now.",
  'Hump day. Halfway to freedom.',
  'Thursday is a tiny Friday. Hang in there.',
  'The final push. 6 p.m. is within reach.',
] : [
  'Неделя только началась. Кофе налит, нервы пока целы.',
  'Вчерашние письма никуда не делись. Их стало больше.',
  'Экватор недели. Половина пути до свободы.',
  'Четверг — это маленькая пятница. Держитесь.',
  'Последний рывок. До 18:00 рукой подать.',
];
const DEATH = EN ? {
  psyche:     { title: 'Sanity 0%', text: 'One more "ASAP" in the chat was one too many. You flipped the water cooler and walked off into the sunset. HR is looking for you.' },
  energy:     { title: 'Energy 0%', text: 'Energy crisis. You fell asleep on the meeting-room carpet during a big investor call. Someone gently covered you with a blanket — and fired you.' },
  boss:       { title: 'Boss 0%', text: 'The boss called you in "for a quick word" and handed you your papers. Your memes in the company chat have been ruled a security risk.' },
  colleagues: { title: 'Team 0%', text: 'The team declared a total boycott. Nobody shared the new Wi‑Fi password or invited you to the cake in the kitchen. Working in isolation became unbearable.' },
} : {
  psyche:     { title: 'Кукуха 0%', text: 'Вы не выдержали очередного «Асиап» в чате, перевернули кулер с водой и ушли в закат. Вас ищут HR.' },
  energy:     { title: 'Энергия 0%', text: 'Энергетический кризис. Вы уснули на ковре в переговорной во время важного зума с инвесторами. Вас аккуратно накрыли пледом и уволили.' },
  boss:       { title: 'Босс 0%', text: 'Шеф вызвал вас «на пару слов» и вручил трудовую книжку. Ваши мемы в общем чате признаны экстремистскими.' },
  colleagues: { title: 'Коллеги 0%', text: 'Коллектив объявил вам тотальный бойкот. Никто не передал вам пароль от нового Wi‑Fi и не позвал есть пирог на кухне. Работать в изоляции стало невыносимо.' },
};

// Карточки: CARDS_JSON, DECOR, RANDOM_JSON — в js/cards.js; цепочки, недели, профессии — в js/content.js
const norm = c => ({ ...c, ...(DECOR[c.id] || {}),
  answers: { left: c.answers.left || c.answers.left_switch, right: c.answers.right || c.answers.right_switch } });
const CARDS = CARDS_JSON.map(norm);
const RANDOM_CARDS = RANDOM_JSON.map(c => ({ ...norm(c), random: true }));
const CHAIN_CARDS = CHAINS.map(ch => ({ ...norm(ch.card), chain: ch.origin }));
const TYPE_CARDS = Object.values(WEEK_TYPES).flatMap(t => (t.cards || []).map(norm));
const SEASON_CARDS = (typeof SEASONS === 'undefined' ? [] : SEASONS).flatMap(z => z.cards.map(c => ({ ...norm(c), season: z.title })));
// Сезон по дате: ММ-ДД попадает в промежуток (новогодний переходит через 1 января)
function activeSeason(d = new Date()) {
  const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return (typeof SEASONS === 'undefined' ? [] : SEASONS).find(z => z.from <= z.to ? md >= z.from && md <= z.to : md >= z.from || md <= z.to) || null;
}
const PROF_ALL = Object.values(PROF_CARDS).flat().map(c => ({ ...norm(c), profCard: true }));
// Большой пул карточек (data/pool.json — 1000, data/pool2.json — ещё 2000, data/pool3.json — ещё 1000) и вопросы второго шанса грузятся в фоне из data/*.json — меню открывается сразу
let POOL = [], QUIZ = [], dataLoaded = false;
const SUGGESTED = [];  // одобренные карточки от коллег, загружаются из Supabase
let PACK = null, PACK_CARDS = [];
const byId = Object.fromEntries([...CARDS, ...RANDOM_CARDS, ...CHAIN_CARDS, ...TYPE_CARDS, ...PROF_ALL, ...SEASON_CARDS].map(c => [c.id, c]));
const TOTAL_BASE = CARDS.length + RANDOM_CARDS.length + TYPE_CARDS.length + PROF_ALL.length;
let TOTAL_CARDS = TOTAL_BASE;
let POOL_CHAINS = [];
// Баланс: эффекты карточек пула усилены в 1,5 раза — по симуляции (tools/balance.js) внимательный игрок
// закрывает около 90% недель, а играющий наугад — около 20%; без усиления было 100% и 60%
// Плюсы усилены слабее минусов: при ×1.5 в обе стороны шкалы слишком быстро уходили в перегрев (100%).
// Энергия почти не перегревается, а без сильных плюсов её не восстановить — у неё плюсы ×1.5
const POOL_BOOST = { down: 1.5, up: { psyche: 1.2, energy: 1.5, boss: 1.2, colleagues: 1.2 } };
// Сложность карьеры растёт со стадией (только в карьере; неделя дня и турнир — одинаковые для всех).
// neg — множитель минусов поверх POOL_BOOST (без округления до 5: −15 × 0.9 = −14), cap — самый сильный минус по шкале за один ответ,
// save — раз в неделю бесплатный «кофе»: шкала не падает в 0/100, а останавливается на 5/95. Только первые 3 недели —
// дальше от увольнения спасают вопрос второго шанса, реклама (adRescue в js/ads.js), подсказки, предметы и магазин.
// Подбор — node tools/balance.js (читает эту таблицу между метками DIFF): обычный новичок (смотрит стрелки на ~30% карточек,
// как в аналитике: до правки ~21% закрытых недель) закрывает ~60% недель; внимательный руководитель — ~35–42%
// DIFF:start
const DIFF = [
  { name: L('Новичок', 'Rookie'),           neg: .9,   cap: -20, save: true },  // первые 3 недели, должность не выше младшего
  { name: L('Освоился', 'Settling in'),     neg: .95,  cap: -25 },              // стажёр и младший специалист
  { name: L('Специалист', 'Specialist'),    neg: 1.08, cap: -30 },              // специалист … ведущий
  { name: L('Руководитель', 'Management'),  neg: 1.18, cap: -30 },              // тимлид и выше
];
// DIFF:end
// Три уровня карьеры по 52 недели: свои карточки (lvl) и чуть жёстче минусы на каждом следующем
const LEVELS = [null,
  { name: L('Офисный планктон', 'Office plankton'), ico: '🐟', neg: .75, cap: -15, save: true,    desc: L('Первый год: дедлайны, кулер и «есть минутка?»', 'Year one: deadlines, the water cooler and “got a minute?”') },
  { name: L('Средний менеджмент', 'Middle management'), ico: '📊', neg: 1.06, desc: L('Второй год: новые люди, новые интриги, новые ситуации', 'Year two: new people, new intrigue, new situations') },
  { name: L('Топ-менеджмент', 'Top management'), ico: '👑', neg: 1.12, desc: L('Третий год: самые сложные решения и самые высокие ставки', 'Year three: the hardest calls and the highest stakes') },
];
const LEVEL_MAX = 3;
const LEVEL_FILES = [['pool_l1a', 1], ['pool_l1b', 1], ['pool_l1c', 1], ['pool_l1d', 1], ['pool_l2a', 2], ['pool_l3a', 3], ['pool_l3b', 3], ['pool_l3c', 3]];
const levelOf = c => Math.min(LEVEL_MAX, Math.max(1, (c && c.level) || 1));
const diffStage = (c, r = typeof rankIdx === 'function' ? rankIdx() : 0) => c && c.week <= 3 && r <= 1 ? 0 : r <= 1 ? 1 : r <= 4 ? 2 : 3;
// Вторая и третья пачки (data/pool2.json, pool3.json) по исходным числам мягче: её минусы усилены ещё в 1,1 раза — так сложность как у первой тысячи
const POOL2_DOWN = 1.1;
const boost = (c, down = 1) => ({ ...c, answers: Object.fromEntries(['left', 'right'].map(side => [side, { ...c.answers[side],
  effects: Object.fromEntries(Object.entries(c.answers[side].effects).map(([k, v]) => [k, Math.max(-30, Math.min(30, Math.round(v * (v > 0 ? POOL_BOOST.up[k] ?? 1.2 : POOL_BOOST.down * down) / 5) * 5))])) }])) });
// Вопросы собеседования: базовые из cards.js и 300 из data/interview.json (prof — только для своей профессии, last — финальный)
// Истории постоянных коллег (data/cast.json): stage 1…8 по порядку, payoff — когда отношение ±2
let CAST_CARDS = [];
// Сюжеты с продолжением (data/stories.json, движок — js/stories.js): грузятся вместе с остальными данными,
// чтобы сохранённая неделя с карточкой эпизода не считалась «старой колодой»
let STORIES = [];
let IV = [...INTERVIEW.map((x, i) => ({ id: 'base_' + i, ...x })), { id: 'last_base', last: true, ...INTERVIEW_LAST }];
const dataReady = (async () => {
  const get = async (name, global) => window[global] || (await fetch(`data/${name}.json`)).json();
  // Английский: data/en/<имя>.json — только тексты, по id поверх русских. Карточки без перевода в английскую игру не попадают
  const en = async name => EN ? (window[`EN_${name.toUpperCase()}_JSON`] || (await fetch(`data/en/${name}.json`).then(r => r.ok ? r.json() : []).catch(() => []))) : null;
  try {
    let [p, p2, p3, q, ch, iv, cast, st] = await Promise.all([get('pool', 'POOL_JSON'), get('pool2', 'POOL2_JSON').catch(() => []), get('pool3', 'POOL3_JSON').catch(() => []), get('quiz', 'QUIZ_JSON'),
      get('chains', 'CHAINS_JSON').catch(() => []), get('interview', 'INTERVIEW_JSON').catch(() => []), get('cast', 'CAST_JSON').catch(() => []), get('stories', 'STORIES_JSON').catch(() => [])]);
    if (EN) {
      const [ep, ep2, ep3, eq, ech, eiv, ecast] = await Promise.all(['pool', 'pool2', 'pool3', 'quiz', 'chains', 'interview', 'cast'].map(en));
      p = enCards(p, ep); p2 = enCards(p2, ep2); p3 = enCards(p3, ep3); cast = enCards(cast, ecast);
      ch = enCards(ch.map(x => ({ ...x.card, _chain: x })), ech).map(c => ({ ...c._chain, origin: c.origin || c._chain.origin, card: { ...c, _chain: undefined, origin: undefined } }));
      iv = enById(iv, eiv, (x, t) => ({ ...x, q: t.q, a: x.a.map((a, i) => ({ ...a, ...(t.a?.[i] || {}) })) }));
      q = enById(q, eq, (x, t) => ({ ...x, ...t }));
    }
    // уровень карьеры: у каждого свои карточки — 1-й год pool.json, 2-й pool2.json, 3-й pool3.json (LEVELS ниже)
    // дополнительные наборы уровней (data/pool_l1a…l3c.json): 1-й уровень — 3000 карточек, 2-й и 3-й — по 2500
    const extra = await Promise.all(LEVEL_FILES.map(([f]) => fetch(`data/${f}.json`).then(r => r.ok ? r.json() : []).catch(() => [])));
    const extraEn = EN ? await Promise.all(LEVEL_FILES.map(([f]) => en(f))) : [];
    const lvlCards = LEVEL_FILES.flatMap(([, lvl], i) => (EN ? enCards(extra[i], extraEn[i]) : extra[i]).map(c => ({ ...boost(norm(c), lvl > 1 ? POOL2_DOWN : 1), lvl })));
    POOL = p.map(c => ({ ...boost(norm(c)), lvl: 1 })).concat(p2.map(c => ({ ...boost(norm(c), POOL2_DOWN), lvl: 2 })), p3.map(c => ({ ...boost(norm(c), POOL2_DOWN), lvl: 3 })), lvlCards); QUIZ = q;
    const ivq = new Set(IV.map(x => x.q)); IV = IV.concat(iv.filter(x => !ivq.has(x.q) && ivq.add(x.q)));  // один и тот же вопрос — только один раз
    CAST_CARDS = cast.map(norm); for (const c of CAST_CARDS) byId[c.id] = c;
    POOL_CHAINS = ch.map(x => ({ ...x, card: boost(norm(x.card)) }));
    for (const c of POOL) byId[c.id] = c;
    for (const x of POOL_CHAINS) byId[x.card.id] = { ...x.card, chain: x.origin };
    TOTAL_CARDS = TOTAL_BASE + POOL.length;
    STORIES = st || []; window.stoRegister?.();
  } catch {}
  dataLoaded = true;
})();
// Перед стартом недели ждём данные; кнопка показывает, что идёт загрузка
async function whenReady(btn) {
  if (dataLoaded) return;
  const t = btn?.textContent; if (btn) { btn.textContent = 'Загружаю карточки…'; btn.disabled = true; }
  await dataReady;
  if (btn) { btn.textContent = t; btn.disabled = false; }
}

function getRandomCard(standardCard, randomPack, percent = 15, random = Math.random) {
  // Генерируем случайное число от 1 до 100
  const chance = Math.floor(random() * 100) + 1;

  // Если выпало меньше или равно 15 (или шансу недели), выдаем случайное событие вместо стандартного
  if (chance <= percent && randomPack.length > 0) {
    const randomIndex = Math.floor(random() * randomPack.length);
    // Достаем карточку и удаляем её из пула, чтобы не повторялась за одну неделю
    return randomPack.splice(randomIndex, 1)[0];
  }

  return standardCard;
}

// ---------- события игры ----------
// Игра сообщает, что произошло (ответ, конец недели, сборка недели, покупка…), а задания, опыт и истории (js/meta.js) слушают
const bus = { h: {}, on(e, f) { (this.h[e] ||= []).push(f); }, emit(e, x) { for (const f of this.h[e] || []) try { f(x); } catch (err) { console.error(err); } } };

// ---------- хранилище ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
const KEY = { save: 'vdp-save', best: 'vdp-best', prefs: 'vdp-prefs', career: 'vdp-career', endings: 'vdp-endings', daily: 'vdp-daily', seen: 'vdp-seen', qseen: 'vdp-quiz-seen', ivseen: 'vdp-iv-seen' };
const YEAR = 52;
const prefs = Object.assign({ name: '', dept: '', avatar: '😎', prof: 'marketer', trait: 'workaholic', sound: true }, store.get(KEY.prefs, {}));
const AVATARS = ['😎', '🤓', '🧐', '😴', '🤠', '🥸', '🤖', '🦄', '🐱', '🐶', '🦊', '🐼'];
if (!prefs.playerId) {
  prefs.playerId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16));
  store.set(KEY.prefs, prefs);
}
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
// Склонение после числа: plural(21, 'участник', 'участника', 'участников') → «21 участник»
// В английской версии используйте pl(n, …, enOne, enMany) из js/i18n.js
const plural = (n, one, few, many) => { const a = Math.abs(n) % 100, b = a % 10; return `${n} ${a > 10 && a < 20 ? many : b === 1 ? one : b > 1 && b < 5 ? few : many}`; };
const dayLabel = iso => EN ? iso.split('-').slice(1).join('/') : iso.split('-').reverse().slice(0, 2).join('.');

// Перевод поверх русских данных: перевод {id, who, text, left, right[, origin]} → карточка с английским текстом; без перевода — пропускается
const enById = (list, tr, merge) => { const m = new Map((tr || []).map(t => [t.id, t])); return list.filter(x => m.has(x.id)).map(x => merge(x, m.get(x.id))); };
const enCards = (list, tr) => enById(list, tr, (c, t) => ({ ...c, who: t.who ?? c.who, text: t.text ?? c.text, ...(t.origin ? { origin: t.origin } : {}),
  answers: { left: { ...c.answers.left, label: t.left ?? c.answers.left.label }, right: { ...c.answers.right, label: t.right ?? c.answers.right.label } } }));

// Детерминированный генератор: одинаковая неделя дня у всех
const seeded = str => { let h = 1779033703 ^ str.length; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353), h = h << 13 | h >>> 19;
  let a = h >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
