/* сгенерировано tools/make-legacy.js из js/streak.js — не править */
const STK_REWARDS = [1, 2, 3, 3, 4, 4, 7];
const stkDays = (a, b) => Math.round((/* @__PURE__ */ new Date(b + "T12:00") - /* @__PURE__ */ new Date(a + "T12:00")) / 864e5);
const dayStreakNow = () => {
  const st = prefs.dayStreak;
  return st && stkDays(st.last, today()) <= 1 ? st.count : 0;
};
function stkDue() {
  if (!prefs.name || !(prefs.gamesPlayed > 0)) return false;
  const st = prefs.dayStreak;
  return !st || st.last !== today() || !st.claimed;
}
const STK_SAVE_PRICE = 5;
function stkMark() {
  const day = today(), st = prefs.dayStreak;
  if ((st == null ? void 0 : st.last) === day) return st;
  const gap = st ? stkDays(st.last, day) : 0, count = gap === 1 ? st.count + 1 : 1;
  prefs.dayStreak = { last: day, count, claimed: false };
  if (gap === 2 && st.count >= 2) prefs.dayStreak.lost = st.count;
  store.set(KEY.prefs, prefs);
  return prefs.dayStreak;
}
const stkAd = () => typeof adReady === "function" && adReady() && typeof adWatch === "function";
const stkClose = () => {
  $("modal").hidden = true;
  if (!views.menu.hidden && typeof renderMenu === "function") renderMenu();
};
function showStreakLost(st) {
  const m = $("modal"), C2 = careerNow();
  const keep = (how) => {
    prefs.dayStreak = { last: today(), count: st.lost + 1, claimed: false };
    store.set(KEY.prefs, prefs);
    track("streak_save", { detail: "".concat(how, ":").concat(st.lost + 1) });
    showDayStreak();
  };
  m.innerHTML = '<div class="modal-box glass lvl-box stk-box" role="dialog" aria-modal="true" aria-labelledby="stkTitle"><span class="lvl-ico" aria-hidden="true">🧯</span>\n    <h2 id="stkTitle">'.concat(L("Серия под угрозой", "Your streak is at risk"), '</h2>\n    <p class="stk-lead">').concat(L(
    "Вчера вы не заходили, и серия из ".concat(plural(st.lost, "дня", "дней", "дней"), " вот-вот сгорит. Сохраните её — и сегодня будет день ").concat(st.lost + 1, "."),
    "You missed yesterday, so your ".concat(st.lost, "-day streak is about to burn out. Save it and today becomes day ").concat(st.lost + 1, ".")
  ), "</p>\n    ").concat(C2 ? '<button class="btn-main" type="button" id="stkBuy">'.concat(L("Сохранить серию за ".concat(money(STK_SAVE_PRICE)), "Save the streak for ".concat(money(STK_SAVE_PRICE))), '</button>\n      <small class="stk-note">').concat(L("На счёте карьеры: ".concat(money(C2.bank || 0)), "Career bank: ".concat(money(C2.bank || 0))), "</small>") : "", "\n    ").concat(stkAd() ? '<button class="btn-ghost" type="button" id="stkSaveAd">🎬 '.concat(L("Сохранить за рекламу", "Save it by watching an ad"), "</button>") : "", '\n    <button class="btn-ghost" type="button" id="stkReset">').concat(L("Начать серию заново", "Start the streak over"), "</button></div>");
  if ($("viralPop")) $("viralPop").hidden = true;
  m.hidden = false;
  m.onclick = null;
  if ($("stkBuy")) $("stkBuy").onclick = () => {
    const c = careerNow();
    if (((c == null ? void 0 : c.bank) || 0) >= STK_SAVE_PRICE) {
      c.bank -= STK_SAVE_PRICE;
      careerSave(c);
      return keep("cash");
    }
    if (typeof openTopup === "function") openTopup({ need: STK_SAVE_PRICE - Math.max(0, (c == null ? void 0 : c.bank) || 0), why: L("Чтобы сохранить серию дней, не хватает у.е.", "You need a bit more to save your streak."), then: () => showStreakLost(st) });
  };
  if ($("stkSaveAd")) $("stkSaveAd").onclick = () => adWatch((ok) => {
    if (ok) keep("ad");
  }, { why: "streak_save", give: () => L("🔥 Серия спасена: день ".concat(st.lost + 1), "🔥 Streak saved: day ".concat(st.lost + 1)) });
  $("stkReset").onclick = () => {
    delete prefs.dayStreak.lost;
    store.set(KEY.prefs, prefs);
    showDayStreak();
  };
}
function showDayStreak() {
  const st = stkMark(), m = $("modal");
  if (st.lost && !st.claimed) return showStreakLost(st);
  const idx = (st.count - 1) % 7, base = STK_REWARDS[idx], chest = idx === 6;
  const bonus = chest ? 3 + Math.floor(Math.random() * 6) : 0, total = base + bonus;
  const strip = STK_REWARDS.map((n, i) => '<div class="stk-day'.concat(i < idx ? " got" : i === idx ? " now" : "").concat(i === 6 ? " chest" : "", '">\n      <small>').concat(L("день ".concat(i + 1), "day ".concat(i + 1)), '</small><span aria-hidden="true">').concat(i < idx ? "✓" : i === 6 ? "🎁" : "💰", "</span><b>+").concat(n, "</b></div>")).join("");
  m.innerHTML = '<div class="modal-box glass lvl-box stk-box" role="dialog" aria-modal="true" aria-labelledby="stkTitle"><span class="lvl-ico" aria-hidden="true">🔥</span>\n    <h2 id="stkTitle">'.concat(L("День ".concat(st.count, " подряд"), "Day ".concat(st.count, " in a row")), '</h2>\n    <p class="stk-lead">').concat(chest ? L("Семь дней без пропусков — вот это характер! Завтра начнётся новый круг наград.", "Seven days without missing one — impressive! Tomorrow a new round of rewards begins.") : st.count === 1 ? L("Заходите каждый день — награда растёт. Пропустите день, и серия начнётся заново.", "Come back every day and the reward grows. Miss a day and the streak starts over.") : L("Вы снова с нами — держите награду. Завтра будет больше, если не пропустите день.", "You’re back — here’s your reward. Tomorrow’s is bigger, as long as you don’t miss a day."), '</p>\n    <div class="stk-strip">').concat(strip, "</div>\n    ").concat(chest ? '<p class="stk-chest">'.concat(L("Сегодня ещё и бонус-сундук!", "Plus a bonus chest today!"), "</p>") : "", '\n    <button class="btn-main" type="button" id="stkGo">').concat(chest ? L("Забрать +".concat(money(base), " и открыть сундук"), "Claim ".concat(money(base), " and open the chest")) : L("Забрать +".concat(money(base)), "Claim ".concat(money(base))), "</button>\n    ").concat(stkAd() ? '<button class="btn-ghost" type="button" id="stkAd">🎬 '.concat(L("Удвоить за рекламу", "Double it with an ad"), "</button>") : "", "</div>");
  if ($("viralPop")) $("viralPop").hidden = true;
  m.hidden = false;
  m.onclick = null;
  const claim = (doubled) => {
    const now = addCash(total);
    prefs.dayStreak = { ...st, claimed: true };
    store.set(KEY.prefs, prefs);
    track("streak_claim", { detail: "".concat(st.count, ":").concat(total).concat(doubled ? ":x2" : "") });
    try {
      sfx.coins();
    } catch (e) {
    }
    if (chest) try {
      confetti();
    } catch (e) {
    }
    const box = m.querySelector(".stk-box");
    box.innerHTML = '<span class="lvl-ico" aria-hidden="true">'.concat(chest ? "🎁" : "💰", "</span><h2>+").concat(money(doubled ? total * 2 : total), '</h2>\n      <p class="stk-lead">').concat(chest ? L("В сундуке — ещё ".concat(money(bonus), "! "), "The chest had another ".concat(money(bonus), "! ")) : "").concat(doubled ? L("Награда удвоена. ", "Reward doubled. ") : "").concat(now ? L("Уже на счёте карьеры.", "Already in your career bank.") : L("Деньги придут в карьеру — начните её, и они будут на счёте.", "The money goes to your career — start one and it’ll be in your bank."), '</p>\n      <button class="btn-main" type="button" id="stkOk">').concat(L("Отлично", "Great"), "</button>");
    $("stkOk").onclick = stkClose;
  };
  $("stkGo").onclick = () => claim(false);
  if ($("stkAd")) $("stkAd").onclick = () => adWatch((ok) => {
    var _a;
    if (!ok || ((_a = prefs.dayStreak) == null ? void 0 : _a.claimed)) return;
    track("streak_double", { detail: "".concat(st.count, ":").concat(total) });
    claim(true);
  }, { why: "streak", give: () => {
    addCash(total);
    return L("🎬 Награда удвоена: ещё +".concat(money(total)), "🎬 Reward doubled: another ".concat(money(total)));
  } });
}
let stkTimer = 0;
function stkSchedule(delay = 2500) {
  clearTimeout(stkTimer);
  let tries = 0;
  const tick = () => {
    if (!stkDue()) return;
    if (!document.hidden && !views.menu.hidden && $("modal").hidden) return showDayStreak();
    if (++tries < 400) stkTimer = setTimeout(tick, 1500);
  };
  stkTimer = setTimeout(tick, delay);
}
dataReady.then(() => eventsReady).then(() => stkSchedule());
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) stkSchedule(1500);
});
