/* сгенерировано tools/make-legacy.js из js/pause.js — не править */
const PAUSE_STREAK = [[3, 3], [7, 7], [14, 15], [30, 30]];
const PAUSE_COLL = [[10, 5], [25, 10], [51, 25]];
const PAUSE_MID = 25, PAUSE_MID_BOOST = 5;
const dayNum = (d) => Math.round((/* @__PURE__ */ new Date(d + "T12:00:00")).getTime() / 864e5);
const pzStreak = () => store.get("vdp-pause-streak", { last: "", n: 0, best: 0, got: [], freeze: "" });
const pzTried = () => store.get("vdp-brk-tried", []);
const pzAlive = (s) => {
  if (!s.last) return 0;
  const gap = dayNum(today()) - dayNum(s.last);
  return gap <= 1 || gap === 2 && !pzFrozeRecently(s) ? s.n : 0;
};
const pzFrozeRecently = (s) => s.freeze && dayNum(today()) - dayNum(s.freeze) < 7;
function pzReward(n, why) {
  var _a;
  const now = addCash(n);
  (_a = sfx.win) == null ? void 0 : _a.call(sfx);
  buzz("tap");
  toast(L("".concat(why, ": +").concat(n, " у.е.").concat(now ? "" : " (придут в карьеру)"), "".concat(why, ": +$").concat(n).concat(now ? "" : " (goes to your career)")));
  if (now && typeof adDouble === "function") setTimeout(() => adDouble(n, why), 2600);
}
bus.on("breakEnd", (e) => {
  const tried = pzTried();
  if (!tried.includes(e.n)) {
    tried.push(e.n);
    store.set("vdp-brk-tried", tried);
    const m = PAUSE_COLL.find(([k]) => k === tried.length || k === 51 && tried.length >= BREAKS.length);
    if (m && !(prefs.pzColl || []).includes(m[0])) {
      prefs.pzColl = [...prefs.pzColl || [], m[0]];
      store.set(KEY.prefs, prefs);
      setTimeout(() => pzReward(m[1], L("🧩 Открыто ".concat(tried.length, " разминок"), "🧩 ".concat(tried.length, " breaks discovered"))), 3200);
    }
  }
  const s = pzStreak(), td = today();
  if (s.last !== td) {
    const gap = s.last ? dayNum(td) - dayNum(s.last) : 99;
    if (gap === 2 && !pzFrozeRecently(s)) {
      s.freeze = td;
      s.n++;
    } else s.n = gap === 1 ? s.n + 1 : 1;
    s.last = td;
    s.best = Math.max(s.best || 0, s.n);
    if (s.n === 1) s.got = [];
    const m = PAUSE_STREAK.find(([k]) => k === s.n);
    if (m && !s.got.includes(m[0])) {
      s.got.push(m[0]);
      setTimeout(() => pzReward(m[1], L("🔥 Серия пауз: ".concat(s.n, " дн. подряд"), "🔥 Break streak: ".concat(s.n, " days"))), 2400);
    }
    store.set("vdp-pause-streak", s);
    track("pause_streak", { detail: String(s.n) });
  }
  renderPauseRow();
});
function renderPauseRow() {
  const day = $("brkDay");
  if (!day) return;
  let row = $("pzRow");
  if (!row) row = Object.assign(document.createElement("div"), { id: "pzRow", className: "pz-row" });
  if (day.nextElementSibling !== row) day.after(row);
  const s = pzStreak(), n = pzAlive(s), done = brkToday().n, tried = pzTried().length;
  const next = PAUSE_STREAK.find(([k]) => k > n);
  const cups = Array.from({ length: BREAK_DAY_REWARDS }, (_, i) => '<i class="'.concat(i < done ? "on" : "", '">☕</i>')).join("");
  const playedToday = s.last === today();
  row.innerHTML = '<div class="pz-stats">\n      <span class="pz-chip '.concat(n ? "pz-fire" : "", '" title="').concat(L("Дней подряд с паузой", "Days in a row with a break"), '">🔥 <b>').concat(n, "</b> ").concat(L("дн.", "d")).concat(next ? "<small>".concat(L("ещё ".concat(next[0] - n, " до 🎁"), "".concat(next[0] - n, " to 🎁")), "</small>") : "", '</span>\n      <span class="pz-chip pz-cups" title="').concat(L("Паузы с наградой сегодня", "Rewarded breaks today"), '">').concat(cups, '</span>\n      <span class="pz-chip" title="').concat(L("Открыто разминок", "Breaks discovered"), '">🧩 <b>').concat(tried, "/").concat(BREAKS.length, "</b></span>\n    </div>\n    ").concat(n && !playedToday ? '<p class="pz-warn">'.concat(L("Сегодня ещё без паузы — серия ждёт одной разминки", "No break yet today — your streak needs just one"), "</p>") : "", '\n    <button type="button" class="btn-ghost pz-breath" id="pzBreath">🌬️ ').concat(L("Минута дыхания", "One-minute breathing"), "</button>");
  $("pzBreath").onclick = () => {
    track("pause_breath");
    playBreak(51);
  };
}
bus.on("menu", renderPauseRow);
renderPauseRow();
if (typeof openBreaks === "function") {
  const ob = openBreaks;
  openBreaks = function() {
    var _a;
    ob();
    const box = document.querySelector(".brk-box");
    if (!box) return;
    const tried = pzTried();
    box.querySelectorAll("[data-brk]").forEach((b) => {
      if (!tried.includes(+b.dataset.brk)) b.classList.add("brk-new");
    });
    const next = PAUSE_COLL.find(([k]) => k > tried.length);
    (_a = box.querySelector(".hero-lead")) == null ? void 0 : _a.insertAdjacentHTML("afterend", '<div class="pz-coll"><span>🧩 '.concat(L("Открыто ".concat(tried.length, " из ").concat(BREAKS.length), "".concat(tried.length, " of ").concat(BREAKS.length, " discovered"))).concat(next ? " · ".concat(L("ещё ".concat(Math.min(next[0], BREAKS.length) - tried.length, " — и +").concat(next[1], " у.е."), "".concat(Math.min(next[0], BREAKS.length) - tried.length, " more for +$").concat(next[1]))) : "", '</span><i style="width:').concat(Math.round(tried.length / BREAKS.length * 100), '%"></i></div>'));
  };
}
let pzMidActive = false;
bus.on("answer", () => {
  if (!S || S.mode !== "career" || prefs.brkNoAsk || pzMidActive) return;
  if ((prefs.gamesPlayed || 0) < 2 || typeof guestLocked === "function" && guestLocked()) return;
  if (S.pzAsked) return;
  const low = RES.find((r) => (r.k === "energy" || r.k === "psyche") && S.res[r.k] > 0 && S.res[r.k] < PAUSE_MID);
  if (!low || S.step < 3) return;
  setTimeout(() => {
    const quizOn = $("quiz") && !$("quiz").hidden;
    if (!S || S.pzAsked || busy || splashOn || quizOn || views.game.hidden || !views.end.hidden || !$("modal").hidden || RES.some((r) => S.res[r.k] <= 0 || S.res[r.k] >= 100)) return;
    S.pzAsked = true;
    const n = brkPick(), m = $("modal");
    m.innerHTML = '<div class="modal-box glass cert-box" role="dialog" aria-modal="true" aria-labelledby="pzTitle"><span class="lvl-ico" aria-hidden="true">😮‍💨</span>\n      <h2 id="pzTitle">'.concat(L("Тяжёлый день. Пауза?", "Rough day. Take a break?"), "</h2>\n      <p>").concat(L("«".concat(esc(low.name), "» на ").concat(S.res[low.k], "%. Минутка на разминку — и сразу +").concat(PAUSE_MID_BOOST, " к Энергии и Кукухе в этой неделе."), "".concat(esc(low.name), " is at ").concat(S.res[low.k], "%. A one-minute break gives +").concat(PAUSE_MID_BOOST, " Energy and Sanity right now.")), '</p>\n      <p class="pz-sub">').concat(L("Сегодня:", "Today:"), " <b>").concat(esc(brkTitle(n)), "</b> ").concat(L("или", "or"), ' <button type="button" class="btn-link" id="pzMidBreath">🌬️ ').concat(L("минута дыхания", "one-minute breathing"), '</button></p>\n      <button class="btn-main" type="button" id="pzMidGo">☕ ').concat(L("Сделать паузу", "Take a break"), '</button>\n      <button class="btn-link" type="button" id="pzMidNo">').concat(L("Работать дальше", "Keep working"), "</button></div>");
    m.hidden = false;
    track("pause_mid_offer", { detail: low.k });
    const go = (id) => {
      m.hidden = true;
      pzMidActive = true;
      window.vdpPaused = true;
      track("pause_mid_go", { detail: String(id) });
      playBreak(id, { mid: true, then: () => {
        pzMidActive = false;
        window.vdpPaused = false;
      } });
    };
    $("pzMidGo").onclick = () => go(n);
    $("pzMidBreath").onclick = () => go(51);
    $("pzMidNo").onclick = () => {
      m.hidden = true;
      track("pause_mid_skip");
    };
  }, (FX == null ? void 0 : FX.off) ? 500 : 1300);
});
bus.on("breakEnd", (e) => {
  if (!e.mid || !S) return;
  if (e.rewarded) {
    prefs.breakBuff = Math.max(0, (prefs.breakBuff || 0) - BREAK_BUFF);
    store.set(KEY.prefs, prefs);
  }
  S.res.energy = Math.min(95, S.res.energy + PAUSE_MID_BOOST);
  S.res.psyche = Math.min(95, S.res.psyche + PAUSE_MID_BOOST);
  renderBars();
  setTimeout(() => toast(L("☕ После паузы: Энергия и Кукуха +".concat(PAUSE_MID_BOOST), "☕ After the break: Energy and Sanity +".concat(PAUSE_MID_BOOST))), 400);
});
BREAKS.push([51, "relax", "🌬️", L("Минута дыхания", "One-minute breathing"), L("Вдох 4 секунды, пауза 2, выдох 6 — пять кругов. Просто следуйте за кругом", "Breathe in 4 s, hold 2, out 6 — five rounds. Just follow the circle")]);
window.BREAK_IMPL[51] = (root, api) => {
  const { L: L2 } = api, ROUNDS = 5, PH = [["in", 4, L2("Вдох", "Breathe in")], ["hold", 2, L2("Пауза", "Hold")], ["out", 6, L2("Выдох", "Breathe out")]];
  root.innerHTML = '<div class="br-wrap"><div class="br-ring"><div class="br-ball" id="brBall"></div><b class="br-word" id="brWord">'.concat(L2("Готовы?", "Ready?"), '</b><small class="br-sec" id="brSec"></small></div>\n    <p class="br-round" id="brRound">').concat(L2("Сядьте удобно и опустите плечи", "Sit comfortably and drop your shoulders"), '</p>\n    <button class="btn-main" type="button" id="brStart">').concat(L2("Начать", "Start"), "</button></div>");
  const ball = root.querySelector("#brBall"), word = root.querySelector("#brWord"), sec = root.querySelector("#brSec"), round = root.querySelector("#brRound");
  const timers = [];
  let alive = true;
  api.onExit(() => {
    alive = false;
    timers.forEach(clearTimeout);
  });
  const wait = (ms) => new Promise((ok) => timers.push(setTimeout(ok, ms)));
  root.querySelector("#brStart").onclick = async (e) => {
    var _a;
    e.target.remove();
    for (let r = 1; r <= ROUNDS && alive; r++) {
      round.textContent = L2("Круг ".concat(r, " из ").concat(ROUNDS), "Round ".concat(r, " of ").concat(ROUNDS));
      for (const [k, s, w] of PH) {
        if (!alive) return;
        word.textContent = w;
        ball.className = "br-ball br-".concat(k);
        ball.style.transitionDuration = "".concat(s, "s");
        if (k === "in") (_a = api.buzz) == null ? void 0 : _a.call(api, "tap");
        for (let i = s; i > 0 && alive; i--) {
          sec.textContent = i;
          await wait(1e3);
        }
      }
    }
    if (alive) api.end({ score: null, won: true, text: L2("Минута ваша. Можно возвращаться — спокойнее и с ясной головой.", "That minute was yours. Back to it — a bit calmer.") });
  };
};
