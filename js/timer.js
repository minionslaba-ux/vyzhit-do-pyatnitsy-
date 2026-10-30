// Время на ответ: 30 секунд на карточку, обратный отсчёт вверху рядом с часами. За 5 секунд — мерзкий зуммер и плашка
// «Вы срываете задачу!»; не успели — штраф 1 у.е. (в карьере; в остальных режимах — только предупреждение), отсчёт идёт заново.
// Пауза, пока открыто окно, заставка дня, подсказка-обучение или вкладка свёрнута. В самой первой неделе таймера нет.
const ANSWER_TIME = 30, ANSWER_WARN = 5, ANSWER_FINE = 1;
let ansLeft = ANSWER_TIME, ansWarned = false, ansLast = 0, ansT = 0;
const ansEl = () => {
  let el = $('ansTimer');
  if (!el && $('clock')) {  // часы и таймер — в одной строке, без лишней высоты
    el = Object.assign(document.createElement('span'), { id: 'ansTimer', className: 'ans-timer' }); el.setAttribute('role', 'timer'); el.setAttribute('aria-label', L('Время на ответ', 'Time to answer'));
    const clock = $('clock'), row = Object.assign(document.createElement('div'), { className: 'clock-row' });
    clock.before(row); row.append(clock, el);
  }
  return el;
};
const ansWarnEl = () => {
  let el = $('ansWarn');
  if (!el) { el = Object.assign(document.createElement('div'), { id: 'ansWarn', className: 'ans-warn', hidden: true }); el.setAttribute('role', 'alert'); views.game.append(el); }
  return el;
};
const ansOn = () => S && (prefs.gamesPlayed || 0) >= 1 && !views.game.hidden;
const ansPaused = () => busy || splashOn || !$('modal').hidden || document.hidden || ($('coach') && !$('coach').hidden) || ($('splash') && !$('splash').hidden);
function answerTimerReset() {
  ansLeft = ANSWER_TIME; ansWarned = false; ansLast = performance.now();
  ansWarnEl().hidden = true;
  const el = ansEl(); if (el) el.hidden = !ansOn();
  ansDraw();
  clearInterval(ansT); ansT = setInterval(ansTick, 200);
}
function ansDraw() {
  const el = ansEl(); if (!el) return;
  const s = Math.max(0, Math.ceil(ansLeft));
  el.textContent = `⏱ 0:${String(s).padStart(2, '0')}`;
  el.classList.toggle('warn', s <= ANSWER_WARN);
  el.style.setProperty('--p', ansLeft / ANSWER_TIME);
}
function ansTick() {
  const now = performance.now(), dt = (now - ansLast) / 1000; ansLast = now;
  if (!ansOn()) { clearInterval(ansT); const el = $('ansTimer'); if (el) el.hidden = true; ansWarnEl().hidden = true; return; }
  if (ansPaused()) return;
  ansLeft -= dt; ansDraw();
  if (!ansWarned && ansLeft <= ANSWER_WARN) {
    ansWarned = true; sfx.buzzer?.();
    const w = ansWarnEl(); w.innerHTML = `⚠️ ${L('Вы срываете задачу!', 'You’re blowing the task!')} <small>${L(`${ANSWER_WARN} секунд — или штраф ${money(ANSWER_FINE)}`, `${ANSWER_WARN} seconds — or a ${money(ANSWER_FINE)} fine`)}</small>`; w.hidden = false;
  }
  if (ansLeft <= 0) {
    const career = S.mode === 'career' && C;
    if (career) { C.bank -= ANSWER_FINE; C.spent = (C.spent || 0) + ANSWER_FINE; saveCareer(); renderBars(); }
    sfx.sigh?.(); buzz('lose');
    toast(career ? L(`⏱ Время вышло — штраф ${money(ANSWER_FINE)} · на счёте ${money(C.bank)}`, `⏱ Time’s up — ${money(ANSWER_FINE)} fine · balance ${money(C.bank)}`) : L('⏱ Время вышло! Решайте быстрее', '⏱ Time’s up! Decide faster'));
    track('answer_timeout', { mode: S.mode, step: S.step });
    ansLeft = ANSWER_TIME; ansWarned = false; ansWarnEl().hidden = true; ansDraw();
  }
}
// Ответили — плашку убрать сразу
bus.on('answer', () => { ansWarnEl().hidden = true; clearInterval(ansT); });
