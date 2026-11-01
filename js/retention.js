// Возвращаемость: зачем заходить в игру чаще.
// 1) «Персонаж скучает»: не открывали игру больше суток — настроение персонажа карьеры падает (−10 за каждый день, не больше −30,
//    не ниже 10), при входе — сцена «Алексей скучал без вас… 🥺» с кнопкой «Обнять / Поиграть» (+10 настроения и реплика голосом).
//    Время входа уходит в состояние для пушей (lastPlay в pushStateNow, js/push.js) — push-send чаще пишет «скучает».
// 2) Турнир отделов: неделя — с понедельника 00:00 до воскресенья 23:59 по Москве. Очки отдела — среднее лучших результатов
//    игроков за неделю (карьера и неделя дня). Карточка «🏆 Турнир отделов» в меню: отсчёт, место отдела, топ-5.
//    В новую неделю — окно итогов прошлой; отделу из тройки — +15 / +10 / +5 у.е. каждому игроку, один раз (сервер: claim_dept_reward).
//    SQL — supabase/update-2026-11-02-retention.sql; пуш в воскресенье 18:00 — push-send, kind 'tour'.
// 3) Тема месяца: у каждого месяца своя тема (значок на карточке сезона и в шапке недели карьеры), 10 карточек темы
//    (data/season_cards.json, формат pool.json; грузит js/engine.js в MONTH_CARDS) — по 2 в неделю карьеры этого месяца,
//    вещь сезона в пропуске названа по теме (js/shop.js → retThemeOf).
// 4) «📚 Коллекции»: стикеры, редкие события, породы питомцев, рекорды разминок, цитаты, темы оформления.
//    Награды за 25/50/75/100% — у.е. и бесплатные подсказки, каждая один раз (prefs.retCol). Чего нет — силуэт «???».
// Подключается после js/social.js: функции других модулей (meta, shop, pets, break, quotes, voice…) вызываются только в обработчиках.

const RET_DAY = 864e5, RET_MSK = 3 * 3600e3;  // Москва — UTC+3 круглый год
const retSave = () => store.set(KEY.prefs, prefs);
const retMenuFree = () => !views.menu.hidden && $('modal').hidden && !document.querySelector('.prof-sheet:not([hidden])');

// ======================= 1. Персонаж скучает =======================
const RET_LAST = 'vdp-ret-last';
let retSessionAt = Date.now();  // начало текущего захода (для пушей: lastPlay)
let retMissPending = null;
const retTouch = () => { if (!document.hidden) store.set(RET_LAST, Date.now()); };
function retAway(prev) {
  const now = Date.now();
  store.set(RET_LAST, now);
  if (!prev || now - prev < RET_DAY) return;
  retSessionAt = now;
  const days = Math.floor((now - prev) / RET_DAY);
  const C2 = careerNow(), h = C2?.hero; if (!h || !prefs.name) return;
  const before = h.mood ?? 70, drop = Math.min(30, days * 10);
  const after = before <= 10 ? before : Math.max(10, before - drop);
  h.mood = after; careerSave(C2);
  retMissPending = { days, before, after };
  track('hero_miss', { detail: String(days) });
  retMissTry(0);
}
function retMissTry(n) {
  if (!retMissPending) return;
  if (!retMenuFree()) { if (n < 20) setTimeout(() => retMissTry(n + 1), 1500); return; }
  retMissShow();
}
function retMissShow() {
  const x = retMissPending; retMissPending = null;
  const C2 = careerNow(), h = C2?.hero; if (!x || !h) return;
  const fem = typeof heroFem === 'function' && heroFem(h), nm = esc(h.name || L('Персонаж', 'Your character'));
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box ret-miss" role="dialog" aria-modal="true" aria-labelledby="retMissT">
    <span class="ret-miss-ico" aria-hidden="true">🥺</span>
    <h2 id="retMissT">${L(`${nm} ${fem ? 'скучала' : 'скучал'} без вас… 🥺`, `${nm} missed you… 🥺`)}</h2>
    <p>${L(`Вас не было ${pl(x.days, 'день', 'дня', 'дней')}. Дома всё ждали и смотрели на дверь.`, `You were away for ${pl(x.days, '', '', '', 'day', 'days')}. Everyone at home kept looking at the door.`)}</p>
    <div class="ret-mood"><span>${L('Настроение', 'Mood')}</span><b>${x.before}% → <em>${x.after}%</em></b></div>
    <p class="ret-say" id="retSay" hidden></p>
    <button class="btn-main" type="button" id="retHug">🤗 ${L('Обнять / Поиграть', 'Hug / Play')} <small>+10 ${L('настроения', 'mood')}</small></button>
    <button class="btn-ghost" type="button" id="retLater">${L('Позже', 'Later')}</button></div>`;
  m.hidden = false;
  $('retHug').onclick = () => {
    const C3 = careerNow(), h3 = C3?.hero; if (!h3) { m.hidden = true; return; }
    h3.mood = Math.min(100, (h3.mood ?? 70) + 10); careerSave(C3);
    if (typeof voiceUnlock === 'function') voiceUnlock();
    const line = typeof speak === 'function' ? speak('love', heroVoice(h3)) : L('Я так рад{а}, что ты вернул{ся}!', 'I’m so glad you’re back!').replace(/\{а\}/g, fem ? 'а' : '').replace(/\{ся\}/g, fem ? 'ась' : 'ся');
    sfx.item?.(); track('hero_hug');
    const say = $('retSay'); say.hidden = false; say.textContent = `«${line}» — ${h3.name || ''}`;
    m.querySelector('.ret-mood em').textContent = `${h3.mood}%`;
    const b = $('retHug'); b.textContent = L('В игру', 'Let’s play'); b.onclick = () => { m.hidden = true; if (!views.menu.hidden) renderMenu(); };
    $('retLater').hidden = true;
  };
  $('retLater').onclick = () => { m.hidden = true; if (!views.menu.hidden) renderMenu(); };
}
// старт: прошлый заход — до записи нового; приложение, свёрнутое на сутки и больше, — как новый заход
const retPrev = store.get(RET_LAST, 0);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { store.set(RET_LAST, Date.now()); return; }
  const prev = store.get(RET_LAST, 0);
  if (prev && Date.now() - prev >= RET_DAY) retAway(prev); else retTouch();
});
setInterval(retTouch, 60000);
dataReady.then(() => setTimeout(() => retAway(retPrev), 2500));

// ======================= 2. Турнир отделов =======================
const RET_PRIZE = [15, 10, 5];
// Понедельник 00:00 по Москве (метка UTC); w — сдвиг в неделях назад
const retWeekStart = (w = 0, t = Date.now()) => { const d = new Date(t + RET_MSK), dow = (d.getUTCDay() + 6) % 7; return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow - 7 * w) - RET_MSK; };
const retWeekKey = (w = 0) => new Date(retWeekStart(w) + RET_MSK).toISOString().slice(0, 10);
const retTourEnd = () => retWeekStart() + 7 * RET_DAY - 60e3;  // воскресенье 23:59
function retLeft(ms) {
  const m = Math.max(0, Math.floor(ms / 60e3)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60;
  return d ? L(`${d} д ${h} ч`, `${d}d ${h}h`) : h ? L(`${h} ч ${mm} мин`, `${h}h ${mm}m`) : L(`${mm} мин`, `${mm}m`);
}
const retPlace = n => L(`${n}-е место`, `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'} place`);
const retMedal = n => ['🥇', '🥈', '🥉'][n - 1] || `${n}.`;
const retTourOn = () => board.online && !window.VDP_PLATFORM;
let retTourCache = { at: 0, rows: null };
async function retTourRows(offset = 0, force = false) {
  if (!retTourOn()) return null;
  if (!offset && !force && retTourCache.rows && Date.now() - retTourCache.at < 60e3) return retTourCache.rows;
  try {
    const rows = ((await board.rpc('dept_tour', { p_offset: offset })) || []).sort((a, b) => a.place - b.place);
    if (!offset) retTourCache = { at: Date.now(), rows };
    return rows;
  } catch { return offset ? null : retTourCache.rows; }
}
const retMine = rows => prefs.dept && (rows || []).find(r => r.dept === prefs.dept);
const retRowHtml = (r, me) => `<li class="ret-row${me ? ' me' : ''}${r.qualified ? '' : ' nq'}"><span class="ret-pl">${r.qualified ? retMedal(r.place) : '·'}</span><b>${esc(r.dept)}</b><small>${pl(r.players, 'игрок', 'игрока', 'игроков', 'player', 'players')}</small><em>${r.score}</em></li>`;
function retTourSlot() {
  let box = $('retTour');
  if (!box) {
    const at = $('seasonCard'); if (!at) return null;
    box = Object.assign(document.createElement('div'), { id: 'retTour', className: 'ret-tour', hidden: true });
    at.after(box);
  }
  return box;
}
async function retTourCard() {
  const box = retTourSlot(); if (!box) return;
  if (!retTourOn()) { box.hidden = true; return; }
  const rows = await retTourRows(); if (!rows) { box.hidden = true; return; }
  const mine = retMine(rows), top = rows.filter(r => r.qualified).slice(0, 5);
  const line = !prefs.dept ? L('Укажите отдел в профиле — и играйте за него', 'Set your department in your profile to play for it')
    : mine ? (mine.qualified ? L(`«${esc(prefs.dept)}»: <b>${retPlace(mine.place)}</b> из ${rows.filter(r => r.qualified).length}${mine.place <= 3 ? ` · ${L('приз', 'prize')} +${money(RET_PRIZE[mine.place - 1])}` : ''}`,
        `“${esc(prefs.dept)}”: <b>${retPlace(mine.place)}</b> of ${rows.filter(r => r.qualified).length}${mine.place <= 3 ? ` · prize +${money(RET_PRIZE[mine.place - 1])}` : ''}`)
      : L(`«${esc(prefs.dept)}»: нужен ещё 1 игрок, чтобы попасть в зачёт`, `“${esc(prefs.dept)}”: one more player needed to rank`))
    : L(`«${esc(prefs.dept)}» ещё не играл на этой неделе — сыграйте неделю!`, `“${esc(prefs.dept)}” hasn’t played this week — play a week!`);
  box.hidden = false;
  box.innerHTML = `<button type="button" class="ret-tour-card" id="retTourOpen">
    <span class="ret-tour-h"><b>🏆 ${L('Турнир отделов', 'Department tournament')}</b><small class="ret-left">⏳ ${retLeft(retTourEnd() - Date.now())}</small></span>
    <span class="ret-tour-me">${line}</span>
    ${top.length ? `<ol class="ret-top">${top.map(r => retRowHtml(r, mine && r.dept === mine.dept)).join('')}</ol>` : `<span class="ret-tour-empty">${L('На этой неделе пока никто не играл — ваш отдел может стать первым', 'Nobody has played this week yet — your department can be first')}</span>`}
    <span class="ret-tour-more">${L('Правила и вся таблица ›', 'Rules and full table ›')}</span></button>`;
  $('retTourOpen').onclick = () => retTourModal();
}
async function retTourModal() {
  const m = $('modal'), rows = (await retTourRows(0, true)) || [], mine = retMine(rows);
  const list = rows.slice(0, 10);
  if (mine && !list.includes(mine)) list.push(mine);
  m.innerHTML = `<div class="modal-box glass cert-box ret-tour-box" role="dialog" aria-modal="true" aria-labelledby="retTourT">
    <span class="lvl-ico" aria-hidden="true">🏆</span><h2 id="retTourT">${L('Турнир отделов', 'Department tournament')}</h2>
    <p class="ret-left-big">⏳ ${L('До конца недели', 'Ends in')}: <b class="ret-left">${retLeft(retTourEnd() - Date.now())}</b> <small>${L('(вс 23:59 МСК)', '(Sun 23:59 Moscow)')}</small></p>
    ${list.length ? `<ol class="ret-top ret-top-full">${list.map(r => retRowHtml(r, mine && r.dept === mine.dept)).join('')}</ol>` : `<p>${L('Пока пусто. Сыграйте неделю — и ваш отдел появится в таблице.', 'Empty so far. Play a week and your department will show up.')}</p>`}
    <ul class="lw-list ret-rules">
      <li>${L('Очки отдела — среднее лучших результатов его игроков за неделю (карьера и неделя дня).', 'Department score is the average of its players’ best results this week (career and Daily Week).')}</li>
      <li>${L('В зачёте отделы, где сыграли хотя бы 2 человека.', 'Departments need at least 2 players to rank.')}</li>
      <li>${L(`Итоги — в понедельник: 1-е место — +${money(15)}, 2-е — +${money(10)}, 3-е — +${money(5)} каждому игроку отдела.`, `Results on Monday: 1st — +${money(15)}, 2nd — +${money(10)}, 3rd — +${money(5)} for every player in the department.`)}</li>
      ${prefs.dept ? '' : `<li>${L('Отдел указывается в профиле («Изменить»).', 'Set your department in your profile (“Edit”).')}</li>`}
    </ul>
    ${prefs.dept ? '' : `<button class="btn-main" type="button" id="retDept">${L('Указать отдел', 'Set department')}</button>`}
    <button class="btn-ghost" type="button" id="retTourX">${L('Закрыть', 'Close')}</button></div>`;
  m.hidden = false;
  if ($('retDept')) $('retDept').onclick = () => { m.hidden = true; $('meEdit')?.click(); };
  $('retTourX').onclick = () => { m.hidden = true; };
}
// Итоги прошлой недели: один раз за неделю, при первом заходе в новую неделю
let retResBusy = false;
async function retTourResults() {
  const key = retWeekKey();
  if (!retTourOn() || prefs.retTourSeen === key || !prefs.name || retResBusy) return;
  retResBusy = true;
  try { await retTourResults0(key); } finally { retResBusy = false; }
}
async function retTourResults0(key) {
  const rows = await retTourRows(1); if (!rows) return;
  const ranked = rows.filter(r => r.qualified);
  let rw = null;
  if (registered()) { try { rw = ((await board.rpc('my_dept_reward', { p_id: prefs.playerId })) || [])[0] || null; } catch {} }
  if (!ranked.length && !rw) { prefs.retTourSeen = key; retSave(); return; }
  if (!retMenuFree()) { setTimeout(retTourResults, 4000); return; }
  prefs.retTourSeen = key; retSave();
  const myDept = rw?.dept || prefs.dept, mine = rows.find(r => r.dept === myDept);
  const guestPrize = !registered() && mine?.qualified && mine.place <= 3;
  const m = $('modal');
  m.innerHTML = `<div class="modal-box glass cert-box ret-tour-box" role="dialog" aria-modal="true" aria-labelledby="retResT">
    <span class="lvl-ico" aria-hidden="true">🏁</span><h2 id="retResT">${L('Итоги турнира отделов', 'Department tournament results')}</h2>
    <p>${L('Прошлая неделя', 'Last week')} · ${new Date(retWeekStart(1) + RET_MSK).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', timeZone: 'UTC' })} — ${new Date(retWeekStart(1) + RET_MSK + 6 * RET_DAY).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', timeZone: 'UTC' })}</p>
    ${ranked.length ? `<ol class="ret-top ret-top-full">${ranked.slice(0, 5).map(r => retRowHtml(r, mine && r.dept === mine.dept)).join('')}</ol>` : ''}
    ${mine ? `<p class="ret-tour-me">${mine.qualified ? L(`Ваш отдел «${esc(mine.dept)}» — ${retPlace(mine.place)}`, `Your department “${esc(mine.dept)}” — ${retPlace(mine.place)}`) : L(`Ваш отдел «${esc(mine.dept)}» не попал в зачёт: нужно хотя бы 2 игрока`, `Your department “${esc(mine.dept)}” didn’t rank: at least 2 players needed`)}</p>` : ''}
    ${rw?.amount > 0 && !rw.claimed ? `<button class="btn-main" type="button" id="retClaim">🎁 ${L(`Забрать +${money(rw.amount)}`, `Claim +${money(rw.amount)}`)}</button>`
      : rw?.amount > 0 ? `<p class="shp-ok">✓ ${L('Награда уже получена', 'Reward already claimed')}</p>`
      : guestPrize ? `<button class="btn-main" type="button" id="retClaimReg">🎁 ${L(`Зарегистрироваться и забрать +${money(RET_PRIZE[mine.place - 1])}`, `Sign up to claim +${money(RET_PRIZE[mine.place - 1])}`)}</button>` : ''}
    <p class="field-note">${L('Новая неделя уже идёт — поднимите свой отдел выше!', 'A new week has started — lift your department higher!')}</p>
    <button class="btn-ghost" type="button" id="retResX">${L('Закрыть', 'Close')}</button></div>`;
  m.hidden = false; track('tour_results', { detail: mine ? String(mine.place) : '' });
  if ($('retClaim')) $('retClaim').onclick = async () => {
    const b = $('retClaim'); b.disabled = true;
    try {
      const n = Number(await board.rpc('claim_dept_reward', { p_id: prefs.playerId })) || 0;
      if (n > 0) {
        const now = addCash(n); sfx.coins?.(); confetti?.(); track('tour_reward', { detail: String(n) });
        toast(L(`🏆 +${money(n)} за место отдела${now ? '' : ' — придут, когда начнёте карьеру'}`, `🏆 +${money(n)} for your department’s place${now ? '' : ' — paid once you start a career'}`));
      } else toast(L('Награда уже получена', 'Reward already claimed'));
      m.hidden = true; if (!views.menu.hidden) renderMenu();
    } catch (err) { b.disabled = false; toast(err.message); }
  };
  if ($('retClaimReg')) $('retClaimReg').onclick = () => { prefs.retTourSeen = ''; retSave(); if (typeof REG_WHAT !== 'undefined') REG_WHAT.tour = L('Награды турнира отделов', 'Department tournament rewards'); m.hidden = true; needReg('tour'); };
  $('retResX').onclick = () => { m.hidden = true; };
}
setInterval(() => { if (views.menu.hidden) return; const t = retLeft(retTourEnd() - Date.now()); document.querySelectorAll('.ret-left').forEach(e => { e.textContent = e.closest('.ret-tour-card') ? `⏳ ${t}` : t; }); }, 30e3);
// Пуш «турнир» открывает таблицу (параметр ?open=tour; js/push.js потом убирает его из адреса)
const retOpenTour = new URLSearchParams(location.search).get('open') === 'tour';

// ======================= 3. Тема месяца =======================
const RET_THEMES = [
  { ico: '😴', ru: 'После праздников', en: 'Post-holiday blues', item_ru: 'Пижама «После праздников»', item_en: '“Post-holiday” pajamas' },
  { ico: '🎁', ru: 'Месяц подарков', en: 'Month of gifts', item_ru: 'Свитер «Валентинки и носки»', item_en: '“Valentines & socks” sweater' },
  { ico: '🌷', ru: 'Весеннее обострение', en: 'Spring fever', item_ru: 'Плащ «Весеннее обострение»', item_en: '“Spring fever” trench coat' },
  { ico: '📊', ru: 'Квартальный отчёт', en: 'Quarterly report', item_ru: 'Пиджак «Квартальный отчёт»', item_en: '“Quarterly report” blazer' },
  { ico: '🌱', ru: 'Майские и дача', en: 'May holidays', item_ru: 'Ветровка «Дачный сезон»', item_en: '“Cottage season” windbreaker' },
  { ico: '🏖️', ru: 'Отпуска начинаются', en: 'Vacation season', item_ru: 'Рубашка «Отпуск близко»', item_en: '“Vacation’s coming” shirt' },
  { ico: '☀️', ru: 'Летняя жара', en: 'Summer heat', item_ru: 'Лёгкий пиджак «Жара»', item_en: '“Heat wave” linen jacket' },
  { ico: '🏝️', ru: 'Пустой офис', en: 'Empty office', item_ru: 'Худи «Пустой офис»', item_en: '“Empty office” hoodie' },
  { ico: '🍂', ru: 'Снова в строю', en: 'Back to work', item_ru: 'Куртка «Снова в строю»', item_en: '“Back to work” jacket' },
  { ico: '💼', ru: 'Бюджет на следующий год', en: 'Next year’s budget', item_ru: 'Жилет «Бюджет утверждён»', item_en: '“Budget approved” vest' },
  { ico: '⏳', ru: 'Конец года близко', en: 'Year-end is near', item_ru: 'Куртка «Конец года близко»', item_en: '“Year-end is near” jacket' },
  { ico: '🎄', ru: 'Новогодний корпоратив', en: 'Holiday office party', item_ru: 'Свитер «Новогодний корпоратив»', item_en: '“Office party” holiday sweater' },
];
const retThemeOf = mo => RET_THEMES[((mo % 12) + 12) % 12];
const retThemeNow = () => retThemeOf(new Date().getMonth());
// Значок темы: id сезона «ГГГГ-ММ» (пропуск в js/shop.js) или текущий месяц
function retThemeBadge(id, big = false) {
  const t = id ? retThemeOf((+String(id).slice(-2) || new Date().getMonth() + 1) - 1) : retThemeNow();
  return `<span class="ret-mbadge${big ? ' big' : ''}" title="${L('Тема месяца', 'Theme of the month')}">${t.ico} ${esc(L(t.ru, t.en))}</span>`;
}
// Метка на карточке темы (js/game.js → renderCard)
const retCardTag = c => { const t = retThemeOf(c.month - 1); return `<span class="rnd-tag ret-mtag">${t.ico} ${esc(L(t.ru, t.en)).toUpperCase()}</span>`; };
// В неделю карьеры этого месяца — 2 карточки темы (ещё не виденные) в свободные слоты своего времени суток
bus.on('deck', S2 => {
  if (S2.mode !== 'career' || (S2.type && S2.type !== 'normal') || typeof MONTH_CARDS === 'undefined' || !MONTH_CARDS.length) return;
  const mo = new Date().getMonth() + 1, seen = new Set(store.get(KEY.seen, []));
  let pool = MONTH_CARDS.filter(c => c.month === mo && !seen.has(c.id));
  if (!pool.length) return;
  pool = shuffle([...pool]);
  let put = 0;
  for (const c of pool) {
    if (put >= 2) break;
    const free = S2.deck.map((s, i) => !s.fixed && !s.origin && i > 0 && i < S2.deck.length - 1 && PHASES[slotPh(i)].name === c.phase ? i : -1).filter(i => i >= 0);
    if (!free.length) continue;
    const i = free[Math.floor(Math.random() * free.length)];
    S2.deck[i] = { id: c.id, time: slotTime(i), fixed: true }; put++;
  }
});
// Значок темы в шапке недели — только в карьере
function retGameBadge() {
  const head = $('gCareer'); if (!head) return;
  let b = $('retGBadge');
  if (!b) { b = Object.assign(document.createElement('small'), { id: 'retGBadge', className: 'ret-gbadge' }); head.after(b); }
  const on = typeof S !== 'undefined' && S?.mode === 'career';
  b.hidden = !on;
  if (on) { const t = retThemeNow(); b.textContent = `${t.ico} ${L(t.ru, t.en)}`; }
}
if ($('gCareer')) new MutationObserver(retGameBadge).observe($('gCareer'), { childList: true, characterData: true, subtree: true });

// ======================= 4. Коллекции =======================
const RET_STEPS = [25, 50, 75, 100];
const RET_REWARD = { 25: { ue: 3 }, 50: { hints: 2 }, 75: { ue: 6 }, 100: { ue: 12, hints: 3 } };
const retRewardText = r => [r.ue && `💰 +${money(r.ue)}`, r.hints && `💡 ${pl(r.hints, 'подсказка', 'подсказки', 'подсказок', 'hint', 'hints')}`].filter(Boolean).join(' · ');
// учёт: отправленные стикеры (через track('sticker_send') из js/social.js), показанные цитаты, породы питомцев (когда-либо)
const retTrack0 = track;
track = function (kind, o = {}) {
  if (kind === 'sticker_send' && o.detail) { const n = +o.detail; const a = prefs.retSt ||= []; if (n >= 1 && n <= 99 && !a.includes(n)) { a.push(n); retSave(); } }
  return retTrack0(kind, o);
};
function retQuoteSeen() {
  if (typeof qtCur === 'undefined' || typeof qtList === 'undefined' || !qtList || qtCur < 0) return;
  const a = prefs.retQt ||= []; if (!a.includes(qtCur)) { a.push(qtCur); retSave(); }
}
document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderQuoteDay === 'function') {
    const orig = renderQuoteDay;
    renderQuoteDay = async function (...a) { const r = await orig.apply(this, a); retQuoteSeen(); return r; };
  }
  setTimeout(retQuoteSeen, 3000);
});
function retPetsSync() {
  const pets = careerNow()?.hero?.pets || [], a = prefs.retPets ||= []; let ch = false;
  for (const p of pets) if (p.breed && !a.includes(p.breed)) { a.push(p.breed); ch = true; }
  if (ch) retSave();
}
function retCollections() {
  retPetsSync();
  const st = new Set(prefs.retSt || []), rare = new Set(prefs.rareGot || []), pets = new Set(prefs.retPets || []);
  const best = store.get('vdp-break-best', {});
  const cols = [];
  if (typeof ST_N !== 'undefined') cols.push({ id: 'st', ico: '🖼️', t: L('Стикеры: отправлено', 'Stickers sent'), how: L('Отправляйте стикеры в чатах игры', 'Send stickers in game chats'),
    items: Array.from({ length: ST_N }, (_, i) => ({ got: st.has(i + 1), img: stUrl(i + 1), name: `#${i + 1}` })) });
  const rr = typeof EVENTS !== 'undefined' && EVENTS?.rare || [];
  if (rr.length) cols.push({ id: 'rare', ico: '✨', t: L('Редкие события', 'Rare events'), how: L('Попадаются в неделях карьеры — примерно одно на 8 недель', 'They show up in career weeks — about one in 8 weeks'),
    items: rr.map(c => ({ got: rare.has(c.id), ico: '✨', name: tr(c.who), hint: String(tr(c.text) || '').slice(0, 60) + '…' })) });
  if (typeof PET_BREEDS !== 'undefined') cols.push({ id: 'pets', ico: '🐾', t: L('Породы питомцев', 'Pet breeds'), how: L('Заводите питомцев в карьере; редкие — в магазине', 'Adopt pets in your career; rare ones are in the shop'),
    items: PET_BREEDS.map(b => ({ got: pets.has(b.id), ico: PET_KINDS[b.kind]?.ico || '🐾', name: b.t + (b.rare ? ' ✨' : ''), color: b.color })) });
  if (typeof BREAKS !== 'undefined') cols.push({ id: 'brk', ico: '☕', t: L('Рекорды разминок', 'Break-game records'), how: L('Поставьте рекорд в мини-игре «Разминки»', 'Set a record in a Break mini-game'),
    items: BREAKS.map(([n, , ico, title]) => ({ got: best[n] != null, ico, name: title, hint: best[n] != null ? `🏆 ${best[n]}` : '' })) });
  if (typeof qtList !== 'undefined' && qtList?.length) cols.push({ id: 'qt', ico: '💬', t: L('Прочитанные цитаты', 'Quotes read'), how: L('Листайте «Цитату дня» в меню (↻)', 'Flip through the Quote of the day in the menu (↻)'),
    big: true, total: qtList.length, got: (prefs.retQt || []).filter(i => i < qtList.length).length });
  if (typeof THEMES !== 'undefined') cols.push({ id: 'th', ico: '🎨', t: L('Темы оформления', 'Colour themes'), how: L('Покупаются в «Оформлении» и выдаются в сезонном пропуске', 'Bought in “Appearance” or earned in the season pass'),
    items: THEMES.map((t, i) => ({ got: themeOwned(i), ico: '🎨', name: t.name, color: t.m })) });
  for (const c of cols) {
    if (!c.big) { c.total = c.items.length; c.got = c.items.filter(x => x.got).length; }
    c.pct = c.total ? Math.floor(c.got / c.total * 100) : 0;
    const done = (prefs.retCol ||= {})[c.id] || [];
    c.claim = RET_STEPS.filter(s => c.pct >= s && !done.includes(s));
    c.done = done;
  }
  return cols;
}
const retClaimable = () => retCollections().reduce((n, c) => n + c.claim.length, 0);
function retColItem(x) {
  if (!x.got) return `<li class="ret-it ret-sil" title="???">${x.img ? `<img src="${x.img}" alt="" loading="lazy">` : `<span class="ret-it-ico">${x.ico}</span>`}<small>???</small></li>`;
  return `<li class="ret-it"${x.hint ? ` title="${esc(x.hint)}"` : ''}>${x.img ? `<img src="${x.img}" alt="" loading="lazy">` : x.color ? `<span class="ret-it-ico" style="--c:${esc(x.color)}">${x.ico}</span>` : `<span class="ret-it-ico">${x.ico}</span>`}<small>${esc(x.name)}</small>${x.hint && x.hint.startsWith('🏆') ? `<em>${esc(x.hint)}</em>` : ''}</li>`;
}
async function retOpenCollections() {
  if (typeof qtGet === 'function') await qtGet().catch(() => {});
  const m = $('modal'), open = new Set();
  const render = () => {
    const cols = retCollections(), all = cols.reduce((a, c) => a + c.got, 0), tot = cols.reduce((a, c) => a + c.total, 0);
    m.innerHTML = `<div class="modal-box glass cert-box ret-col-box" role="dialog" aria-modal="true" aria-labelledby="retColT">
      <span class="lvl-ico" aria-hidden="true">📚</span><h2 id="retColT">${L('Коллекции', 'Collections')}</h2>
      <p class="field-note">${L(`Собрано ${all} из ${tot}. За 25, 50, 75 и 100% каждой коллекции — у.е. и подсказки.`, `Collected ${all} of ${tot}. Each collection pays out at 25, 50, 75 and 100% — cash and hints.`)}</p>
      ${cols.map(c => `<section class="ret-col">
        <div class="ret-col-h"><span class="ret-col-ico" aria-hidden="true">${c.ico}</span><b>${c.t}</b><small>${c.got}/${c.total} · ${c.pct}%</small></div>
        <div class="ret-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${c.pct}"><i style="width:${c.pct}%"></i>${RET_STEPS.slice(0, 3).map(s => `<u style="left:${s}%"></u>`).join('')}</div>
        <div class="ret-rw">${RET_STEPS.map(s => {
          const got = c.done.includes(s), can = c.claim.includes(s);
          return `<span class="ret-rw-i${got ? ' got' : can ? ' can' : ''}"><small>${s}%</small>${got ? '✓' : can ? `<button type="button" class="btn-chip" data-rclaim="${c.id}:${s}">${L('Забрать', 'Claim')}</button>` : '🔒'}<em>${retRewardText(RET_REWARD[s])}</em></span>`;
        }).join('')}</div>
        ${c.big ? `<p class="ret-how">${c.how}</p>` : `<details class="ret-items"${open.has(c.id) ? ' open' : ''} data-col="${c.id}"><summary>${L('Показать', 'Show')} · ${c.how}</summary><ul class="ret-grid">${c.items.map(retColItem).join('')}</ul></details>`}
      </section>`).join('')}
      <button class="btn-ghost" type="button" id="retColX">${L('Закрыть', 'Close')}</button></div>`;
    m.hidden = false;
    m.querySelectorAll('details[data-col]').forEach(d => d.ontoggle = () => { d.open ? open.add(d.dataset.col) : open.delete(d.dataset.col); });
    m.querySelectorAll('[data-rclaim]').forEach(b => b.onclick = () => {
      const [id, s] = b.dataset.rclaim.split(':'), step = +s, c = retCollections().find(x => x.id === id);
      if (!c || !c.claim.includes(step)) return;
      const r = RET_REWARD[step];
      (prefs.retCol[id] ||= []).push(step);
      if (r.hints) prefs.freeHints = (prefs.freeHints || 0) + r.hints;
      retSave();
      const now = r.ue ? addCash(r.ue) : true;
      sfx.coins?.(); track('col_claim', { detail: `${id}:${step}` });
      toast(L(`📚 ${c.t} ${step}%: ${retRewardText(r)}${now ? '' : ' — у.е. придут, когда начнёте карьеру'}`, `📚 ${c.t} ${step}%: ${retRewardText(r)}${now ? '' : ' — paid once you start a career'}`));
      if (step === 100) confetti?.();
      render();
    });
    $('retColX').onclick = () => { m.hidden = true; if (!views.menu.hidden) renderMenu(); };
  };
  render();
  track('col_open');
}
function retColBtn() {
  let b = $('retColBtn');
  if (!b) {
    const at = retTourSlot() || $('seasonCard'); if (!at) return;
    b = Object.assign(document.createElement('button'), { id: 'retColBtn', type: 'button', className: 'btn-ghost ret-col-btn' });
    at.after(b); b.onclick = () => retOpenCollections();
  }
  const cols = retCollections(), n = cols.reduce((a, c) => a + c.claim.length, 0);
  const pct = cols.length ? Math.round(cols.reduce((a, c) => a + c.pct, 0) / cols.length) : 0;
  b.innerHTML = `📚 ${L('Коллекции', 'Collections')} <small>${pct}%</small>${n ? ` <em class="shp-pill">🎁 ${n}</em>` : ''}`;
}

// ======================= меню =======================
bus.on('menu', () => setTimeout(() => {  // после js/shop.js (карточка сезона) и остальных модулей
  retTourSlot(); retColBtn(); retTourCard();
  setTimeout(retTourResults, 5000);
  if (retOpenTour && !retTourModal.done) { retTourModal.done = true; setTimeout(() => { if (retMenuFree()) retTourModal(); }, 1500); }
}, 0));
