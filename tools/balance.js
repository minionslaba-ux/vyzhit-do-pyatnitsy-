// Симуляция баланса «Выжить до пятницы»: сколько недель закрывают разные игроки,
// какие карточки чаще всего заканчивают неделю и есть ли ответы, которые «всегда правильные».
// Запуск: node tools/balance.js [недель=10000] [минусы=1.5] [плюсы=1.2] [плюсы Энергии=1.5]
// Только стадии карьеры: STAGES=1 node tools/balance.js · как было до стадий: BASE=1 · доля «смотрит стрелки» у обычного игрока: LOOK=0.3 (так BASE=1 даёт ~21%, как в аналитике)
// Множители (минусы ×1.5, плюсы ×1.2, у Энергии ×1.5) и предел ±30 — как в игре (POOL_BOOST в js/engine.js).
// «Внимательный» игрок видит только то, что показывает игра: направление (▲/▼) и силу (одна или две стрелки).
const fs = require('fs');
const read = f => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : [];
// pool2 мягче первой тысячи: её минусы в игре дополнительно усилены (POOL2_DOWN в js/engine.js)
const POOL2_DOWN = +(process.env.POOL2_DOWN || 1.1);
const pool = [...read(__dirname + '/../data/pool.json'), ...[...read(__dirname + '/../data/pool2.json'), ...read(__dirname + '/../data/pool3.json')].map(c => ({ ...c, p2: true }))];
const KEYS = ['psyche', 'energy', 'boss', 'colleagues'];
const NAMES = { psyche: 'Кукуха', energy: 'Энергия', boss: 'Босс', colleagues: 'Коллеги' };
const N = +(process.argv[2] || 10000);
const DOWN = +(process.argv[3] || 1.5), UP = +(process.argv[4] || 1.2), ENERGY_UP = +(process.argv[5] || 1.5);
const PH = ['Утро', 'День', 'Вечер'];
// Неделя — 25 карточек: по 5 в день (утро, утро, день, день, вечер) — как PER_DAY и SLOT_PHASE в js/engine.js
const WEEK = +(process.env.WEEK || 25), SLOT = WEEK === 15 ? [0, 1, 2] : [0, 0, 1, 1, 2];
const phases = PH.map(ph => pool.filter(c => c.phase === ph));
const rnd = a => a[Math.floor(Math.random() * a.length)];
const effOf = {};
for (const c of pool) for (const side of ['left', 'right'])
  effOf[c.id + side] = Object.fromEntries(KEYS.map(k => [k, Math.max(-30, Math.min(30, Math.round((c.answers[side].effects[k] || 0) * ((c.answers[side].effects[k] || 0) > 0 ? (k === 'energy' ? ENERGY_UP : UP) : DOWN * (c.p2 ? POOL2_DOWN : 1)) / 5) * 5))]));
const eff = (c, side) => effOf[c.id + side];
const seen = v => v === 0 ? 0 : v > 0 ? (v >= 20 ? 2 : 1) : (v <= -20 ? -2 : -1);  // что видно в подсказке

// Статистика по карточкам: показы, проигрыши на ней, исход недели по выбранной стороне
const stat = {};
const st = id => stat[id] || (stat[id] = { shown: 0, kills: 0, high: 0, left: [0, 0], right: [0, 0] });  // [показов, закрытых недель]

function week(strategy, { items = 1.5, chance = 0.6, track = false } = {}) {
  const res = { psyche: 50, energy: 50, boss: 50, colleagues: 50 };
  let inv = Math.random() < items - 1 ? 2 : 1, saved = false;
  if (!items) inv = 0;
  const picks = [];
  const done = won => { if (track) for (const [id, side] of picks) { st(id)[side][0]++; if (won) st(id)[side][1]++; } return won; };
  for (let i = 0; i < WEEK; i++) {
    const c = rnd(phases[SLOT[i % SLOT.length]]);
    const side = strategy(c, res);
    if (track) { st(c.id).shown++; picks.push([c.id, side]); }
    const e = eff(c, side);
    for (const k of KEYS) {
      let v = e[k];
      if (v <= -10 && inv > 0 && Math.random() < .5) { v = 0; inv--; }  // предмет на случайную шкалу
      res[k] = Math.max(0, Math.min(100, res[k] + v));
    }
    const dead = KEYS.find(k => res[k] <= 0 || res[k] >= 100);
    if (dead) {
      if (!saved && Math.random() < chance) { saved = true; res[dead] = res[dead] >= 100 ? 80 : 20; continue; }  // второй шанс: доля верных ответов
      if (track) { st(c.id).kills++; if (res[dead] >= 100) st(c.id).high++; }
      return done(false);
    }
  }
  return done(true);
}
const random = () => Math.random() < .5 ? 'left' : 'right';
const careful = (c, res) => {  // выбирает сторону, где шкалы после хода ближе к 50 и дальше от краёв
  const score = side => KEYS.reduce((a, k) => { const v = res[k] + seen(c.answers[side].effects[k] || 0) * 10; return a + Math.abs(v - 50) + (v <= 10 || v >= 90 ? 80 : 0); }, 0);
  return score('left') <= score('right') ? 'left' : 'right';
};

const pct = x => (100 * x).toFixed(1) + '%';
const short = c => (c.text.length > 64 ? c.text.slice(0, 63) + '…' : c.text);
const fx = e => KEYS.filter(k => e[k]).map(k => `${NAMES[k]} ${e[k] > 0 ? '+' : ''}${e[k]}`).join(', ') || 'ничего';

console.log(`Колода: ${pool.length} карточек · недель на стратегию: ${N} · минусы ×${DOWN}, плюсы ×${UP} (у Энергии ×${ENERGY_UP}), предел ±30\n`);
for (const [name, s] of [['случайный', random], ['внимательный', careful]]) {
  for (const [label, opt] of [['без помощи', { items: 0, chance: 0 }], ['с предметами и вторым шансом', {}]]) {
    let ok = 0; for (let i = 0; i < N; i++) if (week(s, opt)) ok++;
    console.log(`${name.padEnd(13)} ${label.padEnd(30)} закрывают неделю: ${pct(ok / N)}`);
  }
}

// ---------- по стадиям карьеры: таблица DIFF из js/engine.js ----------
// Карьера: старт 50% ± бонус профессии, после закрытой недели шкалы наполовину возвращаются к 50, 1–2 предмета на свои шкалы
// (+1 с должности «Специалист», +2 у генерального), второй шанс — вопрос на эрудицию (верно ~60%), у новичка ещё и «кофе».
// Реклама «последний шанс» не считается. BASE=1 — как было до стадий (все множители 1, без кофе и предела).
const engine = fs.readFileSync(__dirname + '/../js/engine.js', 'utf8');
const DIFF = process.env.DIFF ? JSON.parse(process.env.DIFF) : process.env.BASE ? [0, 1, 2, 3].map(() => ({ neg: 1, cap: -30 })) : eval(engine.split('// DIFF:start')[1].split('// DIFF:end')[0].replace(/const DIFF =/, '').replace(/L\(('[^']*'), '[^']*'\)/g, '$1').replace(/;\s*$/, ''));
const QUIZ_OK = +(process.env.QUIZ_OK || .6);
const PROFB = [{ colleagues: 15, psyche: -5 }, { boss: 15, energy: -5 }, { psyche: 15, colleagues: -5 }, { energy: 15, psyche: -5 }, { boss: 15, colleagues: -5 },
  { psyche: 15, boss: -5 }, { colleagues: 15, energy: -5 }, { energy: 15, boss: -5 }, { energy: 10, colleagues: 10, psyche: -10 }];
const STAGES = [  // стадия → должность (бонус предметов) и недели, которые прогоняем подряд
  { d: 0, extra: 0, weeks: 3, label: 'новичок, недели 1–3' },
  { d: 1, extra: 0, weeks: 4, label: 'стажёр/младший' },
  { d: 2, extra: 1, weeks: 4, label: 'специалист…ведущий' },
  { d: 3, extra: 1, weeks: 4, label: 'тимлид…директор' },
  { d: 3, extra: 2, weeks: 4, label: 'генеральный' },
];
function careerWeek(strategy, D, extra, res) {
  res = { ...res };
  const items = new Set([...KEYS].sort(() => Math.random() - .5).slice(0, Math.min(4, (Math.random() < .5 ? 1 : 2) + extra)));
  let coffee = !!D.save, quiz = true;
  const effFor = (c, side) => Object.fromEntries(KEYS.map(k => {
    let v = eff(c, side)[k];
    if (v < 0) v = Math.max(D.cap, Math.round(v * D.neg));
    return [k, v <= -10 && items.has(k) ? 0 : v];  // предмет на этой шкале: игра показывает ◆ вместо ▼
  }));
  for (let i = 0; i < WEEK; i++) {
    const c = rnd(phases[SLOT[i % SLOT.length]]);
    const side = strategy(c, res, effFor), e = effFor(c, side);
    for (const k of KEYS) { if (eff(c, side)[k] <= -10 && items.has(k) && e[k] === 0) items.delete(k); res[k] = Math.max(0, Math.min(100, res[k] + e[k])); }
    const dead = KEYS.find(k => res[k] <= 0 || res[k] >= 100);
    if (!dead) continue;
    if (coffee) { coffee = false; res[dead] = res[dead] >= 100 ? 95 : 5; continue; }
    if (quiz && Math.random() < QUIZ_OK) { quiz = false; res[dead] = res[dead] >= 100 ? 80 : 20; continue; }
    return [false, i + 1];
  }
  return [true, res];
}
const carefulS = (c, res, effFor) => {  // как careful, но видит стрелки уже с поправками стадии и предметами
  const score = side => { const e = effFor(c, side); return KEYS.reduce((a, k) => { const v = res[k] + seen(e[k]) * 10; return a + Math.abs(v - 50) + (v <= 10 || v >= 90 ? 80 : 0); }, 0); };
  return score('left') <= score('right') ? 'left' : 'right';
};
// «Обычный» игрок (по аналитике: 11 из 53 недель до правки ≈ 21%): на части карточек смотрит стрелки, на остальных жмёт кнопку не глядя (на телефоне так быстрее)
const LOOK = +(process.env.LOOK || .3);
const typical = (c, res, effFor) => Math.random() < LOOK ? carefulS(c, res, effFor) : random();
console.log(`\nВыживаемость по стадиям карьеры${process.env.BASE ? ' (BASE: без стадий, как было)' : ''} · вопрос второго шанса верен в ${QUIZ_OK * 100}% · без рекламы:`);
for (const st of STAGES) {
  const D = DIFF[st.d], out = {};
  for (const [name, s] of [['внимательный', carefulS], ['обычный', typical]]) {
    let ok = 0, n = 0; const deaths = [];
    for (let r = 0; r < N / st.weeks; r++) {
      let res = null;
      for (let w = 0; w < st.weeks; w++) {
        if (!res) { const b = rnd(PROFB); res = Object.fromEntries(KEYS.map(k => [k, 50 + (b[k] || 0)])); }
        const [won, x] = careerWeek(s, D, st.extra, res); n++;
        if (won) { ok++; res = Object.fromEntries(KEYS.map(k => [k, Math.round((x[k] + 50) / 2)])); } else { deaths.push(x); res = null; }
      }
    }
    deaths.sort((a, b) => a - b);
    out[name] = `${pct(ok / n).padStart(6)} (медиана увольнения — карточка ${deaths[deaths.length >> 1] || '—'})`;
  }
  console.log(`  ${st.label.padEnd(20)} минусы ×${D.neg}, предел ${D.cap}${D.save ? ', кофе' : ''}`.padEnd(62) + ` внимательный ${out['внимательный']} · обычный ${out['обычный']}`);
}
if (process.env.STAGES) process.exit(0);

// Карточки-убийцы: случайный игрок с предметами и вторым шансом (как средний новичок)
for (let i = 0; i < N; i++) week(random, { track: true });
const byId = Object.fromEntries(pool.map(c => [c.id, c]));
const rows = Object.entries(stat).map(([id, x]) => ({ id, ...x, rate: x.kills / x.shown }));
const totalKills = rows.reduce((a, r) => a + r.kills, 0);
console.log(`\nКарточки, на которых чаще всего заканчивается неделя (случайный игрок, проигрышей: ${totalKills}):`);
for (const r of rows.filter(r => r.shown >= 20).sort((a, b) => b.rate - a.rate).slice(0, 15))
  console.log(`  ${r.id.padEnd(10)} ${pct(r.rate).padStart(6)} показов ${String(r.shown).padStart(4)} · из них перегрев ${r.high}/${r.kills} · ${short(byId[r.id])}`);

// По шкалам: что именно добивает
const deathBy = Object.fromEntries(KEYS.map(k => [k, [0, 0]]));
for (let i = 0; i < N; i++) {
  const res = { psyche: 50, energy: 50, boss: 50, colleagues: 50 };
  for (let j = 0; j < WEEK; j++) {
    const c = rnd(phases[SLOT[j % SLOT.length]]), e = eff(c, random());
    for (const k of KEYS) res[k] = Math.max(0, Math.min(100, res[k] + e[k]));
    const d = KEYS.find(k => res[k] <= 0 || res[k] >= 100);
    if (d) { deathBy[d][res[d] >= 100 ? 1 : 0]++; break; }
  }
}
console.log('\nЧем заканчиваются проигрыши (случайный игрок без помощи):');
for (const k of KEYS) console.log(`  ${NAMES[k].padEnd(8)} 0%: ${String(deathBy[k][0]).padStart(5)} · 100%: ${String(deathBy[k][1]).padStart(5)}`);

// «Всегда правильные» ответы: одна сторона не хуже другой ни по одной шкале
const dominant = [], safe = [];
for (const c of pool) {
  const L = eff(c, 'left'), R = eff(c, 'right');
  const ge = (a, b) => KEYS.every(k => a[k] >= b[k]) && KEYS.some(k => a[k] > b[k]);
  if (ge(L, R)) dominant.push([c, 'left']); else if (ge(R, L)) dominant.push([c, 'right']);
  for (const side of ['left', 'right']) if (KEYS.every(k => eff(c, side)[k] >= 0) && KEYS.some(k => eff(c, side)[k] > 0)) safe.push([c, side]);
}
console.log(`\nОтветы, которые лучше другого по всем шкалам сразу: ${dominant.length} из ${pool.length} карточек`);
for (const [c, side] of dominant.slice(0, 15))
  console.log(`  ${c.id.padEnd(10)} ${side === 'left' ? '←' : '→'} «${c.answers[side].label}» (${fx(eff(c, side))}) против (${fx(eff(c, side === 'left' ? 'right' : 'left'))}) · ${short(c)}`);
if (dominant.length > 15) console.log(`  … и ещё ${dominant.length - 15}`);
console.log(`Ответы без минусов вообще (только плюсы): ${safe.length}. Риск у них один — перегрев шкалы у 100%.`);

// Эмпирика: выбор какой стороны сильнее всего меняет шанс закрыть неделю
const gap = rows.filter(r => r.left[0] >= 30 && r.right[0] >= 30)
  .map(r => ({ ...r, wl: r.left[1] / r.left[0], wr: r.right[1] / r.right[0] })).map(r => ({ ...r, d: r.wr - r.wl }))
  .sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
console.log('\nГде выбор сильнее всего влияет на исход недели (разница доли закрытых недель):');
for (const r of gap.slice(0, 10))
  console.log(`  ${r.id.padEnd(10)} ← ${pct(r.wl).padStart(6)} (n=${r.left[0]}) · → ${pct(r.wr).padStart(6)} (n=${r.right[0]}) · ${short(byId[r.id])}`);
console.log('  (при малых n разница шумит — для точности запустите больше недель)');
