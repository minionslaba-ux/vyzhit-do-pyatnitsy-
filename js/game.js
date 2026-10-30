// Игра: экран недели, карьера, магазин, второй шанс, финалы, запись результата.
// «Выжить до пятницы». Скрипты подключаются по порядку: engine → board → audio → game → ui-menu → app;
// у них общее глобальное пространство имён, как у cards.js и content.js.

// ---------- DOM ----------
const $ = id => document.getElementById(id);
const views = { join: $('join'), menu: $('menu'), game: $('game'), end: $('end'), board: $('board') };
const show = v => { Object.entries(views).forEach(([k, el]) => el.hidden = k !== v); if (v !== 'menu') $('viralPop').hidden = true; window.VDP_PLATFORM?.view?.(v); };
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
const rnd = (a, r = Math.random) => a[Math.floor(r() * a.length)];
const shuffle = (a, r = Math.random) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = v => Math.max(0, Math.min(100, v));
const EASE = 'cubic-bezier(.2,.7,.2,1)';

// Неоновые трубки: слева Кукуха и Энергия, справа Босс и Коллеги
const tube = r => `<div class="tube-wrap" id="st-${r.k}" data-k="${r.k}" role="meter" aria-label="${r.name}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
    <span class="arrows" id="mk-${r.k}" aria-hidden="true"></span>
    <div class="tube" aria-hidden="true"><div class="fill" id="fl-${r.k}"></div><i class="bub"></i><i class="bub"></i><i class="bub"></i></div><span class="steam" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="lbl" aria-hidden="true">${r.name}</span><span class="pct" id="pc-${r.k}" aria-hidden="true">50%</span><span class="zone" id="zn-${r.k}" aria-hidden="true"></span></div>`;
// Опасные зоны: у 0 — «на грани», у 100 — «перегрев»; оба края заканчивают неделю
const zoneOf = v => v >= 80 ? 'перегрев' : v <= 20 ? 'на грани' : '';
$('tubesL').innerHTML = RES.slice(0, 2).map(tube).join('');
$('tubesR').innerHTML = RES.slice(2).map(tube).join('');
const setPhase = p => { document.body.dataset.phase = p; };

// Офис за окном: утром пусто, днём все на местах, вечером горит одна лампа
(() => {
  let seed = 11; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  let city = '', x = 104;
  while (x < 1096) {
    const w = 30 + Math.floor(r() * 50), h = 60 + Math.floor(r() * 140);
    city += `<rect class="bld" x="${x}" y="${250 - h}" width="${w}" height="${h}"/>`;
    for (let wy = 256 - h; wy < 240; wy += 14) for (let wx = x + 6; wx < x + w - 8; wx += 12)
      if (r() > .35) city += `<rect class="cw${r() > .55 ? ' lit' : ''}" style="--d:${(r() * 2.4).toFixed(2)}s" x="${wx}" y="${wy}" width="5" height="7"/>`;
    x += w + 4;
  }
  const desk = (dx, i) => `<g class="desk${i === 3 ? ' last' : ''}">
    <rect class="mon" x="${dx + 60}" y="228" width="86" height="54" rx="4"/><rect class="stand" x="${dx + 98}" y="282" width="10" height="10"/>
    <g class="person"><circle cx="${dx + 103}" cy="262" r="15"/><path d="M${dx + 72} 300 q31 -34 62 0z"/></g>
    <rect class="top" x="${dx}" y="292" width="210" height="8" rx="2"/><rect class="leg" x="${dx + 10}" y="300" width="6" height="56"/><rect class="leg" x="${dx + 194}" y="300" width="6" height="56"/>
    ${i === 3 ? `<polygon class="lamp-glow" points="${dx + 176},214 ${dx + 120},292 ${dx + 220},292"/><path class="lamp" d="M${dx + 196} 292 v-62 l-24 -14"/><path class="lamp" d="M${dx + 160} 214 h28 l-6 -10 h-16z"/>` : ''}
  </g>`;
  $('office').innerHTML = `<svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice">
    <rect class="sky" x="100" y="20" width="1000" height="232"/>${city}
    <rect class="frame" x="100" y="20" width="1000" height="232"/><path class="frame" d="M350 20v232M600 20v232M850 20v232"/>
    <rect class="floor" x="0" y="356" width="1200" height="44"/>${[110, 380, 650, 920].map(desk).join('')}
    <g class="cooler"><rect class="bottle" x="1138" y="246" width="34" height="48" rx="10"/><circle class="cb" cx="1150" cy="288" r="3"/><circle class="cb" cx="1160" cy="290" r="2.4"/><circle class="cb" cx="1146" cy="292" r="2"/>
      <rect class="body" x="1132" y="294" width="46" height="62" rx="4"/><rect class="tap" x="1150" y="306" width="10" height="5" rx="2"/></g>
    <g class="walker"><circle cx="0" cy="300" r="13"/><path d="M-14 356 v-30 q14 -20 28 0 v30z"/><rect class="mug" x="14" y="318" width="9" height="11" rx="2"/></g></svg>`;
})();

function renderSound() {
  for (const b of [$('soundMenu'), $('soundGame')]) { b.textContent = prefs.sound ? '♪' : '×'; b.setAttribute('aria-pressed', prefs.sound); b.title = prefs.sound ? 'Звук включён' : 'Звук выключен'; }
}
function toggleSound() { prefs.sound = !prefs.sound; store.set(KEY.prefs, prefs); renderSound(); }
$('soundMenu').onclick = toggleSound; $('soundGame').onclick = toggleSound;

let toastT;
function toast(text) { const t = $('toastBar'); t.textContent = text; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600); }

// ---------- концовки-ачивки ----------
const endingsGot = () => store.get(KEY.endings, {});
function unlock(ids) {
  const got = endingsGot(), fresh = ids.filter(id => id && !got[id]);
  for (const id of fresh) got[id] = new Date().toISOString();
  if (fresh.length) store.set(KEY.endings, got);
  return fresh.map(id => ENDINGS.find(e => e.id === id)).filter(Boolean);
}
const endingsHtml = list => list.length ? `<div class="unlocked">${list.map(e => `<span>Новая концовка: «${esc(e.title)}»</span>`).join('')}</div>` : '';

// ---------- сборка недели ----------
let S = null, busy = false, splashOn = false, splashFor = -1;
const slotOf = (day, phase) => DAYS.indexOf(day) * 3 + PHASES.findIndex(p => p.name === phase);

// Неделя: карточки по расписанию → карточки вида недели (или пакета) → одна карточка профессии → случайные события
// classic — классическая неделя из cards.js; иначе карточки берутся из большого пула.
// seen — уже показанные карточки: из них ничего не берётся, так карточки не повторяются
function buildDeck({ prof, type = 'normal', rng = Math.random, extraRandom = [], profCard = true, packCards = [], classic = true, seen = null }) {
  const unseen = c => !seen || !seen.has(c.id);
  const used = new Set(), deck = [], randomPack = [...RANDOM_CARDS, ...extraRandom].filter(unseen); // свежая копия на каждую неделю
  const rules = WEEK_TYPES[type].rules, fixed = new Map();
  for (const c of [...(WEEK_TYPES[type].cards || []).filter(unseen), ...packCards]) fixed.set(slotOf(c.day, c.phase), c.id);
  for (let i = 0; i < 15; i++) {
    const d = Math.floor(i / 3), ph = PHASES[i % 3];
    if (fixed.has(i)) { const c = byId[fixed.get(i)]; deck.push({ id: c.id, time: c.time || PHASE_TIME[i % 3], fixed: true }); continue; }
    const ok = c => c.phase === ph.name && !used.has(c.id);
    const fresh = classic ? [] : POOL.filter(c => ok(c) && unseen(c));
    const special = CARDS.filter(c => ok(c) && c.day === DAYS[d]);
    const pool = fresh.length ? fresh : special.length ? special : CARDS.filter(c => ok(c) && !c.day);
    const standard = rnd(pool, rng); used.add(standard.id);
    deck.push({ id: standard.id, time: standard.time || PHASE_TIME[i % 3] });
  }
  const profLeft = profCard && prof && PROF_CARDS[prof] ? PROF_CARDS[prof].filter(unseen) : [];
  if (profLeft.length) {
    const free = deck.map((s, i) => s.fixed ? -1 : i).filter(i => i > 0 && i !== 14 && i >= 0);
    const i = rnd(free, rng), c = byId[rnd(profLeft, rng).id];
    deck[i] = { id: c.id, time: PHASE_TIME[i % 3], fixed: true };
  }
  deck.forEach((s, i) => {
    if (s.fixed) return;
    const card = getRandomCard(byId[s.id], randomPack, rules.randomChance ?? 15, rng);
    if (card.id !== s.id) deck[i] = { id: card.id, time: card.time || PHASE_TIME[i % 3] };
  });
  return deck;
}
const giveItems = (n, rng = Math.random) => shuffle(Object.keys(ITEMS), rng).slice(0, n);

function weekTypeFor(week, newJob) {
  if (newJob) return 'newboss';
  if (week % 13 === 0) return 'reports';
  if (week === 25 || week === 51) return 'vacation';
  return 'normal';
}
function newWeekState({ mode, res, type, rng = Math.random, extra = {} }) {
  const rules = WEEK_TYPES[type].rules;
  res = { ...res };
  for (const [k, v] of Object.entries(rules.start || {})) res[k] = clamp(res[k] + v);
  if (rules.bossStart) res.boss = rules.bossStart;
  for (const k in res) res[k] = Math.max(5, Math.min(95, res[k]));
  let n = rules.items || (rng() < .5 ? 1 : 2);
  if (mode === 'career' && prefs.bonusItems > 0) { const add = Math.min(prefs.bonusItems, 4 - n); n += add; prefs.bonusItems -= add; store.set(KEY.prefs, prefs); }
  return { mode, name: prefs.name, dept: prefs.dept, prof: extra.prof || prefs.prof, trait: extra.trait || prefs.trait, res, step: 0, type,
    items: giveItems(n, rng), used: [], flags: {}, ...extra };
}

// ---------- карьера: 52 недели ----------
let C = null;
const saveCareer = () => store.set(KEY.career, C);
const vacancy = id => VACANCIES.find(v => v.id === id);
// ---------- зарплата и отпуск ----------
// Оклад за рабочий день: 3 у.е. в простой компании, 4 и 5 — в компаниях посложнее
const salaryFor = v => 2 + (v?.level || 1);
const VAC_YEAR = 28, VAC_PER_WEEK = VAC_YEAR / YEAR;  // 28 календарных дней в году → ≈0,54 дня за неделю
const fmtDays = d => (Math.floor(d * 10) / 10).toLocaleString('ru-RU');
function pay(amount) { C.bank += amount; C.earned += amount; saveCareer(); }
// Расходы недели: жильё и еда — 2 дневных оклада, плюс платёж по кредиту. Счёт ниже нуля — долг, он давит на Кукуху
function weekExpenses(share = 1) {  // share — доля недели: при увольнении расходы только за отработанные дни
  const life = Math.round(C.salary * 2 * share), loanPay = Math.min(C.loan || 0, 6);
  C.bank -= life + loanPay; C.loan = (C.loan || 0) - loanPay; C.spent = (C.spent || 0) + life + loanPay; saveCareer();
  return { life, loanPay };
}
const expHtml = x => `<div class="money expense"><div><b>−${x.life} у.е.</b><span>жильё и еда</span></div><div><b>${x.loanPay ? `−${x.loanPay} у.е.` : '—'}</b><span>${C.loan ? `кредит, осталось ${C.loan}` : x.loanPay ? 'кредит погашен' : 'кредита нет'}</span></div></div>
  ${C.bank < 0 ? `<p class="debt">На счёте ${C.bank} у.е. — долг. В понедельник Кукуха −10, пока не выйдете в плюс.</p>` : ''}`;
function takeVacation() {
  if (!C || C.vacation < 7 || C.week > YEAR) return;
  const holidayPay = C.salary * 5;
  C.vacation = +(C.vacation - 7).toFixed(2); C.vacUsed += 7; C.week++;
  C.res = { psyche: 60, energy: 60, boss: 50, colleagues: 50 };
  pay(holidayPay); weekExpenses(); store.del(KEY.save);
  const over = C.week > YEAR;
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">Неделя ${C.week - 1} из ${YEAR} · отпуск 7 дней</span>
    <h1>Вы в отпуске!</h1>
    <p>Неделя без писем, созвонов и «срочно». В понедельник все шкалы вернутся к 50%, а Кукуха и Энергия — ещё и с запасом +10.</p>
    <div class="money"><div><b>+${holidayPay} у.е.</b><span>отпускные</span></div><div><b>${fmtDays(C.vacation)} дн.</b><span>отпуска осталось</span></div></div>
    <div class="stack"><button class="btn-main" id="next">${over ? 'Итоги года' : `Вернуться к работе · неделя ${C.week}`}</button><button class="btn-ghost" id="toMenu">В главное меню</button></div></div>`;
  setPhase('day'); show('end'); $('toMenu').onclick = renderMenu;
  $('next').onclick = () => over ? yearEnd() : startWeek(); confetti();
}
const freshRes = perk => {
  const res = { psyche: 50, energy: 50, boss: 50, colleagues: 50 };
  for (const b of [PROF[C.prof].bonus, perk || {}]) for (const [k, v] of Object.entries(b)) res[k] = clamp(res[k] + v);
  return res;
};
function newCareer() {
  prefs.prof = getProf(); prefs.trait = getTrait(); store.set(KEY.prefs, prefs);
  const first = rnd(VACANCIES.filter(v => v.level === 1));
  C = { prof: prefs.prof, trait: prefs.trait, week: 1, stage: 'work', company: first.name, companies: [first.name], res: null,
    worked: 0, firings: 0, passed: 0, failed: 0, newJob: false, bank: 0, earned: 0, salary: salaryFor(first), vacation: 0, vacUsed: 0 };
  C.res = freshRes(first.perk);
  saveCareer(); startWeek();
}
function continueCareer() {
  C = store.get(KEY.career, null);
  if (!C) return newCareer();
  C.trait = C.trait || prefs.trait;
  C.bank ??= 0; C.earned ??= 0; C.salary ??= 3; C.vacation ??= 0; C.vacUsed ??= 0;  // карьеры до появления зарплаты и отпуска
  const save = store.get(KEY.save, null);
  if (save && (save.mode || 'career') === 'career' && save.deck?.every(x => byId[x.id])) { S = { items: [], used: [], flags: {}, type: 'normal', mode: 'career', ...save }; return enterGame(); }
  if (C.week > YEAR) return yearEnd();
  if (C.stage === 'search') return jobSearch();
  startWeek();
}
// Показанные карточки копятся между карьерами; когда в фазе дня почти не остаётся новых, круг начинается заново
function seenSet() {
  const seen = new Set(store.get(KEY.seen, []));
  for (const ph of PHASES) {
    const left = POOL.filter(c => c.phase === ph.name && !seen.has(c.id)).length;
    if (POOL.length && left < 5) POOL.filter(c => c.phase === ph.name).forEach(c => seen.delete(c.id));
  }
  return seen;
}
function startWeek() {
  const type = weekTypeFor(C.week, C.newJob);
  C.newJob = false; saveCareer();
  S = newWeekState({ mode: 'career', res: C.res, type, extra: { prof: C.prof, trait: C.trait } });
  if (C.bank < 0) { S.res.psyche = Math.max(5, S.res.psyche - 10); setTimeout(() => toast(`Долг ${C.bank} у.е. давит: Кукуха −10`), 400); }
  const seen = seenSet(), classic = !seen.has('__classic') || !POOL.length;  // классическая неделя — только в самый первый раз
  const season = type === 'normal' && !classic ? activeSeason() : null;
  if (season) S.season = season.id;
  S.deck = buildDeck({ prof: C.prof, type, extraRandom: SUGGESTED, classic, seen, packCards: season ? SEASON_CARDS.filter(c => c.season === season.title && !seen.has(c.id)) : [] });
  if (!classic) placeCastCard(S.deck);
  for (const s of S.deck) seen.add(s.id);
  if (classic) seen.add('__classic');
  store.set(KEY.seen, [...seen]);
  store.set(KEY.save, S);
  enterGame();
}

// ---------- постоянные коллеги ----------
// Отношения хранятся в карьере (C.cast), в остальных режимах — только на неделю
const relStore = () => S?.mode === 'career' && C ? (C.cast ||= {}) : (S.castRel ||= {});
// Раз в неделю — карточка одного коллеги: сначала «расплата» (друг выручит, обиженный отомстит), иначе следующая глава истории
function placeCastCard(deck) {
  if (!CAST_CARDS.length) return;
  const rel = C.cast ||= {}, stage = C.castStage ||= {}, done = new Set(C.castSeen ||= []);
  const payoff = CAST_CARDS.find(c => !done.has(c.id) && (c.payoff === 'friend' && (rel[c.cast] || 0) >= 2 || c.payoff === 'enemy' && (rel[c.cast] || 0) <= -2));
  const next = Object.keys(CAST).map(k => CAST_CARDS.find(c => c.cast === k && c.stage === (stage[k] || 0) + 1)).filter(Boolean);
  const card = payoff || next.sort((a, b) => a.stage - b.stage)[Math.floor(Math.random() * Math.min(2, next.length))];
  if (!card) return;
  const free = deck.map((s, i) => s.fixed || i === 0 || i === 14 ? -1 : i).filter(i => i >= 0);
  if (!free.length) return;
  const i = rnd(free); deck[i] = { id: card.id, time: PHASE_TIME[i % 3], fixed: true };
}
// Ответ меняет отношение: у карточек истории — явно (rel), у остальных с именем коллеги — по знаку шкалы «Коллеги»
function castAfter(c, side, eff) {
  const k = c.cast || castOf(`${c.who} ${c.text}`);
  if (!k) return;
  const d = c.cast ? c.answers[side].rel || 0 : Math.sign(eff.colleagues || 0);
  if (c.cast && S.mode === 'career' && C) {
    if (c.stage) (C.castStage ||= {})[k] = Math.max(C.castStage[k] || 0, c.stage);
    else (C.castSeen ||= []).push(c.id);
  }
  if (!d) return;
  const rel = relStore(); rel[k] = Math.max(-3, Math.min(3, (rel[k] || 0) + d));
  if (S.mode === 'career' && C) saveCareer();
  FX.relNote(CAST[k].name, d);
}
const hearts = v => v > 0 ? '♥'.repeat(v) : v < 0 ? '💢'.repeat(-v) : '·';

// ---------- живые игроки ----------
// Неделя дня: после ответа — сколько игроков ответили так же (только сводные числа)
function livePick(c, side) {
  const el = $('pickStat'); el.hidden = true;
  if (S.mode !== 'daily' || !board.online) return;
  const step = S.step;
  board.rpc('pick_daily', { p_id: prefs.playerId, p_day: S.day, p_step: step, p_card: c.id, p_side: side }).then(r => {
    const x = Array.isArray(r) ? r[0] : r;
    if (!x?.total || S?.mode !== 'daily') return;
    el.textContent = x.total === 1 ? 'Вы первые ответили на эту карточку сегодня' : `Так же ответили ${Math.round(100 * x.same / x.total)}% · ${plural(x.total, 'ответ', 'ответа', 'ответов')} за сегодня`;
    el.hidden = false; FX.pulse(el, 'on', 4000);
  }).catch(() => {});  // старая база без pick_daily — просто без подсказки
}
// Кто сейчас играет: аватары тех, у кого статус «играет» последние 3 минуты
let liveT = 0;
async function liveTick() {
  clearTimeout(liveT);
  const el = $('live');
  if (views.game.hidden || !board.online) { el.hidden = true; return; }
  try {
    const me = await myTag, now = Date.now();
    const rows = (await board.people()).filter(p => p.status === 'playing' && p.tag !== me && now - new Date(p.updated_at) < 180000);
    el.hidden = !rows.length;
    el.innerHTML = rows.length ? `<i class="live-dot"></i><span class="live-ava">${rows.slice(0, 5).map(p => `<span title="${esc(p.name)}${p.dept ? ' · ' + esc(p.dept) : ''}">${esc(p.avatar || '🙂')}</span>`).join('')}</span><small>${rows.length > 5 ? `+${rows.length - 5} ` : ''}сейчас в игре ›</small>` : '';
    el.onclick = showOnlineModal;
  } catch { el.hidden = true; }
  liveT = setTimeout(liveTick, 30000);
}

// ---------- неделя дня и брендированная неделя ----------
// day — дата недели дня; прошлые даты (по ссылке-вызову) играются вне зачёта
function startDaily(day = today()) {
  const rng = seeded('vdp-daily-' + day);
  C = null;
  S = newWeekState({ mode: 'daily', res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: 'normal', rng, extra: { day } });
  const season = activeSeason(new Date(day + 'T12:00')); if (season) S.season = season.id;
  S.deck = buildDeck({ type: 'normal', rng, profCard: false, classic: !POOL.length, packCards: season ? SEASON_CARDS.filter(c => c.season === season.title) : [] });
  S.ranked = day === today() && !store.get(KEY.daily, {})[day];
  enterGame();
}
function startPack() {
  if (!PACK) return;
  C = null;
  S = newWeekState({ mode: 'pack', res: { psyche: 50, energy: 50, boss: 50, colleagues: 50 }, type: 'normal' });
  S.deck = buildDeck({ type: 'normal', profCard: false, packCards: PACK_CARDS, classic: !POOL.length });
  enterGame();
}

// ---------- игровой экран ----------
function enterGame() { busy = false; show('game'); splashFor = -1; liveTick(); $('pickStat').hidden = true; if (S.step === 0) track('week_start', { mode: S.mode }); renderBars(); renderCard(); }
// Статистика: анонимные события игры (без текста ответов); без Supabase не отправляются
function track(kind, o = {}) {
  if (!board.online || !prefs.name) return;
  board.rpc('log_event', { p_id: prefs.playerId, p_kind: kind, p_mode: o.mode || null, p_card: o.card || null, p_won: o.won ?? null, p_step: o.step ?? null, p_detail: o.detail || null }).catch(() => {});
}

function renderBars() {
  for (const r of RES) {
    const v = S.res[r.k];
    $('fl-' + r.k).style.setProperty('--v', v);
    $('pc-' + r.k).textContent = v + '%';
    const z = zoneOf(v), w = $('st-' + r.k);
    w.classList.toggle('danger', !!z); w.classList.toggle('hot', v >= 80); w.classList.toggle('low', v <= 20); $('zn-' + r.k).textContent = z;
    w.setAttribute('aria-valuenow', v); w.setAttribute('aria-valuetext', `${r.name}: ${v}%${z ? ', ' + z : ''}`);
  }
  const bc = $('bankChip'); bc.hidden = !(S.mode === 'career' && C); if (!bc.hidden) bc.textContent = `${C.bank} у.е. · магазин`;
  if ($('ctBank')) $('ctBank').textContent = `${C.bank} у.е.`;
  $('inv').innerHTML = S.items.map(id => `<span class="item${S.used.includes(id) ? ' used' : ''}" title="${ITEMS[id].text}">${ITEMS[id].name}</span>`).join('');
}
const headerLine = () => S.mode === 'career' && C ? `Неделя ${C.week}/${YEAR} · ${C.company}` : S.mode === 'daily' ? `Неделя дня ${dayLabel(S.day)}${S.ranked ? '' : ' · не в зачёт'}`
  : S.mode === 'tour' ? `Турнир · ${S.tourTeam}${S.ranked ? '' : ' · не в зачёт'}` : PACK?.company || '';

function renderCard() {
  const slot = S.deck[S.step], c = byId[slot.id], d = Math.floor(S.step / 3), ph = PHASES[S.step % 3];
  const card = $('card');
  const tag = slot.origin ? `<span class="rnd-tag chain">← ${esc(slot.origin)}</span>` : c.author ? `<span class="rnd-tag">ОТ КОЛЛЕГИ · ${esc(c.author)}</span>`
    : c.random ? '<span class="rnd-tag">! СЛУЧАЙНОЕ СОБЫТИЕ</span>' : c.profCard ? `<span class="rnd-tag prof">${PROF[S.prof].name.toUpperCase()}</span>` : '';
  const ck = c.cast || castOf(c.who), relTag = ck ? `<span class="rel-tag" title="Отношение: ${relStore()[ck] || 0}">${hearts(relStore()[ck] || 0)}</span>` : '';
  // в карьере внизу карточки — кнопки «Подсказка» и «Магазин»; там же появляется предложение подсказки
  const tools = S.mode === 'career' && C ? '<div class="card-tools" id="ctools"></div>' : '';
  card.innerHTML = `<div class="card-head">${portraitHtml(c.who)}<span class="who">${esc(c.who)}</span>${relTag}${tag}</div><div class="text" aria-live="polite"><span class="sr">${esc(c.who)}: </span>${esc(c.text)}</div>${tools}<div class="stamp" aria-hidden="true"></div>`;
  if (tools) cardTools();
  views.game.classList.toggle('pro', (prefs.gamesPlayed || 0) >= 2);  // опытным не нужна строка «тяните карточку…» — больше места карточке
  // вход новой карточки: последствие — перемотка, случайное событие — помехи, новый день — лист календаря, иначе — снизу
  const kind = slot.origin ? 'rewind' : c.random ? 'glitch' : S.step % 3 === 0 && S.step > 0 ? 'page' : null;
  card.style.transition = 'none'; card.style.transform = RM.matches || kind ? '' : 'translateY(28px) scale(.95)'; card.style.opacity = RM.matches || kind ? '' : '0';
  void card.offsetWidth;
  card.style.transition = RM.matches ? 'none' : `transform .38s ${EASE}, opacity .38s, border-color .2s, box-shadow .2s`; card.style.transform = ''; card.style.opacity = '';
  FX.enter(card, kind);
  setPhase(PHASE_KEY[S.step % 3]);
  $('btnL').innerHTML = `<span class="ar">←</span><span>${esc(c.answers.left.label)}</span>`;
  $('btnR').innerHTML = `<span>${esc(c.answers.right.label)}</span><span class="ar">→</span>`;
  FX.clock(slot.time);
  $('gCareer').textContent = headerLine();
  const zs = S.season && SEASONS.find(z => z.id === S.season);
  $('gType').textContent = S.type !== 'normal' ? WEEK_TYPES[S.type].title : zs ? zs.title : '';
  $('gDay').textContent = DAYS[d]; $('gPhase').textContent = ph.name.toLowerCase(); $('gNum').textContent = String(S.step + 1).padStart(2, '0');
  $('dots').innerHTML = S.deck.map((s, i) => `<i class="${i < S.step ? 'done' : i === S.step ? 'now' : ''}${s.origin && i > S.step ? ' chain' : ''}"></i>`).join('');
  clearPreview(); $('btnL').classList.remove('tip'); $('btnR').classList.remove('tip'); hintOffer();
  if (S.step % 3 === 0 && splashFor !== S.step) { splashFor = S.step; showSplash(d); }
  touchPlaying(d);
  coachFor(slot);
}
// Статус «играет» — раз в игровой день или раз в 30 секунд, а не на каждой карточке
let touchAt = 0, touchDay = -1;
function touchPlaying(d) {
  if (d === touchDay && Date.now() - touchAt < 30000) return;
  touchDay = d; touchAt = Date.now();
  board.touch('playing', S.step).catch(() => {});
}

// Обучение в первых неделях: по одной подсказке на карточку, каждая — один раз
const COACH = [
  ['swipe',  () => S.step === 0, 'Тяните карточку или наведите на ответ: ▲ и ▼ над шкалами покажут, что изменится. ▲▲ — сильный сдвиг.'],
  ['zones',  () => S.step >= 1, 'Держите шкалы между 20% и 80%. Ниже 20% — «на грани», выше 80% — «перегрев»: и 0%, и 100% заканчивают неделю.'],
  ['items',  () => S.step >= 2 && S.items.length, () => `В сумке ${S.items.map(i => ITEMS[i].name).join(', ')}: предмет сам отменит один удар −10 и сильнее по своей шкале. Значок ◆ — удар погасит предмет.`],
  ['chain',  slot => slot.origin, 'Карточка со стрелкой ← — последствие вашего прошлого решения. Решения возвращаются.'],
  ['hide',   () => WEEK_TYPES[S.type].rules.hideBoss, 'На этой неделе настроение Босса скрыто: вместо стрелок — «?».'],
];
function coachFor(slot) {
  const el = $('coach'), seen = prefs.coach || (prefs.coach = []);
  el.hidden = true;
  if (seen.length >= COACH.length || (prefs.gamesPlayed || 0) >= 3) return;
  const h = COACH.find(([k, when]) => !seen.includes(k) && when(slot));
  if (!h) return;
  seen.push(h[0]); store.set(KEY.prefs, prefs);
  el.innerHTML = `<b>Подсказка</b> ${esc(typeof h[2] === 'function' ? h[2]() : h[2])}<button type="button" aria-label="Скрыть подсказку">×</button>`;
  el.hidden = false; el.querySelector('button').onclick = () => { el.hidden = true; };
}

// Заставка перед началом каждого дня; в понедельник — вид недели и выданные предметы
function showSplash(d) {
  const el = $('splash'), T = WEEK_TYPES[S.type];
  const top = S.mode === 'career' && C ? `Неделя ${C.week} из ${YEAR} · ` : S.mode === 'daily' ? `Неделя дня ${dayLabel(S.day)} · ` : S.mode === 'tour' ? 'Турнир офиса · ' : '';
  const zs = S.season && SEASONS.find(z => z.id === S.season);
  const extra = d === 0 ? `<div class="splash-week">${S.mode === 'pack' ? esc(PACK.intro) : S.mode === 'tour' ? `<b>Турнир офиса «${esc(S.tourTeam)}»</b><span>Одна неделя для всех участников. В зачёт — первая попытка.</span>`
    : zs && S.type === 'normal' ? `<b>${zs.title}</b><span>${zs.rule}</span>` : `<b>${T.title}</b>${S.type !== 'normal' ? `<span>${T.rule}</span>` : ''}`}
    <span class="splash-items">В сумке: ${S.items.map(i => ITEMS[i].name).join(', ')} — ${S.items.length > 1 ? 'каждый отменит' : 'отменит'} один сильный удар по своей шкале.</span></div>` : '';
  el.innerHTML = `<div class="splash-in"><small>${top}День ${d + 1} из 5</small><h2>${DAYS[d]}</h2><p>${DAY_QUIP[d]}</p>${extra}<span class="tap">${d ? '' : 'нажмите или смахните, чтобы начать'}</span></div>`;
  // со второго дня заставка — баннер поверх игры: играть можно сразу
  el.classList.toggle('mini', d > 0); el.hidden = false; splashOn = d === 0;
  clearTimeout(splashT);
  const close = () => { splashOn = false; el.hidden = true; clearTimeout(splashT); };
  splashT = setTimeout(close, d === 0 ? 4200 : 1800);
  el.onclick = el.onpointerdown = close;
}
let splashT = 0;

const current = () => byId[S.deck[S.step].id];
// Эффекты ответа с правилами недели; предметы гасят удары −10 и сильнее
function effectsOf(side) {
  const rules = WEEK_TYPES[S.type].rules, raw = current().answers[side].effects, eff = {}, blocked = [];
  const free = S.items.filter(i => !S.used.includes(i));
  for (const r of RES) {
    let v = raw[r.k] || 0;
    if (r.k === 'boss' && rules.bossMul) v = Math.round(v * rules.bossMul / 5) * 5;
    if (r.k === 'psyche' && v < 0 && rules.psycheNegMul) v = Math.round(v * rules.psycheNegMul / 5) * 5;
    const item = v <= -10 && free.find(i => ITEMS[i].stat === r.k && !blocked.some(b => b.item === i));
    if (item) blocked.push({ item, stat: r.k, v });
    eff[r.k] = item ? 0 : v;
  }
  return { eff, blocked };
}

function preview(side) {
  const { eff, blocked } = effectsOf(side), hide = WEEK_TYPES[S.type].rules.hideBoss;
  for (const r of RES) {
    const v = eff[r.k], m = $('mk-' + r.k);
    if (blocked.some(b => b.stat === r.k)) m.innerHTML = '<span class="s" title="Удар погасит предмет">◆</span>';
    else if (hide && r.k === 'boss' && (current().answers[side].effects.boss || 0)) m.innerHTML = '<span class="q">?</span>';
    else m.innerHTML = v > 0 ? `<span class="u">${v >= 20 ? '▲▲' : '▲'}</span>` : v < 0 ? `<span class="d">${v <= -20 ? '▼▼' : '▼'}</span>` : '';
  }
  $('card').dataset.hot = side;
  $('btnL').classList.toggle('hot', side === 'left'); $('btnR').classList.toggle('hot', side === 'right');
  FX.stamp(side, .4);
  setMood(document.querySelector('#card .face'), speakerMood(current(), eff, side));
}
function clearPreview() {
  for (const r of RES) $('mk-' + r.k).innerHTML = '';
  delete $('card').dataset.hot; $('btnL').classList.remove('hot'); $('btnR').classList.remove('hot');
  FX.stamp(null);
  setMood(document.querySelector('#card .face'), 'neutral');
}
// Как отреагирует тот, кто говорит: коллега из истории — по отношению, остальные — по своей шкале
function speakerMood(c, eff, side) {
  if (c.cast) { const d = c.answers[side].rel || 0; return d > 0 ? 'happy' : d < 0 ? 'angry' : 'neutral'; }
  const [g, stat] = reactionGroup(c.who), v = eff[stat] || Object.values(eff).reduce((a, b) => a + b, 0);
  return moodFor(v, g === 'boss' || g === 'client' || g === 'hr');
}

// Реплика персонажа на ваш ответ — своим цветом
function reactionGroup(who) {
  if (castOf(who)) return ['colleagues', 'colleagues'];
  if (/босс|директор/i.test(who)) return ['boss', 'boss'];
  if (/hr|кадр|офис-менеджер/i.test(who)) return ['hr', 'boss'];
  if (/клиент|налогов/i.test(who)) return ['client', 'boss'];
  if (/коллег|чат|созвон|курьер|джун|отдел|бухгалтер|именин/i.test(who)) return ['colleagues', 'colleagues'];
  return ['self', 'psyche'];
}
function react(card, eff, side) {
  const note = card.answers?.[side]?.note;
  if (note) {  // онбординг: вместо реплики — подсказка, как принято
    const ok = card.correct ? card.correct === side : null, el = $('react');
    if (card.correct) { S.flags.obTotal = (S.flags.obTotal || 0) + 1; if (ok) S.flags.obOk = (S.flags.obOk || 0) + 1; }
    el.style.setProperty('--rc', ok === false ? '#ff3b6b' : '#d4ff3a');
    el.innerHTML = `<b>${ok === false ? 'Не совсем.' : 'Как у нас принято.'}</b> ${esc(note.replace(/^(Верно|Так не надо|Это фишинг)[:.]\s*/, ''))}`;
    el.classList.remove('on', 'long'); void el.offsetWidth; el.classList.add('on', 'long');
    return;
  }
  const [g, stat] = reactionGroup(card.who), R = REACTIONS[g];
  const v = eff[stat] || Object.values(eff).reduce((a, b) => a + b, 0);
  const mood = (v >= 0 ? 'pos' : 'neg') + (Math.abs(v) >= 20 && R[(v >= 0 ? 'pos' : 'neg') + 'Big'] ? 'Big' : '');
  const el = $('react');
  el.style.setProperty('--rc', R.color);
  el.innerHTML = `${portraitHtml(card.who, 'mini')}<span><b>${g === 'self' ? R.name : esc(card.who)}</b> ${esc(rnd(R[mood]))}</span>`;
  setMood(el.querySelector('.face'), speakerMood(card, eff, side));
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
}

function choose(side) {
  if (busy || splashOn || !S) return;
  busy = true; sfx.stapler(); buzz('tap');
  const card = $('card'), dir = side === 'left' ? -1 : 1, c = current();
  card.style.transition = RM.matches ? 'opacity .12s' : `transform .38s ${EASE}, opacity .38s`;
  if (!RM.matches) card.style.transform = `translateX(${dir * 1100}px) rotate(${dir * 26}deg)`;
  card.style.opacity = '0';
  $('coach').hidden = true;
  setTimeout(() => {
    const { eff, blocked } = effectsOf(side);
    for (const b of blocked) { S.used.push(b.item); toast(`${ITEMS[b.item].name}: удар по шкале «${resName(b.stat)}» отменён`); sfx.item(); FX.shield(ITEMS[b.item].name, b.stat); }
    for (const [k, v] of Object.entries(eff)) S.res[k] = clamp(S.res[k] + v);
    if (Object.values(eff).some(v => v <= -15)) sfx.sigh();
    if (RES.some(r => S.res[r.k] <= 15 || S.res[r.k] >= 85)) buzz('danger');
    if (c.id === 'rnd_cake' && side === 'right') S.flags.cake = true;
    // цепочка: решение вернётся в другой день недели
    const ch = CHAINS.find(x => x.from === c.id && x.side === side), at = ch && slotOf(ch.at.day, ch.at.phase);
    if (ch && at > S.step) S.deck[at] = { id: ch.card.id, time: PHASE_TIME[at % 3], fixed: true, origin: ch.origin };
    const pc = POOL_CHAINS.find(x => x.from === c.id && x.side === side), pat = pc && Math.min(14, S.step + pc.after);
    if (pc && pat > S.step && !S.deck[pat].origin) S.deck[pat] = { id: pc.card.id, time: PHASE_TIME[pat % 3], fixed: true, origin: pc.origin };
    clearPreview(); renderBars(); react(c, eff, side); FX.stats(eff); castAfter(c, side, eff); livePick(c, side);
    const deadLow = RES.find(r => S.res[r.k] <= 0), deadHigh = RES.find(r => S.res[r.k] >= 100), dead = deadLow || deadHigh;
    const best = store.get(KEY.best, { step: 0, wins: 0 });
    if (dead) FX.finale(dead.k, !deadLow);
    const pause = FX.off ? 650 : 1150;  // успеть показать взрыв шкалы или её угасание
    if (dead && !S.chanceUsed && QUIZ.length) { setTimeout(() => secondChance(dead.k, !deadLow), pause); return; }  // второй шанс — раз в неделю
    if (dead) { best.step = Math.max(best.step, S.step); store.set(KEY.best, best); store.del(KEY.save); setTimeout(() => lose(dead.k, !deadLow), pause); return; } // busy остаётся до следующей недели
    advance();
  }, RM.matches ? 120 : 380);
}
// Переход к следующей карточке (или к финалу недели)
function advance() {
  const best = store.get(KEY.best, { step: 0, wins: 0 });
  S.step++;
  if (S.mode === 'career' && C && S.step % 3 === 0) {  // вечер прошёл — рабочий день оплачен
    pay(C.salary); S.earned = (S.earned || 0) + C.salary; renderBars(); FX.coin(C.salary);
    toast(`+${C.salary} у.е. на счёт — зарплата за ${['понедельник', 'вторник', 'среду', 'четверг', 'пятницу'][S.step / 3 - 1]}`);
  }
  best.step = Math.max(best.step, S.step);
  if (S.step >= 15) { best.wins++; store.set(KEY.best, best); store.del(KEY.save); setTimeout(win, 550); return; }
  store.set(KEY.best, best); if (S.mode === 'career') store.set(KEY.save, S);
  renderCard(); busy = false;
}

// ---------- магазин мощей: деньги со счёта → предметы и подкрутка шкал ----------
const SHOP = { coffee: 6, headphones: 6, cookies: 6, sicknote: 9 };
const powerPrice = () => 12 * 2 ** (S.powerBuys || 0);
function openShop() {
  if (!(S?.mode === 'career' && C) || busy || splashOn) return;
  const m = $('modal');
  const render = () => {
    m.innerHTML = `<div class="modal-box glass shop-box" role="dialog" aria-modal="true" aria-labelledby="shopTitle">
      <h2 id="shopTitle">Магазин мощей</h2>
      <p class="shop-bal">На счёте: <b>${C.bank} у.е.</b> · оклад ${C.salary} у.е./день</p>
      <span class="shop-sec">Предметы — гасят один удар −10 и сильнее</span>
      <div class="shop-list">${Object.entries(SHOP).map(([id, price]) => `<button class="shop-item" data-item="${id}" ${C.bank < price || S.items.length >= 6 ? 'disabled' : ''}>
        <b>${ITEMS[id].name}</b><small>${ITEMS[id].text}</small><span class="price">${price} у.е.</span></button>`).join('')}</div>
      <span class="shop-sec">Мощь +20% — шкала отходит от края на 20 пунктов</span>
      <div class="shop-list">${RES.map(r => `<button class="shop-item" data-power="${r.k}" ${C.bank < powerPrice() || Math.abs(S.res[r.k] - 50) < 5 ? 'disabled' : ''}>
        <b>${r.name} ${S.res[r.k]}% → ${S.res[r.k] > 50 ? Math.max(50, S.res[r.k] - 20) : Math.min(50, S.res[r.k] + 20)}%</b><span class="price">${powerPrice()} у.е.</span></button>`).join('')}</div>
      <span class="shop-sec">Банк</span>
      <div class="shop-list"><button class="shop-item" id="loanBtn" ${C.loan ? 'disabled' : ''}><b>Кредит +20 у.е.</b><small>${C.loan ? `осталось вернуть ${C.loan} у.е.` : 'вернуть 24 у.е. — по 6 в неделю'}</small><span class="price">сразу на счёт</span></button></div>
      <p class="field-note">Каждая следующая «мощь» на этой неделе вдвое дороже. Каждую неделю списываются расходы на жильё и еду — два дневных оклада.</p>
      <button class="btn-ghost" id="shopClose">Закрыть</button></div>`;
    m.querySelectorAll('[data-item]').forEach(b => b.onclick = () => {
      const id = b.dataset.item; C.bank -= SHOP[id]; S.items.push(id); saveCareer(); store.set(KEY.save, S); sfx.item();
      toast(`Куплено: ${ITEMS[id].name}`); renderBars(); render();
    });
    m.querySelectorAll('[data-power]').forEach(b => b.onclick = () => {
      const k = b.dataset.power, v = S.res[k];
      C.bank -= powerPrice(); S.powerBuys = (S.powerBuys || 0) + 1;
      S.res[k] = v > 50 ? Math.max(50, v - 20) : Math.min(50, v + 20);
      saveCareer(); store.set(KEY.save, S); sfx.item(); toast(`«${resName(k)}»: ${v}% → ${S.res[k]}%`); renderBars(); render();
    });
    $('shopClose').onclick = () => { m.hidden = true; };
    $('loanBtn').onclick = () => { if (C.loan) return; C.bank += 20; C.loan = 24; saveCareer(); sfx.item(); toast('Кредит выдан: +20 у.е.'); renderBars(); render(); };
  };
  render(); m.hidden = false;
  m.onclick = e => { if (e.target === m) m.hidden = true; };
}
$('bankChip').onclick = openShop;

// ---------- подсказка за 6 у.е.: какой ответ лучше держит баланс ----------
// Предлагается сама, когда шкала у края (не чаще раза в игровой день), и всегда — по кнопке «Подсказка» у счёта
const HINT_PRICE = 6;
// Чем дальше самая слабая шкала от 0 и 100 после ответа, тем ответ безопаснее; конец недели — хуже всего
function hintScore(side) {
  const { eff } = effectsOf(side), after = RES.map(r => ({ k: r.k, v: clamp(S.res[r.k] + (eff[r.k] || 0)) }));
  const weak = after.reduce((a, b) => Math.min(b.v, 100 - b.v) < Math.min(a.v, 100 - a.v) ? b : a);
  const edge = Math.min(weak.v, 100 - weak.v);
  return { side, weak, edge: edge <= 0 ? -1 : edge, spread: after.reduce((n, x) => n + Math.abs(x.v - 50), 0) };
}
function hintAdvice() {
  const [a, b] = ['left', 'right'].map(hintScore);
  const best = a.edge !== b.edge ? (a.edge > b.edge ? a : b) : a.spread !== b.spread ? (a.spread < b.spread ? a : b) : null;
  return best;
}
function cardTools() {
  const el = $('ctools'); if (!el) return;
  const got = S.hintStep === S.step;
  el.className = 'card-tools';
  el.innerHTML = `<button class="ct-btn ct-hint${got ? ' done' : ''}" type="button" id="ctHint" ${got ? 'disabled' : ''}>💡 Подсказка <b>${got ? '✓' : HINT_PRICE + ' у.е.'}</b></button>
    <button class="ct-btn ct-shop" type="button" id="ctShop">🛒 Магазин <b id="ctBank">${C.bank} у.е.</b></button>`;
  $('ctHint').onclick = () => hintBar();
  $('ctShop').onclick = openShop;
}
function hintBar() {
  const el = $('ctools');
  if (!el || !(S?.mode === 'career' && C) || busy || splashOn || S.hintStep === S.step) return;
  // то же место, что у кнопок: «Получить» и «Отказаться», без сдвига карточки; почему — видно по шкале «на грани»
  const can = C.bank >= HINT_PRICE;
  el.className = 'card-tools ask';
  el.innerHTML = `<button class="ct-btn ct-hint" type="button" id="hbYes" ${can ? '' : 'disabled'}>💡 Получить <b>${can ? HINT_PRICE + ' у.е.' : 'нет денег'}</b></button>
    <button class="ct-btn ct-no" type="button" id="hbNo">Отказаться</button>`;
  FX.pulse(el, 'on', 500);
  $('hbNo').onclick = cardTools;
  $('hbYes').onclick = () => {
    if (C.bank < HINT_PRICE || busy) return;
    C.bank -= HINT_PRICE; C.spent = (C.spent || 0) + HINT_PRICE; saveCareer(); renderBars(); sfx.item();
    const best = hintAdvice();
    S.hintStep = S.step;
    el.className = 'card-tools said';
    if (!best) { el.innerHTML = '<span class="ct-q">💡 Оба ответа примерно одинаково влияют на баланс — выбирайте по душе.</span>'; return; }
    const w = RES.find(r => r.k === best.weak.k);
    $(best.side === 'left' ? 'btnL' : 'btnR').classList.add('tip');
    el.innerHTML = `<span class="ct-q">💡 Лучше <b>${best.side === 'left' ? '← влево' : 'вправо →'}</b> · ${best.edge < 0 ? 'но и он заканчивает неделю' : `${w.name} станет ${best.weak.v}%`}</span>`;
  };
}
// Сама предлагает подсказку, когда шкала у края: раз в игровой день и только если хватает денег
function hintOffer() {
  if (!(S?.mode === 'career' && C) || C.bank < HINT_PRICE || prefs.hintOff) return;
  const day = Math.floor(S.step / 3);
  if (S.hintDay === day || !RES.some(r => S.res[r.k] <= 20 || S.res[r.k] >= 80)) return;
  S.hintDay = day;
  setTimeout(() => { if (S && !busy) hintBar(); }, 700);
}

// ---------- второй шанс: вопрос на эрудицию ----------
// Шкала дошла до 0 или 100 → вопрос с 4 вариантами и 20 секундами. Верно — шкала отступает от края на 20%, неделя продолжается
const QUIZ_TIME = 20;
function pickQuestion() {
  let seen = new Set(store.get(KEY.qseen, []));
  let left = QUIZ.filter(q => !seen.has(q.id));
  if (!left.length) { seen = new Set(); left = QUIZ; }  // все вопросы заданы — круг начинается заново
  const q = rnd(left); seen.add(q.id); store.set(KEY.qseen, [...seen]);
  return q;
}
function secondChance(k, high) {
  S.chanceUsed = true; if (S.mode === 'career') store.set(KEY.save, S);
  const q = pickQuestion(), el = $('quiz');
  el.innerHTML = `<div class="quiz-box">
    <span class="kicker">Второй шанс · ${resName(k)} ${high ? '100' : '0'}%</span>
    <h2 id="quizTitle">Вопрос на эрудицию</h2>
    <p class="q-lead">Ответьте верно — и шкала «${resName(k)}» отступит от края на 20%. Ошибка — увольнение.</p>
    <span class="q-topic">${esc(q.topic)}</span>
    <div class="q-text">${esc(q.q)}</div>
    <div class="q-timer" aria-hidden="true"><i id="qBar"></i></div>
    <div class="q-opts">${q.options.map((o, i) => `<button class="q-opt" data-i="${i}"><span class="n">${i + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>
    <div id="qAfter" hidden><p class="q-result" id="qRes"></p><p class="q-fact">${esc(q.fact)}</p><div class="stack" style="margin-top:12px"><button class="btn-main" id="qNext"></button></div></div>
  </div>`;
  el.hidden = false; sfx.sigh();
  const bar = $('qBar'); bar.style.setProperty('--qt', QUIZ_TIME + 's'); void bar.offsetWidth; bar.classList.add('run');
  const btns = [...el.querySelectorAll('.q-opt')];
  let done = false;
  const finish = picked => {
    if (done) return; done = true; clearTimeout(timer); document.removeEventListener('keydown', keys); document.removeEventListener('visibilitychange', onVis);
    const ok = picked === q.answer;
    btns.forEach((b, i) => { b.disabled = true; if (i === q.answer) b.classList.add('right'); else if (i === picked) b.classList.add('wrong'); });
    bar.style.animationPlayState = 'paused';
    $('qRes').className = 'q-result ' + (ok ? 'ok' : 'bad');
    $('qRes').textContent = ok ? `Верно! «${resName(k)}» отступает от края на 20%.` : picked === -1 ? `Время вышло. Правильный ответ: «${q.options[q.answer]}».` : `Неверно. Правильный ответ: «${q.options[q.answer]}».`;
    $('qNext').textContent = ok ? 'Продолжить неделю' : 'Принять судьбу';
    $('qAfter').hidden = false; $('qNext').focus({ preventScroll: true });
    ok ? sfx.item() : sfx.stamp();
    track('quiz', { won: ok, card: q.id, mode: S.mode });
    $('qNext').onclick = () => {
      el.hidden = true;
      if (ok) {
        S.res[k] = high ? 80 : 20; S.flags.saved = true;
        const got = unlock(['quiz_saved']); if (got.length) toast(`Новая концовка: «${got[0].title}»`);
        renderBars(); advance();
      } else {
        unlock(['quiz_fail']);
        const best = store.get(KEY.best, { step: 0, wins: 0 });
        best.step = Math.max(best.step, S.step); store.set(KEY.best, best); store.del(KEY.save);
        lose(k, high);
      }
    };
  };
  // таймер с паузой: если свернуть приложение, время не идёт
  let left = QUIZ_TIME * 1000, startedAt = Date.now(), timer = setTimeout(() => finish(-1), left);
  const onVis = () => {
    if (done) return document.removeEventListener('visibilitychange', onVis);
    if (document.hidden) { clearTimeout(timer); left -= Date.now() - startedAt; bar.style.animationPlayState = 'paused'; }
    else { startedAt = Date.now(); timer = setTimeout(() => finish(-1), Math.max(0, left)); bar.style.animationPlayState = 'running'; }
  };
  document.addEventListener('visibilitychange', onVis);
  const keys = e => { const n = +e.key; if (n >= 1 && n <= 4) { e.preventDefault(); finish(n - 1); } };
  document.addEventListener('keydown', keys);
  btns.forEach(b => b.onclick = () => finish(+b.dataset.i));
  btns[0].focus({ preventScroll: true });
}

// свайп: превью после 40 px, выбор после 140 px (на узком экране — после 30 % ширины)
(() => {
  const card = $('card'); let x0 = 0, dx = 0, t0 = 0, drag = false, pid = null;
  card.addEventListener('pointerdown', e => {
    if (busy || splashOn || e.target.closest('.card-tools')) return; drag = true; pid = e.pointerId; x0 = e.clientX; dx = 0; t0 = performance.now();
    card.setPointerCapture(pid); card.style.transition = 'border-color .2s, box-shadow .2s'; card.classList.remove('idle');
  });
  card.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== pid) return;
    dx = e.clientX - x0;
    card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
    if (Math.abs(dx) > 40) preview(dx < 0 ? 'left' : 'right'); else clearPreview();
    if (Math.abs(dx) > 20) FX.stamp(dx < 0 ? 'left' : 'right', (Math.abs(dx) - 20) / Math.min(140, innerWidth * .3));
  });
  const end = e => {
    if (!drag || e.pointerId !== pid) return; drag = false;
    const limit = Math.min(140, innerWidth * .3), v = Math.abs(dx) / Math.max(1, performance.now() - t0);
    if (Math.abs(dx) > limit || (Math.abs(dx) > 50 && v > .7)) { choose(dx < 0 ? 'left' : 'right'); return; }
    card.style.transition = `transform .3s ${EASE}, border-color .2s, box-shadow .2s`; card.style.transform = ''; clearPreview(); card.classList.add('idle');
  };
  card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
})();

for (const [id, side] of [['btnL', 'left'], ['btnR', 'right']]) {
  const b = $(id);
  b.addEventListener('mouseenter', () => !busy && !splashOn && preview(side));
  b.addEventListener('focus', () => !busy && !splashOn && preview(side));
  b.addEventListener('mouseleave', clearPreview);
  b.addEventListener('blur', clearPreview);
  b.addEventListener('click', () => choose(side));
}
document.addEventListener('keydown', e => {
  if (views.game.hidden || !$('modal').hidden) return;
  if (splashOn && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== 'Tab') { e.preventDefault(); $('splash').click(); return; }
  if (e.key === 'ArrowLeft') { e.preventDefault(); choose('left'); }
  if (e.key === 'ArrowRight') { e.preventDefault(); choose('right'); }
});

// ---------- финалы недели ----------
function finalGrid(zeroKey) {
  return `<div class="final">${RES.map(r => `<div class="${r.k === zeroKey ? 'zero' : ''}"><b>${S.res[r.k]}%</b><span>${r.name}</span></div>`).join('')}</div>`;
}
const viralHtml = () => `<div class="viral"><b>Позовите коллег — проверим, кто дольше продержится до пятницы</b>
  <div class="row2"><button class="btn-main" data-share="team">Позвать коллег</button><button class="btn-ghost" data-share="friends">Рассказать друзьям</button></div></div>`;
function bindCommon() { bindShare(views.end); $('toMenu').onclick = renderMenu; if ($('toBoard')) $('toBoard').onclick = () => openBoard('end', S?.mode === 'daily' ? 'daily' : 'rating'); }
const traitText = (kind, trait) => TRAITS[trait || 'workaholic'][kind];
const onboardingLine = () => S.flags.obTotal ? `<div class="place"><b>${S.flags.obOk || 0}/${S.flags.obTotal}</b><span>правильных решений в учебной неделе</span></div>` : '';
function rank(total) { return total >= 280 ? 'Легенда опенспейса' : total >= 220 ? 'Сеньор по выживанию' : total >= 160 ? 'Крепкий мидл' : 'Чудом уцелевший стажёр'; }

function weekEndings(won, k, high) {
  const ids = [], d = Math.floor(S.step / 3);
  if (S.used.length >= 2) ids.push('items2');
  if (won) {
    const v = Object.values(S.res);
    if (v.every(x => x >= 40 && x <= 60)) ids.push('zen_week');
    if (v.some(x => x < 10 || x > 90)) ids.push('edge');
  } else {
    ids.push(high ? { boss: d === 4 ? 'boss_fri' : null, colleagues: 'party', psyche: 'zen', energy: 'battery' }[k]
      : { psyche: 'cooler', energy: 'zoom', boss: 'two_words', colleagues: 'wifi' }[k]);
    if (d === 0) ids.push('monday');
    if (S.step === 14) ids.push('almost');
    if (S.flags.cake) ids.push('cake');
  }
  return unlock(ids);
}

function lose(k, high) {
  sfx.lose();
  const D = (high ? DEATH_HIGH : DEATH)[k], d = Math.floor(S.step / 3), ph = PHASES[S.step % 3];
  const got = weekEndings(false, k, high), career = S.mode === 'career' && C;
  let next = '';
  if (career) {
    var company = C.company, comp = Math.floor(C.vacation) * C.salary, paidDays = Math.floor(S.step / 3);
    C.firings++; C.week++; C.stage = 'search'; C.res = null; C.vacation = 0;
    if (comp) pay(comp); else saveCareer();
    var exp = weekExpenses(paidDays / 5);
    next = C.week > YEAR ? 'Итоги года' : 'Искать работу';
  }
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">${career ? `Вас уволили · ${DAYS[d].toLowerCase()}, ${ph.name.toLowerCase()} · ${esc(company)}` : `Неделя закончилась досрочно · ${DAYS[d].toLowerCase()}, ${ph.name.toLowerCase()}`}</span>
    <h1 class="lose">${high ? 'ПЕРЕГРЕВ' : 'НЕДЕЛЯ ЗАВАЛЕНА'}</h1>
    <p class="cause">${D.title} · ${esc(S.name)}, ${PROF[S.prof].name.toLowerCase()}</p>
    <p>${D.text}</p>
    <p class="trait-line">${TRAITS[S.trait || 'workaholic'].name}: ${traitText('lose', S.trait)}</p>
    ${finalGrid(k)}
    ${career ? `<div class="money"><div><b>+${S.earned || 0} у.е.</b><span>за ${paidDays} отраб. дн.</span></div><div><b>+${comp} у.е.</b><span>компенсация отпуска</span></div></div>${expHtml(exp)}` : ''}
    ${endingsHtml(got)}
    ${challengeLine(false, k)}
    <div class="place" id="place" aria-live="polite">Записываю результат в рейтинг…</div>
    ${viralHtml()}
    ${onboardingLine()}
    <div class="stack">${career ? `<button class="btn-main" id="next">${next}</button>` : `<button class="btn-main" id="next">${S.mode === 'daily' ? 'Сыграть неделю дня ещё раз' : S.mode === 'tour' ? 'Экран итогов турнира' : 'Сыграть ещё раз'}</button>`}
      <button class="btn-ghost btn-share" id="share">${S.mode === 'daily' ? 'Поделиться и вызвать коллег' : 'Поделиться результатом'}</button>
      <button class="btn-ghost" id="toBoard">${S.mode === 'daily' ? 'Рейтинг дня' : 'Рейтинг офиса'}</button><button class="btn-ghost" id="toMenu">В главное меню</button></div>
  </div>`;
  show('end'); bindCommon();
  $('share').onclick = () => share(false, k);
  $('next').onclick = () => career ? (C.week > YEAR ? yearEnd() : jobSearch()) : S.mode === 'daily' ? startDaily() : S.mode === 'tour' ? openScreen(S.tourCode) : startPack();
  record(false, k, high);
  track('week_end', { mode: S.mode, won: false, step: S.step, card: S.deck[S.step]?.id, detail: `${k}${high ? ':100' : ':0'}` });
  $('next').focus({ preventScroll: true });
}

function win() {
  sfx.win(); FX.doors();
  const total = RES.reduce((a, r) => a + S.res[r.k], 0), got = weekEndings(true), career = S.mode === 'career' && C;
  let week, last = false;
  if (career) {
    week = C.week;
    // выходные: каждая шкала сдвигается к 50 наполовину
    C.worked++; C.week++; C.res = Object.fromEntries(RES.map(r => [r.k, Math.round((S.res[r.k] + 50) / 2)]));
    C.vacation = +(C.vacation + VAC_PER_WEEK).toFixed(2); saveCareer();
    var exp = weekExpenses();
    last = C.week > YEAR;
  }
  if (last || !career) confetti();
  const kicker = career ? `Неделя ${week} из ${YEAR} · ${esc(C.company)} · пятница, 18:00` : S.mode === 'daily' ? `Неделя дня ${dayLabel(S.day)} · пятница, 18:00`
    : S.mode === 'tour' ? `Турнир офиса «${esc(S.tourTeam)}» · пятница, 18:00` : `${esc(PACK.title)} · пятница, 18:00`;
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">${kicker}</span>
    <h1>${last ? 'Год позади!' : 'Неделя закрыта!'}</h1>
    <p>${traitText('win', S.trait)}</p>
    ${career && !last ? '<p class="trait-line">Выходные сгладят всё наполовину: в понедельник каждая шкала сдвинется к 50%.</p>' : ''}
    <span class="rank">${rank(total)}</span>
    ${finalGrid()}
    <div class="total"><span>Счёт недели</span><b>${total} / 400</b></div>
    ${career ? `<div class="money"><div><b>${C.bank} у.е.</b><span>на счёте (+${S.earned || 0} за неделю)</span></div><div><b>${fmtDays(C.vacation)} дн.</b><span>отпуска накоплено</span></div></div>${expHtml(exp)}` : ''}
    ${endingsHtml(got)}
    ${challengeLine(true)}
    <div class="place" id="place" aria-live="polite">Записываю результат в рейтинг…</div>
    ${viralHtml()}
    ${onboardingLine()}
    <div class="stack"><button class="btn-main" id="next">${career ? (last ? 'Итоги года' : `Неделя ${C.week} →`) : S.mode === 'tour' ? 'Экран итогов турнира' : 'В главное меню'}</button>
      ${career && !last && C.vacation >= 7 ? '<button class="btn-ghost btn-vac" id="vac">Уйти в отпуск на неделю (7 дн.)</button>' : ''}
      <button class="btn-ghost btn-share" id="share">${S.mode === 'daily' ? 'Поделиться и вызвать коллег' : 'Поделиться результатом'}</button>
      <button class="btn-ghost" id="toBoard">${S.mode === 'daily' ? 'Рейтинг дня' : 'Рейтинг офиса'}</button><button class="btn-ghost" id="toMenu">В главное меню</button></div>
  </div>`;
  show('end'); bindCommon();
  $('share').onclick = () => share(true);
  if ($('vac')) $('vac').onclick = takeVacation;
  $('next').onclick = () => career ? (last ? yearEnd() : startWeek()) : S.mode === 'tour' ? openScreen(S.tourCode) : renderMenu();
  record(true, null, false);
  track('week_end', { mode: S.mode, won: true, step: 15 });
  $('next').focus({ preventScroll: true });
}

// Поиск работы: три вакансии, кроме места, откуда только что уволили
function jobSearch() {
  if (C.week > YEAR) return yearEnd();
  if (!C.offers?.length) { C.offers = shuffle(VACANCIES.filter(v => v.name !== C.company)).slice(0, 3).map(v => v.id); saveCareer(); }
  const perkText = p => Object.entries(p).map(([k, v]) => `${resName(k)} ${v > 0 ? '+' : '−'}${Math.abs(v)}`).join(' · ');
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">Неделя ${C.week} из ${YEAR} · поиск работы</span>
    <h1>Вакансии</h1>
    <p>Выберите, куда откликнуться. Собеседование займёт неделю: 4 вопроса от HR. Первая неделя на новом месте — с новым боссом.</p>
    <div class="vacancies">${C.offers.map(id => { const v = vacancy(id);
      return `<button class="vac" data-id="${v.id}"><b>${esc(v.name)}</b><span class="lvl">${'●'.repeat(v.level)}${'○'.repeat(3 - v.level)}</span>
        <small>${esc(v.vibe)}</small><span class="perk">старт: ${perkText(v.perk)} · оклад ${salaryFor(v)} у.е./день</span></button>`; }).join('')}</div>
    <div class="stack"><button class="btn-ghost" id="toMenu">В главное меню</button></div>
  </div>`;
  show('end');
  $('toMenu').onclick = renderMenu;
  views.end.querySelectorAll('.vac').forEach(b => b.onclick = () => interview(vacancy(b.dataset.id)));
  board.touch('menu').catch(() => {});
}

// Собеседование: 6 вопросов (один — по профессии) + финальный. Заданные вопросы запоминаются,
// повторы — только когда незаданных не осталось
const IV_COUNT = 6;
function pickInterview(prof) {
  const seen = new Set(store.get(KEY.ivseen, []));
  const take = (list, n) => {
    let left = shuffle(list.filter(x => !seen.has(x.id)));
    if (left.length < n) { const old = shuffle(list.filter(x => seen.has(x.id))); for (const x of list) seen.delete(x.id); left = left.concat(old); }
    const out = left.slice(0, n); for (const x of out) seen.add(x.id); return out;
  };
  const own = IV.filter(x => !x.last && x.prof === prof), main = IV.filter(x => !x.last && !x.prof), last = IV.filter(x => x.last);
  const mine = take(own, Math.min(1, own.length));
  const qs = shuffle(mine.concat(take(main, IV_COUNT - mine.length))).concat(take(last, 1));
  store.set(KEY.ivseen, [...seen]);
  return qs;
}
// Проходной балл зависит от уровня вакансии: из 14 возможных нужно 7, 9 или 11
function interview(v) {
  const qs = pickInterview(C.prof);
  const need = Math.round(qs.length * 2 * { 1: .5, 2: .64, 3: .79 }[v.level]);
  let i = 0, score = 0;
  const step = () => {
    const q = qs[i];
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">Неделя ${C.week} из ${YEAR} · собеседование · ${esc(v.name)}</span>
      <div class="iv-dots">${qs.map((_, j) => `<i class="${j < i ? 'done' : j === i ? 'now' : ''}"></i>`).join('')}</div>
      <div class="iv-q"><span class="who">HR · вопрос ${i + 1} из ${qs.length}</span><div class="text">${esc(q.q)}</div><div class="iv-reply" id="ivReply" aria-live="polite"></div></div>
      <div class="iv-answers">${shuffle(q.a).map(a => `<button class="ans" data-s="${a.score}" data-r="${esc(a.reply)}">${esc(a.label)}</button>`).join('')}</div>
    </div>`;
    show('end');
    const btns = [...views.end.querySelectorAll('.iv-answers .ans')];
    btns.forEach(b => b.onclick = () => {
      btns.forEach(x => x.disabled = true); b.classList.add('picked');
      score += +b.dataset.s; $('ivReply').textContent = `HR: ${b.dataset.r}`; sfx.stapler();
      setTimeout(() => { i++; i < qs.length ? step() : verdict(); }, 1500);
    });
    btns[0].focus({ preventScroll: true });
  };
  const verdict = () => {
    const ok = score >= need, got = unlock([score === qs.length * 2 ? 'perfect_iv' : null]);
    C.week++; C.offers = [];
    if (ok) { C.passed++; C.stage = 'work'; C.newJob = true; C.company = v.name; C.salary = salaryFor(v); if (!C.companies.includes(v.name)) C.companies.push(v.name); C.res = freshRes(v.perk); sfx.win(); }
    else { C.failed++; sfx.lose(); }
    saveCareer();
    const over = C.week > YEAR;
    views.end.innerHTML = `<div class="end-sheet glass">
      <span class="kicker">Собеседование · ${esc(v.name)} · ${score} из ${qs.length * 2} баллов, нужно ${need}</span>
      <h1 class="${ok ? '' : 'lose'}">${ok ? 'Оффер!' : 'Мы вам перезвоним'}</h1>
      <p>${ok ? `${esc(v.name)} ждёт вас в понедельник. Новое место — свежий старт: шкалы снова около 50%. Оклад — ${C.salary} у.е. в день.` : '…но не перезвонили. Поиск продолжается, впереди новые вакансии.'}</p>
      ${endingsHtml(got)}
      <div class="stack"><button class="btn-main" id="next">${over ? 'Итоги года' : ok ? `Выйти на работу · неделя ${C.week}` : `Искать дальше · неделя ${C.week}`}</button>
        <button class="btn-ghost" id="toMenu">В главное меню</button></div>
    </div>`;
    show('end');
    $('toMenu').onclick = renderMenu;
    $('next').onclick = () => over ? yearEnd() : ok ? startWeek() : jobSearch();
    $('next').focus({ preventScroll: true });
    if (ok) confetti();
  };
  step();
}

function yearRank(w) { return w >= 52 ? 'Железный сотрудник года' : w >= 40 ? 'Опора офиса' : w >= 26 ? 'Опытный выживальщик' : w >= 10 ? 'Вечный соискатель' : 'Свободный художник'; }
function yearEnd() {
  store.del(KEY.save);
  const all = C.passed + C.failed;
  if (C.vacation >= 1 && !C.paidOut) { pay(Math.floor(C.vacation) * C.salary); C.paidOut = true; saveCareer(); }  // компенсация неиспользованного отпуска
  const got = unlock([C.companies.length >= 5 ? 'nomad' : null, C.worked >= YEAR && !C.firings ? 'iron' : null]);
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">Год позади · ${YEAR} недель · ${esc(prefs.name)}, ${PROF[C.prof].name.toLowerCase()}</span>
    <h1>Итоги года</h1>
    <span class="rank">${yearRank(C.worked)}</span>
    <p>${traitText('year', C.trait)}</p>
    <div class="career-card" style="width:100%">
      <div class="stat-box"><b>${C.worked}</b><span>недель отработано</span></div>
      <div class="stat-box"><b>${C.firings}</b><span>увольнений</span></div>
      <div class="stat-box"><b>${C.passed}/${all}</b><span>собеседований пройдено</span></div>
    </div>
    <div class="money"><div><b>${C.earned} у.е.</b><span>заработано за год</span></div><div><b>${C.vacUsed} из ${VAC_YEAR} дн.</b><span>отпуска использовано</span></div></div>
    <p>Где вы успели поработать:</p>
    <ul class="companies">${C.companies.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
    ${endingsHtml(got)}
    <div class="stack"><button class="btn-main" id="again">Новый год карьеры</button>
      <button class="btn-ghost" id="toBoard">Рейтинг офиса</button><button class="btn-ghost" id="toMenu">В главное меню</button></div>
  </div>`;
  show('end'); bindCommon();
  $('again').onclick = () => { store.del(KEY.career); newCareer(); };
  if (C.worked >= 40) confetti();
}

// ---------- коллекция концовок ----------
function showCollection() {
  const got = endingsGot();
  views.end.innerHTML = `<div class="end-sheet glass">
    <span class="kicker">Открыто ${Object.keys(got).length} из ${ENDINGS.length}</span>
    <h1>Коллекция концовок</h1>
    <div class="collection">${ENDINGS.map(e => got[e.id]
      ? `<div class="ach on"><b>${esc(e.title)}</b><small>${esc(e.hint)}</small></div>`
      : `<div class="ach"><b>???</b><small>${esc(e.hint)}</small></div>`).join('')}</div>
    <div class="stack"><button class="btn-ghost" id="toMenu">В главное меню</button></div>
  </div>`;
  setPhase('evening'); show('end'); $('toMenu').onclick = renderMenu;
}

// ---------- «Предложи ситуацию» ----------
function showSuggest() {
  const sel = (side, k) => `<label class="eff"><span>${resName(k)}</span><select id="ef-${side}-${k}">
    <option value="-20">▼▼</option><option value="-10">▼</option><option value="0" selected>—</option><option value="10">▲</option><option value="20">▲▲</option></select></label>`;
  views.end.innerHTML = `<form class="end-sheet glass suggest" id="sgForm" novalidate>
    <span class="kicker">Карточка от коллеги · после модерации появится в игре с подписью «${esc(prefs.name)}»</span>
    <h1>Предложить ситуацию</h1>
    <div class="field"><label for="sgWho">Кто говорит</label><input id="sgWho" type="text" maxlength="24" value="Коллега"></div>
    <div class="field"><label for="sgText">Ситуация *</label><textarea id="sgText" maxlength="240" rows="3" placeholder="Например: «Коллега третий раз за день просит „быстро глянуть“ его отчёт»"></textarea></div>
    <div class="sg-side"><div class="field"><label for="sgLeft">Ответ влево *</label><input id="sgLeft" type="text" maxlength="60" placeholder="Отказать"></div>
      <div class="effs">${RES.map(r => sel('l', r.k)).join('')}</div></div>
    <div class="sg-side"><div class="field"><label for="sgRight">Ответ вправо *</label><input id="sgRight" type="text" maxlength="60" placeholder="Согласиться"></div>
      <div class="effs">${RES.map(r => sel('r', r.k)).join('')}</div></div>
    <p class="join-err" id="sgErr" role="alert"></p>
    <div class="stack"><button class="btn-main" type="submit" id="sgGo">Отправить на модерацию</button><button class="btn-ghost" type="button" id="toMenu">В главное меню</button></div>
  </form>`;
  setPhase('evening'); show('end'); $('toMenu').onclick = renderMenu;
  $('sgForm').onsubmit = async e => {
    e.preventDefault();
    const text = $('sgText').value.trim(), l = $('sgLeft').value.trim(), r = $('sgRight').value.trim();
    if (text.length < 10 || !l || !r) { $('sgErr').textContent = 'Опишите ситуацию (хотя бы 10 символов) и оба ответа.'; return; }
    const effs = side => Object.fromEntries(RES.map(x => [x.k, +$(`ef-${side}-${x.k}`).value]));
    $('sgGo').disabled = true; $('sgGo').textContent = 'Отправляю…';
    try {
      await board.suggest({ author: prefs.name, who: $('sgWho').value.trim() || 'Коллега', text, left_label: l, right_label: r, left_effects: effs('l'), right_effects: effs('r') });
      views.end.innerHTML = `<div class="end-sheet glass"><span class="kicker">Отправлено</span><h1>Спасибо!</h1>
        <p>Карточка ушла на модерацию. Когда её одобрят, она начнёт выпадать как случайное событие с подписью «${esc(prefs.name)}».</p>
        <div class="stack"><button class="btn-main" id="again">Предложить ещё</button><button class="btn-ghost" id="toMenu">В главное меню</button></div></div>`;
      $('again').onclick = showSuggest; $('toMenu').onclick = renderMenu;
    } catch (err) { $('sgErr').textContent = `Не получилось отправить: ${err.message}`; $('sgGo').disabled = false; $('sgGo').textContent = 'Отправить на модерацию'; }
  };
}

// ---------- серия дней: неделя дня несколько дней подряд ----------
// Каждый день серии даёт в карьеру по 2 у.е. за день серии (максимум 14), семь дней подряд — концовка
function updateStreak(day) {
  const st = prefs.streak || { last: '', count: 0 };
  const y = new Date(day); y.setDate(y.getDate() - 1);
  const yest = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
  st.count = st.last === yest ? st.count + 1 : st.last === day ? st.count : 1; st.last = day;
  prefs.streak = st; store.set(KEY.prefs, prefs);
  const bonus = Math.min(14, 2 * st.count), Cc = store.get(KEY.career, null);
  if (Cc && st.count > 1) { Cc.bank = (Cc.bank || 0) + bonus; Cc.earned = (Cc.earned || 0) + bonus; store.set(KEY.career, Cc); }
  if (st.count >= 7) unlock(['streak7']);
  setTimeout(() => toast(st.count > 1 ? `Серия: ${st.count} дн. подряд${Cc ? ` · +${bonus} у.е. на счёт карьеры` : ''}` : 'Серия началась: приходите завтра за бонусом'), 1200);
}
const streakNow = () => { const st = prefs.streak; if (!st) return 0; const d = (new Date(today()) - new Date(st.last)) / 864e5; return d <= 1 ? st.count : 0; };

// Напоминание о неделе дня: событие в календаре телефона по будням
function remindIcs() {
  const time = '12:30';
  const d = new Date(); const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const url = gameUrl();
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//vyzhit-do-pyatnitsy//RU', 'BEGIN:VEVENT', `UID:vdp-daily-${ymd}@vyzhit`, `DTSTAMP:${ymd}T000000`,
    `DTSTART:${ymd}T${time.replace(':', '')}00`, 'DURATION:PT10M', 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', 'SUMMARY:Неделя дня — «Выжить до пятницы»',
    `DESCRIPTION:Новая неделя дня уже ждёт. Коллеги играют! ${url}`, `URL:${url}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Неделя дня ждёт', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  try {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'vyzhit-do-pyatnitsy.ics';
    document.body.appendChild(a); a.click(); a.remove();
    toast('Откройте скачанный файл — напоминание появится в календаре по будням в 12:30');
  } catch { toast('Не получилось сохранить файл напоминания'); }
}
$('remindDaily').onclick = remindIcs;

// ---------- запись результата и место в рейтинге ----------
async function record(won, death, high) {
  const total = RES.reduce((a, r) => a + S.res[r.k], 0);
  prefs.gamesPlayed = (prefs.gamesPlayed || 0) + 1; store.set(KEY.prefs, prefs);
  if (typeof installNudge === 'function') installNudge();
  if (S.mode === 'daily') {
    const all = store.get(KEY.daily, {});
    if (!all[S.day]) { all[S.day] = { won, total }; store.set(KEY.daily, all); updateStreak(S.day); }
  }
  const el = () => $('place');
  if (S.mode === 'tour') { const t = store.get('vdp-tours', {}); if (!t[S.tourId]) { t[S.tourId] = { won, total }; store.set('vdp-tours', t); } }
  if (S.mode === 'pack' || (S.mode === 'daily' && !S.ranked) || (S.mode === 'tour' && !S.ranked)) {
    if (el()) el().textContent = S.mode === 'pack' ? 'Брендированная неделя в общий рейтинг не идёт.' : 'Повторная попытка: в зачёт идёт только первая.'; return; }
  const entry = { player_id: prefs.playerId, name: S.name.slice(0, 24), dept: (S.dept || '').slice(0, 24), prof: S.prof, won,
    step: won ? 15 : S.step, total, psyche: S.res.psyche, energy: S.res.energy, boss: S.res.boss, colleagues: S.res.colleagues, death,
    mode: S.mode, day: S.mode === 'daily' ? S.day : null, overheat: !!high, ...(S.mode === 'tour' ? { tour_id: S.tourId } : {}) };
  try {
    try { await board.submit(entry); }
    catch (err) { if (!offlineErr(err)) throw err; outboxAdd(entry); if (el()) el().textContent = 'Нет связи, результат сохранён локально и уйдёт в рейтинг, когда сеть вернётся.'; return; }
    board.touch('finished', entry.step).catch(() => {});
    if (S.mode === 'tour') {
      const rows = (await board.rpc('tournament_board', { p_code: S.tourCode })).filter(r => r.name);
      const pos = rows.findIndex(r => r.name === prefs.name && r.played_at) + 1;
      if (el()) el().innerHTML = pos ? `<b>#${pos}</b><span>место в турнире офиса из ${rows.length}</span>` : '<span>Результат записан в турнир</span>';
      return;
    }
    const list = S.mode === 'daily' ? await board.daily(S.day) : await board.top(), tag = await myTag;
    const pos = list.findIndex(e => e.tag === tag) + 1;
    if (!el()) return;
    el().innerHTML = pos ? `<b>#${pos}</b><span>${S.mode === 'daily' ? `место в рейтинге дня из ${list.length}` : `ваше место в рейтинге${board.online ? ' офиса' : ' на этом устройстве'} (лучшая неделя)`}</span>` : '<span>Результат записан в рейтинг</span>';
  } catch (err) {
    if (el()) el().textContent = `Не удалось записать результат: ${err.message}.`;
  }
}

// ---------- очередь результатов без сети ----------
// Ошибка сети (fetch не дошёл) — не ответ сервера: такие результаты копим и отправляем позже по одному
const OUTBOX = 'vdp-outbox';
const offlineErr = err => err instanceof TypeError || !navigator.onLine;
function outboxAdd(entry) { const q = store.get(OUTBOX, []); q.push(entry); store.set(OUTBOX, q.slice(-20)); }
let flushing = false;
async function flushOutbox() {
  if (flushing || !board.online) return;
  flushing = true;
  try {
    let sent = 0;
    for (let q = store.get(OUTBOX, []); q.length; q = store.get(OUTBOX, [])) {
      if (sent) await new Promise(r => setTimeout(r, 11000));  // сервер принимает не чаще раза в 10 секунд
      try { await board.submit(q[0]); sent++; }
      catch (err) {
        if (offlineErr(err)) break;
        if (/Слишком часто/.test(err.message)) { await new Promise(r => setTimeout(r, 11000)); continue; }
      }  // иначе сервер отказал — такой результат уже не примут, выбрасываем
      store.set(OUTBOX, store.get(OUTBOX, []).slice(1));
    }
    if (sent) toast(sent > 1 ? `Связь есть: отправлено результатов — ${sent}` : 'Связь есть: результат отправлен в рейтинг');
  } finally { flushing = false; }
}
addEventListener('online', flushOutbox);

// ---------- конфетти ----------
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = $('confetti'), ctx = cv.getContext('2d'), dpr = devicePixelRatio || 1;
  cv.hidden = false; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement);
  const cols = ['--magenta', '--cyan', '--up', '--down', '--cyan-l'].map(v => cs.getPropertyValue(v).trim()).concat('#b26bff');
  const P = Array.from({ length: 170 }, () => ({ x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35, vx: (Math.random() - .5) * 13, vy: -Math.random() * 13 - 4,
    w: 6 + Math.random() * 6, h: 4 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: rnd(cols) }));
  const t0 = performance.now();
  (function frame(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of P) { p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); }
    if (now - t0 < 4200) requestAnimationFrame(frame); else { ctx.clearRect(0, 0, innerWidth, innerHeight); cv.hidden = true; }
  })(t0);
}

// ---------- вызов коллеге: ссылка с результатом открывает ту же неделю дня ----------
const CH_STAT = { psyche: 'p', energy: 'e', boss: 'b', colleagues: 'c' };
const CH_KEY = Object.fromEntries(Object.entries(CH_STAT).map(([k, v]) => [v, k]));
// 20261029w312p12: дата, w/l, счёт (победа) или номер карточки (проигрыш), шкала и её значение
function challengeCode(won, k) {
  const key = won ? [...RES].sort((a, b) => S.res[a.k] - S.res[b.k])[0].k : k;
  const num = won ? RES.reduce((a, r) => a + S.res[r.k], 0) : S.step;
  return `${S.day.replace(/-/g, '')}${won ? 'w' : 'l'}${String(num).padStart(3, '0')}${CH_STAT[key]}${S.res[key]}`;
}
function parseChallenge(code) {
  const m = /^(\d{4})(\d{2})(\d{2})([wl])(\d{3})([pebc])(\d{1,3})$/.exec(code || '');
  if (!m || (m[4] === 'l' && +m[5] > 14) || (m[4] === 'w' && +m[5] > 400)) return null;
  return { day: `${m[1]}-${m[2]}-${m[3]}`, won: m[4] === 'w', num: +m[5], stat: CH_KEY[m[6]], val: Math.min(100, +m[7]) };
}
// победа всегда выше проигрыша; дальше — счёт недели или сколько карточек продержались
const chScore = c => c.won ? 1000 + c.num : c.num;
const chResult = c => c.won ? `неделя закрыта, счёт ${c.num}/400, ${resName(c.stat)} ${c.val}%` : `неделя завалена: ${DAYS[Math.floor(c.num / 3)].toLowerCase()}, ${PHASES[c.num % 3].name.toLowerCase()}, ${resName(c.stat)} ${c.val}%`;
const chName = c => c.by || 'Коллега';
// Строка на финале недели дня, если игрок принял вызов на этот день
function challengeLine(won, k) {
  const c = prefs.challenge;
  if (S.mode !== 'daily' || !c || c.day !== S.day || c.done) return '';
  const mine = parseChallenge(challengeCode(won, k)), d = chScore(mine) - chScore(c);
  c.done = true; c.beat = d > 0; store.set(KEY.prefs, prefs);
  return `<div class="place challenge"><b>${d > 0 ? 'Вызов выигран!' : d === 0 ? 'Ничья' : 'Вызов проигран'}</b>
    <span>${esc(chName(c))}: ${chResult(c)}<br>Вы: ${chResult(mine)}</span></div>`;
}

// ---------- мем-карточка для чата ----------
function wrap(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lh; } else line = t; }
  ctx.fillText(line, x, y); return y + lh;
}
// «Неделя пережита: Кукуха 12%, Босс 88%» — самая низкая и самая высокая шкала
function memeLine(won) {
  const sorted = [...RES].sort((a, b) => S.res[a.k] - S.res[b.k]), lo = sorted[0], hi = sorted[3];
  const d = Math.floor(S.step / 3);
  return `${won ? 'Я пережил(а) неделю' : `Неделя завалена в ${['понедельник', 'вторник', 'среду', 'четверг', 'пятницу'][d]}`}: ${lo.name} ${S.res[lo.k]}%, ${hi.name} ${S.res[hi.k]}%`;
}
async function share(won, k) {
  try { await document.fonts.ready; } catch {}
  const total = RES.reduce((a, r) => a + S.res[r.k], 0);
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const glow = (c, b) => { ctx.shadowColor = c; ctx.shadowBlur = b; };
  ctx.fillStyle = '#07070d'; ctx.fillRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(W * .15, H * 1.1, 0, W * .15, H * 1.1, 900);
  bg.addColorStop(0, 'rgba(178,107,255,.35)'); bg.addColorStop(1, 'rgba(178,107,255,0)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const bg2 = ctx.createRadialGradient(W * .9, -100, 0, W * .9, -100, 800);
  bg2.addColorStop(0, 'rgba(45,226,230,.3)'); bg2.addColorStop(1, 'rgba(45,226,230,0)'); ctx.fillStyle = bg2; ctx.fillRect(0, 0, W, H);
  const kick = S.mode === 'daily' ? `НЕДЕЛЯ ДНЯ ${dayLabel(S.day)}` : S.mode === 'career' && C ? `НЕДЕЛЯ ${Math.max(1, C.week - 1)} ИЗ ${YEAR}` : 'ВЫЖИТЬ ДО ПЯТНИЦЫ';
  ctx.fillStyle = '#7df9ff'; glow('rgba(45,226,230,.9)', 20); ctx.font = '700 30px "JetBrains Mono", monospace'; ctx.fillText(kick, 80, 130);
  ctx.fillStyle = '#ffffff'; glow(won ? 'rgba(255,59,212,.9)' : 'rgba(255,59,107,.9)', 40); ctx.font = '800 118px Unbounded, "Arial Black", sans-serif'; ctx.fillText('НЕДЕЛЯ', 80, 290);
  ctx.fillStyle = won ? '#ff3bd4' : '#ff3b6b'; ctx.fillText(won ? 'ПЕРЕЖИТА' : 'ЗАВАЛЕНА', 80, 420);
  glow('transparent', 0); ctx.fillStyle = '#d6d2ef'; ctx.font = '800 42px Nunito, sans-serif';
  let y = wrap(ctx, `${memeLine(won)}.`, 80, 540, W - 160, 58);
  y += 30;
  RES.forEach((r, i) => {
    const bx = 80, by = y + i * 100, bw = W - 160 - 220;
    const col = { psyche: '#b26bff', energy: '#c6f01a', boss: '#ff3b6b', colleagues: '#2de2e6' }[r.k];
    ctx.font = '800 38px Nunito, sans-serif'; ctx.fillStyle = '#f2f0ff'; ctx.fillText(r.name, bx, by + 38);
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.globalAlpha = .6; ctx.beginPath(); ctx.roundRect(bx, by + 54, bw, 32, 16); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = col; glow(col, 24); ctx.beginPath(); ctx.roundRect(bx + 5, by + 59, Math.max(22, (bw - 10) * S.res[r.k] / 100), 22, 11); ctx.fill(); glow('transparent', 0);
    ctx.fillStyle = r.k === k ? '#ff3b6b' : '#7df9ff'; ctx.font = '700 48px "JetBrains Mono", monospace'; ctx.textAlign = 'right'; ctx.fillText(`${S.res[r.k]}%`, W - 80, by + 84); ctx.textAlign = 'left';
  });
  y += 4 * 100 + 30;
  ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(80, y, W - 160, 2);
  ctx.fillStyle = '#ffffff'; glow('rgba(255,59,212,.8)', 24); ctx.font = '700 40px "JetBrains Mono", monospace'; ctx.fillText(won ? `СЧЁТ ${total}/400` : S.name.toUpperCase(), 80, y + 70);
  glow('rgba(212,255,58,.7)', 16); ctx.fillStyle = '#d4ff3a'; ctx.textAlign = 'right'; ctx.font = '900 36px Nunito, sans-serif'; ctx.fillText(won ? rank(total) : TRAITS[S.trait || 'workaholic'].name, W - 80, y + 70); ctx.textAlign = 'left';
  glow('transparent', 0); ctx.font = '800 32px Nunito, sans-serif'; ctx.fillStyle = '#b9b4d6'; ctx.fillText(S.mode === 'daily' ? 'Сможешь лучше? Та же неделя — по ссылке' : 'А ты доживёшь до пятницы?', 80, H - 90);
  const url = cv.toDataURL('image/png');
  // неделя дня — ссылка-вызов на ту же неделю, остальное — приглашение с ID игрока
  const daily = S.mode === 'daily', link = daily ? await challengeLink(challengeCode(won, k)) : (await referralLink('friends')).url;
  const c = prefs.challenge, reply = daily && c?.day === S.day && c.done ? `${chName(c)}, ${c.beat ? 'вызов принят и выигран' : 'вызов принят'}! ` : '';
  const text = daily ? `${reply}${memeLine(won)}. Неделя дня ${dayLabel(S.day)} в «Выжить до пятницы» — сможешь лучше? Та же неделя по ссылке:`
    : `${memeLine(won)}. «Выжить до пятницы» — а ты доживёшь до пятницы?`;
  const full = `${text} ${link}`, enc = encodeURIComponent;
  track('share', { detail: daily ? 'challenge' : 'meme' });
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass" role="dialog" aria-modal="true" aria-label="Поделиться результатом">
    <img src="${url}" alt="Мем-карточка: ${esc(memeLine(won))}">
    <p class="share-text">${esc(full)}</p>
    ${navigator.canShare ? '<button class="btn-main" id="shareImg">Отправить картинку и ссылку</button>' : ''}
    <div class="share-grid">
      <a href="https://t.me/share/url?url=${enc(link)}&text=${enc(text)}" target="_blank" rel="noopener" id="shTgLink">Telegram</a>
      <a href="https://wa.me/?text=${enc(full)}" target="_blank" rel="noopener">WhatsApp</a>
      <a href="${url}" download="vyzhit-do-pyatnitsy.png" id="dlImg">Скачать картинку</a>
      <button id="copyTxt">Скопировать текст</button>
    </div>
    <p class="field-note">Для Slack и рабочей почты: скачайте картинку и вставьте вместе с текстом.</p>
    <div class="toast" id="toast" aria-live="polite"></div>
    <button class="btn-ghost" id="closeM">Закрыть</button></div>`;
  m.hidden = false;
  if (TG) $('shTgLink').onclick = e => { e.preventDefault(); TG.openTelegramLink(`https://t.me/share/url?url=${enc(link)}&text=${enc(text)}`); };
  $('closeM').onclick = () => { m.hidden = true; $('share')?.focus(); };
  m.onclick = e => { if (e.target === m) m.hidden = true; };
  if ($('shareImg')) $('shareImg').onclick = async () => {
    try {
      const blob = await (await fetch(url)).blob(), file = new File([blob], 'vyzhit-do-pyatnitsy.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: full });
      else await navigator.share({ text, url: link });
    } catch {}
  };
  $('copyTxt').onclick = () => {
    navigator.clipboard.writeText(full).then(() => $('toast').textContent = 'Текст со ссылкой скопирован — вставьте в чат',
      () => { $('toast').textContent = full; });
  };
  $('copyTxt').focus();
}
