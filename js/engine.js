// Движок: данные карточек, пул, правила случайных событий, хранилище и настройки игрока.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → game → ui-menu → app;
// у них общее глобальное пространство имён, как у cards.js и content.js.

// ---------- данные ----------
const RES = [
  { k: 'psyche', name: 'Кукуха' },
  { k: 'energy', name: 'Энергия' },
  { k: 'boss', name: 'Босс' },
  { k: 'colleagues', name: 'Коллеги' },
];
const resName = k => RES.find(r => r.k === k).name;
const PROF = {
  marketer:   { name: 'Маркетолог',  icon: '📣', bonus: { colleagues: 15, psyche: -5 }, perk: 'Коллеги +15 · Кукуха −5' },
  accountant: { name: 'Бухгалтер',   icon: '🧮', bonus: { boss: 15, energy: -5 },       perk: 'Босс +15 · Энергия −5' },
  dev:        { name: 'Программист', icon: '💻', bonus: { psyche: 15, colleagues: -5 }, perk: 'Кукуха +15 · Коллеги −5' },
  sales:      { name: 'Продажник',   icon: '📞', bonus: { energy: 15, psyche: -5 },     perk: 'Энергия +15 · Кукуха −5' },
};
const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
const PHASES = [{ name: 'Утро' }, { name: 'День' }, { name: 'Вечер' }];
const PHASE_KEY = ['morning', 'day', 'evening'];
const PHASE_TIME = ['09:00', '13:00', '17:00'];
const DAY_QUIP = [
  'Неделя только началась. Кофе налит, нервы пока целы.',
  'Вчерашние письма никуда не делись. Их стало больше.',
  'Экватор недели. Половина пути до свободы.',
  'Четверг — это маленькая пятница. Держитесь.',
  'Последний рывок. До 18:00 рукой подать.',
];
const DEATH = {
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
// Большой пул карточек и вопросы второго шанса грузятся в фоне из data/*.json — меню открывается сразу
let POOL = [], QUIZ = [], dataLoaded = false;
const SUGGESTED = [];  // одобренные карточки от коллег, загружаются из Supabase
let PACK = null, PACK_CARDS = [];
const byId = Object.fromEntries([...CARDS, ...RANDOM_CARDS, ...CHAIN_CARDS, ...TYPE_CARDS, ...PROF_ALL, ...SEASON_CARDS].map(c => [c.id, c]));
const TOTAL_BASE = CARDS.length + RANDOM_CARDS.length + TYPE_CARDS.length + PROF_ALL.length;
let TOTAL_CARDS = TOTAL_BASE;
let POOL_CHAINS = [];
// Баланс: эффекты карточек пула усилены в 1,5 раза — по симуляции (tools/balance.js) внимательный игрок
// закрывает около 90% недель, а играющий наугад — около 20%; без усиления было 100% и 60%
const POOL_BOOST = 1.5;
const boost = c => ({ ...c, answers: Object.fromEntries(['left', 'right'].map(side => [side, { ...c.answers[side],
  effects: Object.fromEntries(Object.entries(c.answers[side].effects).map(([k, v]) => [k, Math.max(-30, Math.min(30, Math.round(v * POOL_BOOST / 5) * 5))])) }])) });
const dataReady = (async () => {
  const get = async (name, global) => window[global] || (await fetch(`data/${name}.json`)).json();
  try {
    const [p, q, ch] = await Promise.all([get('pool', 'POOL_JSON'), get('quiz', 'QUIZ_JSON'), get('chains', 'CHAINS_JSON').catch(() => [])]);
    POOL = p.map(c => boost(norm(c))); QUIZ = q;
    POOL_CHAINS = ch.map(x => ({ ...x, card: boost(norm(x.card)) }));
    for (const c of POOL) byId[c.id] = c;
    for (const x of POOL_CHAINS) byId[x.card.id] = { ...x.card, chain: x.origin };
    TOTAL_CARDS = TOTAL_BASE + POOL.length;
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

// ---------- хранилище ----------
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
const KEY = { save: 'vdp-save', best: 'vdp-best', prefs: 'vdp-prefs', career: 'vdp-career', endings: 'vdp-endings', daily: 'vdp-daily', seen: 'vdp-seen', qseen: 'vdp-quiz-seen' };
const YEAR = 52;
const prefs = Object.assign({ name: '', dept: '', avatar: '😎', prof: 'marketer', trait: 'workaholic', sound: true }, store.get(KEY.prefs, {}));
const AVATARS = ['😎', '🤓', '🧐', '😴', '🤠', '🥸', '🤖', '🦄', '🐱', '🐶', '🦊', '🐼'];
if (!prefs.playerId) {
  prefs.playerId = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => (Math.random() * 16 | 0).toString(16));
  store.set(KEY.prefs, prefs);
}
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const dayLabel = iso => iso.split('-').reverse().slice(0, 2).join('.');

// Детерминированный генератор: одинаковая неделя дня у всех
const seeded = str => { let h = 1779033703 ^ str.length; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353), h = h << 13 | h >>> 19;
  let a = h >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
