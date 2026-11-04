/* сгенерировано tools/make-legacy.js из js/timer.js — не править */
const ANSWER_TIME = 30, ANSWER_WARN = 5, ANSWER_FINE = 1;
let ansLeft = ANSWER_TIME, ansWarned = false, ansLast = 0, ansT = 0;
const ansEl = () => {
  let el = $("ansTimer");
  if (!el && $("clock")) {
    el = Object.assign(document.createElement("span"), { id: "ansTimer", className: "ans-timer" });
    el.setAttribute("role", "timer");
    el.setAttribute("aria-label", L("Время на ответ", "Time to answer"));
    const clock = $("clock"), row = Object.assign(document.createElement("div"), { className: "clock-row" });
    clock.before(row);
    row.append(clock, el);
  }
  return el;
};
const ansWarnEl = () => {
  let el = $("ansWarn");
  if (!el) {
    el = Object.assign(document.createElement("div"), { id: "ansWarn", className: "ans-warn", hidden: true });
    el.setAttribute("role", "alert");
    views.game.append(el);
  }
  return el;
};
const ansOn = () => S && (prefs.gamesPlayed || 0) >= 1 && !views.game.hidden;
const ansPaused = () => window.vdpPaused || busy || splashOn || !$("modal").hidden || document.hidden || $("coach") && !$("coach").hidden || $("splash") && !$("splash").hidden;
function answerTimerReset() {
  ansLeft = ANSWER_TIME;
  ansWarned = false;
  ansLast = performance.now();
  ansWarnEl().hidden = true;
  const el = ansEl();
  if (el) el.hidden = !ansOn();
  ansDraw();
  clearInterval(ansT);
  ansT = setInterval(ansTick, 200);
}
function ansDraw() {
  const el = ansEl();
  if (!el) return;
  const s = Math.max(0, Math.ceil(ansLeft));
  el.textContent = "⏱ 0:".concat(String(s).padStart(2, "0"));
  el.classList.toggle("warn", s <= ANSWER_WARN);
  el.style.setProperty("--p", ansLeft / ANSWER_TIME);
}
function ansTick() {
  var _a, _b;
  const now = performance.now(), dt = (now - ansLast) / 1e3;
  ansLast = now;
  if (!ansOn()) {
    clearInterval(ansT);
    const el = $("ansTimer");
    if (el) el.hidden = true;
    ansWarnEl().hidden = true;
    return;
  }
  if (ansPaused()) return;
  ansLeft -= dt;
  ansDraw();
  if (!ansWarned && ansLeft <= ANSWER_WARN) {
    ansWarned = true;
    (_a = sfx.buzzer) == null ? void 0 : _a.call(sfx);
    const w = ansWarnEl();
    w.innerHTML = "⚠️ ".concat(L("Вы срываете задачу!", "You’re blowing the task!"), " <small>").concat(L("".concat(ANSWER_WARN, " секунд — или штраф ").concat(money(ANSWER_FINE)), "".concat(ANSWER_WARN, " seconds — or a ").concat(money(ANSWER_FINE), " fine")), "</small>");
    w.hidden = false;
  }
  if (ansLeft <= 0) {
    const career = S.mode === "career" && C;
    if (career) {
      C.bank -= ANSWER_FINE;
      C.spent = (C.spent || 0) + ANSWER_FINE;
      saveCareer();
      renderBars();
    }
    (_b = sfx.sigh) == null ? void 0 : _b.call(sfx);
    buzz("lose");
    toast(career ? L("⏱ Время вышло — штраф ".concat(money(ANSWER_FINE), " · на счёте ").concat(money(C.bank)), "⏱ Time’s up — ".concat(money(ANSWER_FINE), " fine · balance ").concat(money(C.bank))) : L("⏱ Время вышло! Решайте быстрее", "⏱ Time’s up! Decide faster"));
    track("answer_timeout", { mode: S.mode, step: S.step });
    ansLeft = ANSWER_TIME;
    ansWarned = false;
    ansWarnEl().hidden = true;
    ansDraw();
  }
}
bus.on("answer", () => {
  ansWarnEl().hidden = true;
  clearInterval(ansT);
});
