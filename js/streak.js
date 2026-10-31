// ---------- награда за возвращение: «День N подряд» ----------
// Первый вход за день — окно с полосой из 7 дней наград; пропустили день — серия снова с первого дня.
// Деньги идут на счёт карьеры (addCash из js/meta.js); карьеры нет — дождутся её. 7-й день — ещё и бонус-сундук.
// В самый первый визит не показываем (prefs.gamesPlayed пуст) и не перекрываем другие окна: ждём, пока модалка закрыта и открыто меню.
const STK_REWARDS = [1, 2, 3, 3, 4, 4, 7];
const stkDays = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
// Текущая серия входов (0 — прервана)
const dayStreakNow = () => { const st = prefs.dayStreak; return st && stkDays(st.last, today()) <= 1 ? st.count : 0; };

function stkDue() {
  if (!prefs.name || !(prefs.gamesPlayed > 0)) return false;
  const st = prefs.dayStreak;
  return !st || st.last !== today() || !st.claimed;
}
// Отметить сегодняшний день в серии (один раз за день). Пропущен ровно один день — серию можно выкупить (lost — прежний счёт)
const STK_SAVE_PRICE = 5;
function stkMark() {
  const day = today(), st = prefs.dayStreak;
  if (st?.last === day) return st;
  const gap = st ? stkDays(st.last, day) : 0, count = gap === 1 ? st.count + 1 : 1;
  prefs.dayStreak = { last: day, count, claimed: false };
  if (gap === 2 && st.count >= 2) prefs.dayStreak.lost = st.count;
  store.set(KEY.prefs, prefs);
  return prefs.dayStreak;
}
const stkAd = () => typeof adReady === 'function' && adReady() && typeof adWatch === 'function';
const stkClose = () => { $('modal').hidden = true; if (!views.menu.hidden && typeof renderMenu === 'function') renderMenu(); };
// Серия прервалась на один день: выкупить за 5 у.е. со счёта карьеры, за рекламу или начать заново
function showStreakLost(st) {
  const m = $('modal'), C2 = careerNow();
  const keep = how => {
    prefs.dayStreak = { last: today(), count: st.lost + 1, claimed: false }; store.set(KEY.prefs, prefs);
    track('streak_save', { detail: `${how}:${st.lost + 1}` });
    showDayStreak();
  };
  m.innerHTML = `<div class="modal-box glass lvl-box stk-box" role="dialog" aria-modal="true" aria-labelledby="stkTitle"><span class="lvl-ico" aria-hidden="true">🧯</span>
    <h2 id="stkTitle">${L('Серия под угрозой', 'Your streak is at risk')}</h2>
    <p class="stk-lead">${L(`Вчера вы не заходили, и серия из ${plural(st.lost, 'дня', 'дней', 'дней')} вот-вот сгорит. Сохраните её — и сегодня будет день ${st.lost + 1}.`,
      `You missed yesterday, so your ${st.lost}-day streak is about to burn out. Save it and today becomes day ${st.lost + 1}.`)}</p>
    ${C2 ? `<button class="btn-main" type="button" id="stkBuy">${L(`Сохранить серию за ${money(STK_SAVE_PRICE)}`, `Save the streak for ${money(STK_SAVE_PRICE)}`)}</button>
      <small class="stk-note">${L(`На счёте карьеры: ${money(C2.bank || 0)}`, `Career bank: ${money(C2.bank || 0)}`)}</small>` : ''}
    ${stkAd() ? `<button class="btn-ghost" type="button" id="stkSaveAd">🎬 ${L('Сохранить за рекламу', 'Save it by watching an ad')}</button>` : ''}
    <button class="btn-ghost" type="button" id="stkReset">${L('Начать серию заново', 'Start the streak over')}</button></div>`;
  if ($('viralPop')) $('viralPop').hidden = true;
  m.hidden = false; m.onclick = null;
  if ($('stkBuy')) $('stkBuy').onclick = () => {
    const c = careerNow();
    if ((c?.bank || 0) >= STK_SAVE_PRICE) { c.bank -= STK_SAVE_PRICE; careerSave(c); return keep('cash'); }
    if (typeof openTopup === 'function') openTopup({ need: STK_SAVE_PRICE - Math.max(0, c?.bank || 0), why: L('Чтобы сохранить серию дней, не хватает у.е.', 'You need a bit more to save your streak.'), then: () => showStreakLost(st) });
  };
  if ($('stkSaveAd')) $('stkSaveAd').onclick = () => adWatch(ok => { if (ok) keep('ad'); }, { why: 'streak_save', give: () => L(`🔥 Серия спасена: день ${st.lost + 1}`, `🔥 Streak saved: day ${st.lost + 1}`) });
  $('stkReset').onclick = () => { delete prefs.dayStreak.lost; store.set(KEY.prefs, prefs); showDayStreak(); };
}

function showDayStreak() {
  const st = stkMark(), m = $('modal');
  if (st.lost && !st.claimed) return showStreakLost(st);
  const idx = (st.count - 1) % 7, base = STK_REWARDS[idx], chest = idx === 6;
  const bonus = chest ? 3 + Math.floor(Math.random() * 6) : 0, total = base + bonus;  // сундук: ещё 3–8 у.е.
  const strip = STK_REWARDS.map((n, i) => `<div class="stk-day${i < idx ? ' got' : i === idx ? ' now' : ''}${i === 6 ? ' chest' : ''}">
      <small>${L(`день ${i + 1}`, `day ${i + 1}`)}</small><span aria-hidden="true">${i < idx ? '✓' : i === 6 ? '🎁' : '💰'}</span><b>+${n}</b></div>`).join('');
  m.innerHTML = `<div class="modal-box glass lvl-box stk-box" role="dialog" aria-modal="true" aria-labelledby="stkTitle"><span class="lvl-ico" aria-hidden="true">🔥</span>
    <h2 id="stkTitle">${L(`День ${st.count} подряд`, `Day ${st.count} in a row`)}</h2>
    <p class="stk-lead">${chest ? L('Семь дней без пропусков — вот это характер! Завтра начнётся новый круг наград.', 'Seven days without missing one — impressive! Tomorrow a new round of rewards begins.') : st.count === 1 ? L('Заходите каждый день — награда растёт. Пропустите день, и серия начнётся заново.', 'Come back every day and the reward grows. Miss a day and the streak starts over.')
      : L('Вы снова с нами — держите награду. Завтра будет больше, если не пропустите день.', 'You’re back — here’s your reward. Tomorrow’s is bigger, as long as you don’t miss a day.')}</p>
    <div class="stk-strip">${strip}</div>
    ${chest ? `<p class="stk-chest">${L('Сегодня ещё и бонус-сундук!', 'Plus a bonus chest today!')}</p>` : ''}
    <button class="btn-main" type="button" id="stkGo">${chest ? L(`Забрать +${money(base)} и открыть сундук`, `Claim ${money(base)} and open the chest`) : L(`Забрать +${money(base)}`, `Claim ${money(base)}`)}</button>
    ${stkAd() ? `<button class="btn-ghost" type="button" id="stkAd">🎬 ${L('Удвоить за рекламу', 'Double it with an ad')}</button>` : ''}</div>`;
  if ($('viralPop')) $('viralPop').hidden = true;  // плашка «Вместе веселее» не должна перекрывать окно
  m.hidden = false; m.onclick = null;
  const claim = doubled => {
    const now = addCash(total);
    prefs.dayStreak = { ...st, claimed: true }; store.set(KEY.prefs, prefs);
    track('streak_claim', { detail: `${st.count}:${total}${doubled ? ':x2' : ''}` });
    try { sfx.coins(); } catch {}
    if (chest) try { confetti(); } catch {}
    const box = m.querySelector('.stk-box');
    box.innerHTML = `<span class="lvl-ico" aria-hidden="true">${chest ? '🎁' : '💰'}</span><h2>+${money(doubled ? total * 2 : total)}</h2>
      <p class="stk-lead">${chest ? L(`В сундуке — ещё ${money(bonus)}! `, `The chest had another ${money(bonus)}! `) : ''}${doubled ? L('Награда удвоена. ', 'Reward doubled. ') : ''}${now ? L('Уже на счёте карьеры.', 'Already in your career bank.') : L('Деньги придут в карьеру — начните её, и они будут на счёте.', 'The money goes to your career — start one and it’ll be in your bank.')}</p>
      <button class="btn-main" type="button" id="stkOk">${L('Отлично', 'Great')}</button>`;
    $('stkOk').onclick = stkClose;
  };
  $('stkGo').onclick = () => claim(false);
  // Реклама: give() начисляет вторую половину, после показа — обычная награда
  if ($('stkAd')) $('stkAd').onclick = () => adWatch(ok => {
    if (!ok || prefs.dayStreak?.claimed) return;
    track('streak_double', { detail: `${st.count}:${total}` }); claim(true);
  }, { why: 'streak', give: () => { addCash(total); return L(`🎬 Награда удвоена: ещё +${money(total)}`, `🎬 Reward doubled: another ${money(total)}`); } });
}

// Ждём спокойного момента: меню на экране, других окон нет
let stkTimer = 0;
function stkSchedule(delay = 2500) {
  clearTimeout(stkTimer);
  let tries = 0;
  const tick = () => {
    if (!stkDue()) return;
    if (!document.hidden && !views.menu.hidden && $('modal').hidden) return showDayStreak();
    if (++tries < 400) stkTimer = setTimeout(tick, 1500);  // ~10 минут; дальше — при следующем возвращении на вкладку
  };
  stkTimer = setTimeout(tick, delay);
}
dataReady.then(() => eventsReady).then(() => stkSchedule());
// Вкладку оставили открытой на ночь — на следующий день награда тоже придёт
document.addEventListener('visibilitychange', () => { if (!document.hidden) stkSchedule(1500); });
